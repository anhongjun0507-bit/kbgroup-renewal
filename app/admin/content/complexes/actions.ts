"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";

/**
 * 단지 관리 Server Actions (PLAN B / DAY 3-1).
 *
 * 공통 규약:
 *  · 모든 진입부에서 requireAdmin() — RLS(public.is_admin())와 이중 방어.
 *  · 저장 전 직전 값을 content_revisions 에 스냅샷으로 적재 (롤백 레벨 1).
 *  · updated_at 낙관적 잠금 (E-8). 충돌 시 덮어쓰지 않고 경고만 돌려준다.
 *  · slug 는 절대 수정하지 않는다 (E-1). DB 트리거로도 물리 차단돼 있다.
 *  · 무효화는 content:complexes 태그 하나 (E-12). 단지 데이터는 캐시 엔트리 1개라
 *    153개 상세 경로 광역 재검증이 발생하지 않는다. revalidatePath 는 쓰지 않는다.
 */

const ADMIN_LIST = "/admin/content/complexes";

export type ComplexFormState = {
  error: string | null;
  /** 낙관적 잠금 충돌 — 폼 값을 유지한 채 경고만 띄우기 위해 별도 플래그로 둔다. */
  conflict?: boolean;
  fieldErrors?: { name?: string; region?: string; households?: string; area?: string };
};

const SNAPSHOT_COLUMNS =
  "id, slug, name, client, region, households, area, scope, period, kind, type, image, images, aliases, is_featured, is_active, sort_order, created_at, updated_at";

type Parsed = {
  values: Record<string, unknown>;
  fieldErrors: NonNullable<ComplexFormState["fieldErrors"]>;
  imageFile: File | null;
};

function toLines(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 빈 문자열은 null 로. 숫자 필드는 미입력과 0 을 구분한다. */
function toNumberOrNull(
  raw: string,
  label: string,
  errors: Record<string, string>,
  key: string,
): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) {
    errors[key] = `${label}은(는) 0 이상의 숫자로 입력해주세요.`;
    return null;
  }
  return n;
}

function parseForm(formData: FormData): Parsed {
  const fieldErrors: Record<string, string> = {};
  const name = String(formData.get("name") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  if (!name) fieldErrors.name = "단지명을 입력해주세요.";
  if (name.length > 200) fieldErrors.name = "단지명은 200자 이내여야 합니다.";

  const rawType = String(formData.get("type") ?? "").trim();
  const type = rawType === "LH" || rawType === "민간" || rawType === "공공" ? rawType : null;

  const file = formData.get("imageFile");
  const imageFile = file instanceof File && file.size > 0 ? file : null;

  return {
    values: {
      name,
      region,
      client: String(formData.get("client") ?? "").trim() || null,
      households: toNumberOrNull(
        String(formData.get("households") ?? ""),
        "세대수",
        fieldErrors,
        "households",
      ),
      area: toNumberOrNull(String(formData.get("area") ?? ""), "관리면적", fieldErrors, "area"),
      type,
      period: String(formData.get("period") ?? "").trim() || null,
      aliases: toLines(formData.get("aliases")),
      image: String(formData.get("image") ?? "").trim() || null,
      images: toLines(formData.get("images")),
      is_featured: formData.get("isFeatured") === "on",
      is_active: formData.get("isActive") === "on",
      sort_order: Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
    },
    fieldErrors,
    imageFile,
  };
}

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/** 업로드한 이미지를 site-images 버킷에 넣고 공개 URL 을 돌려준다. */
async function uploadImage(
  supabase: Supabase,
  slug: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  // 파일명은 ASCII 로만 만든다 — 한글 단지명을 그대로 쓰면 Storage 키가 깨진다.
  const path = `complexes/${slug}-${Date.now()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `이미지 업로드 실패: ${error.message}` };
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

/** 저장 직전 값을 감사 테이블에 남긴다. 실패해도 본 저장은 막지 않되 로그는 남긴다. */
async function snapshot(supabase: Supabase, row: Record<string, unknown>, actorId: string) {
  const { error } = await supabase.from("content_revisions").insert({
    table_name: "complexes",
    record_id: String(row.id),
    snapshot: row as never,
    actor_id: actorId,
  });
  if (error) console.error("[complexes] content_revisions 적재 실패:", error.message);
}

/** slug 는 최초 생성 시 encodeURIComponent(name). 충돌 시에만 -2, -3 … 을 덧붙인다. */
async function buildSlug(supabase: Supabase, name: string): Promise<string> {
  const base = encodeURIComponent(name);
  const { data } = await supabase.from("complexes").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error("slug 후보 소진");
}

export async function createComplex(
  _prev: ComplexFormState,
  formData: FormData,
): Promise<ComplexFormState> {
  const { supabase } = await requireAdmin(`${ADMIN_LIST}/new`);
  const { values, fieldErrors, imageFile } = parseForm(formData);
  if (Object.keys(fieldErrors).length > 0) return { error: null, fieldErrors };

  const slug = await buildSlug(supabase, values.name as string);

  if (imageFile) {
    const up = await uploadImage(supabase, slug, imageFile);
    if ("error" in up) return { error: up.error };
    values.image = up.url;
  }

  const { error } = await supabase.from("complexes").insert({ ...values, slug } as never);
  if (error) {
    console.error("[complexes] insert 실패:", error.message);
    return { error: "단지 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  updateTag(CONTENT_TAGS.complexes);
  redirect(ADMIN_LIST);
}

export async function updateComplex(
  _prev: ComplexFormState,
  formData: FormData,
): Promise<ComplexFormState> {
  const { supabase, user } = await requireAdmin(ADMIN_LIST);
  const id = String(formData.get("id") ?? "");
  const expectedUpdatedAt = String(formData.get("updatedAt") ?? "");
  if (!id || !expectedUpdatedAt) return { error: "잘못된 접근입니다." };

  const { values, fieldErrors, imageFile } = parseForm(formData);
  if (Object.keys(fieldErrors).length > 0) return { error: null, fieldErrors };

  const { data: current, error: readError } = await supabase
    .from("complexes")
    .select(SNAPSHOT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (readError || !current) return { error: "단지를 찾을 수 없습니다." };

  // E-8 — 폼을 연 뒤 다른 관리자가 저장했다면 덮어쓰지 않는다.
  if (current.updated_at !== expectedUpdatedAt) {
    return {
      error: null,
      conflict: true,
    };
  }

  if (imageFile) {
    const up = await uploadImage(supabase, current.slug, imageFile);
    if ("error" in up) return { error: up.error };
    values.image = up.url;
  }

  await snapshot(supabase, current as unknown as Record<string, unknown>, user.id);

  // slug 는 payload 에 넣지 않는다 (E-1). 낙관적 잠금은 updated_at 일치 조건으로 한 번 더 건다.
  const { data: updated, error } = await supabase
    .from("complexes")
    .update(values as never)
    .eq("id", id)
    .eq("updated_at", expectedUpdatedAt)
    .select("id");
  if (error) {
    console.error("[complexes] update 실패:", error.message);
    return { error: "단지 수정 중 오류가 발생했습니다." };
  }
  if (!updated || updated.length === 0) return { error: null, conflict: true };

  updateTag(CONTENT_TAGS.complexes);
  redirect(ADMIN_LIST);
}

export async function deleteComplex(formData: FormData) {
  const { supabase, user } = await requireAdmin(ADMIN_LIST);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: current } = await supabase
    .from("complexes")
    .select(SNAPSHOT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!current) return;

  await snapshot(supabase, current as unknown as Record<string, unknown>, user.id);

  const { error } = await supabase.from("complexes").delete().eq("id", id);
  if (error) {
    console.error("[complexes] delete 실패:", error.message);
    return;
  }
  updateTag(CONTENT_TAGS.complexes);
}

/** 목록에서 현재/과거 전환. 단지명 수정 없이 상태만 바꾸는 잦은 작업이라 별도 액션으로 둔다. */
export async function toggleComplexActive(formData: FormData) {
  const { supabase, user } = await requireAdmin(ADMIN_LIST);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: current } = await supabase
    .from("complexes")
    .select(SNAPSHOT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!current) return;

  await snapshot(supabase, current as unknown as Record<string, unknown>, user.id);

  const { error } = await supabase
    .from("complexes")
    .update({ is_active: !current.is_active })
    .eq("id", id)
    .eq("updated_at", current.updated_at);
  if (error) {
    console.error("[complexes] toggle 실패:", error.message);
    return;
  }
  updateTag(CONTENT_TAGS.complexes);
}
