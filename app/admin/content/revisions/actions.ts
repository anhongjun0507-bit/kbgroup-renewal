"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { restoreRevision } from "@/lib/content/revisions";
import { BOARD_CATEGORIES_KEY } from "@/lib/board-categories";

/**
 * 변경 이력 복원 Server Action (PLAN B / DAY 9, 지시 9-3).
 *
 * 결과 문구는 쿼리스트링으로 되돌려준다 — 복원은 폼 상태를 유지할 이유가 없고,
 * 목록이 새 리비전(복원 직전 값)까지 포함해 다시 그려져야 하기 때문이다.
 * 무효화는 바뀐 테이블의 태그만 건드린다(E-12).
 */
export async function restoreRevisionAction(formData: FormData): Promise<void> {
  const revisionId = String(formData.get("revisionId") ?? "");
  const backTo = String(formData.get("backTo") ?? "/admin/content/revisions");

  const { supabase, user } = await requireAdmin("/admin/content/revisions");
  const result = await restoreRevision(supabase, revisionId, user.id);

  if ("error" in result) {
    redirect(`${backTo}${backTo.includes("?") ? "&" : "?"}err=${encodeURIComponent(result.error)}`);
  }

  const table = String(formData.get("table") ?? "");
  const record = String(formData.get("record") ?? "");
  if (table === "complexes") {
    updateTag(CONTENT_TAGS.complexes);
  } else {
    updateTag(CONTENT_TAGS.settings);
    /* 게시판 카테고리는 site_settings 행이지만 캐시 엔트리가 따로다. */
    if (record === BOARD_CATEGORIES_KEY) updateTag(CONTENT_TAGS.boards);
  }

  redirect(`${backTo}${backTo.includes("?") ? "&" : "?"}ok=${encodeURIComponent(result.ok)}`);
}
