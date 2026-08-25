"use server";

import { updateTag } from "next/cache";
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
 * 무효화는 content:pages 태그 하나 — 메뉴(Header/Footer)·sitemap 이 같이 이 태그를 본다.
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
}
