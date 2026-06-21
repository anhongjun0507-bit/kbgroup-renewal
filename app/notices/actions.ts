"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 소식 게시판 공개 액션 (비관리자 포함).
 * 조회수 +1 — increment_post_view RPC(SECURITY DEFINER, anon/authenticated 실행 허용).
 */
export async function recordPostView(id: string) {
  if (!id) return;
  const supabase = await createClient();
  await supabase.rpc("increment_post_view", { p_id: id });
}
