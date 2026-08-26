"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { findPublicPage } from "@/lib/pages/registry";

/**
 * 페이지 공개·비공개(pages) Server Action (PLAN B / DAY 8, ITEM 03).
 *
 * 계약 범위는 노출 토글까지다 — 신규 생성·삭제·경로 편집은 없다(PROGRESS §3).
 * 그래서 `path` 는 반드시 코드 레지스트리(`lib/pages/registry.ts`)에 있는 값이어야 하고,
 * `togglable: false`(메인)는 서버에서도 거부한다. UI 에서도 토글이 잠겨 있다.
 *
 * 행이 없는 상태 = 공개다. 첫 토글에서 upsert 로 행이 생긴다.
 *
 * 무효화는 두 갈래다.
 *  · `updateTag("content:pages")` — 메뉴(Header/Footer)와 게이트가 보는 데이터 캐시.
 *    라이브에서 페이지 404 와 메뉴 제외가 **1초** 만에 걸리는 것을 실측했다.
 *  · `revalidatePath("/sitemap.xml")` — **정적 라우트 캐시.** 태그 무효화가 여기까지는
 *    전파되지 않는다. 로컬 `next start` 에서는 전파돼서 DAY 8 에 놓쳤고, 2026-08-26
 *    프로덕션 실측에서 드러났다(PROGRESS §21-3). 「로컬에서 됐다」는 프로덕션 검증이 아니다.
 *    경로 **1개**만 지정한다 — `revalidatePath("/", "layout")` 광역 무효화는 쓰지 않는다(E-12).
 *
 * sitemap 에 영향을 주는 Server Action 은 이것 하나뿐이라 다른 액션에는 넣지 않는다.
 */
export async function togglePagePublished(formData: FormData): Promise<void> {
  const path = String(formData.get("path") ?? "");

  const meta = findPublicPage(path);
  if (!meta) throw new Error(`알 수 없는 페이지 경로: ${path}`);
  if (!meta.togglable)
    throw new Error(`이 페이지는 비공개로 돌릴 수 없습니다: ${meta.label}`);

  const { supabase } = await requireAdmin("/admin/content/pages");

  const { data, error: readError } = await supabase
    .from("pages")
    .select("is_published")
    .eq("path", path)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const next = !(data?.is_published ?? true);
  const { error } = await supabase
    .from("pages")
    .upsert(
      { path, title: meta.label, is_published: next },
      { onConflict: "path" },
    );
  if (error) throw new Error(error.message);

  updateTag(CONTENT_TAGS.pages);
  revalidatePath("/sitemap.xml");
}
