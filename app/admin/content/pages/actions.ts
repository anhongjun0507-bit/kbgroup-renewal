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
 *    **동작한다.** 라이브에서 페이지 404 와 메뉴 제외가 **1초** 만에 걸리는 것을 실측했다.
 *  · `revalidatePath("/sitemap.xml")` — 정적 라우트(`/sitemap.xml`, revalidate 1h)를 노린 것.
 *    **프로덕션에서는 효과가 없었다.** 이 줄을 넣고 재배포한 뒤에도 sitemap 은 191 그대로였다
 *    (2026-08-26 · `dpl_7tLisAFT1m6rt2AghkMTBov8CbCw` 실측, PROGRESS §22).
 *    로컬 `next start` 에서는 `updateTag` 만으로도 전파됐다 — §11-5 가 경고한 로컬↔프로덕션 차이다.
 *    **줄은 남겨 둔다.** 의도가 옳고 부작용이 없으며, Next/Vercel 쪽이 바뀌면 그때 동작한다.
 *    경로 **1개**만 지정한다 — `revalidatePath("/", "layout")` 광역 무효화는 쓰지 않는다(E-12).
 *
 * 남은 영향: 페이지를 비공개로 돌려도 sitemap 에는 최대 1시간 그 URL 이 남는다.
 * 해당 URL 로 들어오면 **404 는 즉시** 걸리므로 실피해는 검색엔진이 잠시 죽은 링크를 보는 정도다.
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
