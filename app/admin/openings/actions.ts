"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

/**
 * 채용 공고 관리 (admin 전용 — requireAdmin 가드 + RLS 이중 방어).
 * 배열 필드(주요업무·자격요건·우대사항)는 textarea 줄 단위로 입력받아 파싱.
 */

export type OpeningFormState = {
  error: string | null;
  fieldErrors?: { title?: string };
};

function toLines(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  return {
    title,
    type: String(formData.get("type") ?? "").trim() || "수시채용",
    location: String(formData.get("location") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim() || null,
    responsibilities: toLines(formData.get("responsibilities")),
    requirements: toLines(formData.get("requirements")),
    preferred: toLines(formData.get("preferred")),
    apply_method: String(formData.get("applyMethod") ?? "").trim() || null,
    apply_email: String(formData.get("applyEmail") ?? "").trim() || null,
    deadline: String(formData.get("deadline") ?? "").trim() || null,
    is_published: formData.get("isPublished") === "on",
    sort_order:
      Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

function revalidateAll(id?: string) {
  revalidatePath("/admin/openings");
  revalidatePath("/careers");
  revalidatePath("/careers/openings");
  if (id) revalidatePath(`/careers/openings/${id}`);
}

export async function createOpening(
  _prev: OpeningFormState,
  formData: FormData,
): Promise<OpeningFormState> {
  const { supabase } = await requireAdmin();
  const payload = parseForm(formData);
  if (!payload.title) {
    return { error: null, fieldErrors: { title: "직무명을 입력해주세요." } };
  }

  const { error } = await supabase.from("job_openings").insert(payload);
  if (error) {
    return { error: "공고 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidateAll();
  redirect("/admin/openings");
}

export async function updateOpening(
  _prev: OpeningFormState,
  formData: FormData,
): Promise<OpeningFormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "잘못된 접근입니다." };

  const payload = parseForm(formData);
  if (!payload.title) {
    return { error: null, fieldErrors: { title: "직무명을 입력해주세요." } };
  }

  const { error } = await supabase
    .from("job_openings")
    .update(payload)
    .eq("id", id);
  if (error) {
    return { error: "공고 수정 중 오류가 발생했습니다." };
  }

  revalidateAll(id);
  redirect("/admin/openings");
}

export async function deleteOpening(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("job_openings").delete().eq("id", id);
  revalidateAll(id);
}

/** 채용 페이지 노출 on/off 토글 */
export async function togglePublish(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { data } = await supabase
    .from("job_openings")
    .select("is_published")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  await supabase
    .from("job_openings")
    .update({ is_published: !data.is_published })
    .eq("id", id);
  revalidateAll(id);
}
