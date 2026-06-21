"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import {
  getBoardConfig,
  isBoardType,
  postDetailPath,
  adminBoardPath,
  resolveMime,
  type BoardType,
} from "@/lib/boards";

/**
 * 소식 게시판(notice·gallery·news·resources) 관리자 액션.
 *
 * 업로드 전략: 파일은 브라우저가 Supabase Storage로 직접 업로드(Vercel 함수 본문 4.5MB
 * 제한 우회)하고, 이 서버 액션들은 (1) 글 본문 레코드 생성/수정, (2) 첨부 메타데이터 행
 * 삽입(finalizeAttachments)만 담당한다 — 모두 작은 JSON 페이로드.
 *
 * requireAdmin 가드 + RLS(posts/attachments/storage is_admin) 이중 방어.
 */

const TITLE_MAX = 200;

export type PostMutationResult = {
  ok: boolean;
  postId?: string;
  error?: string;
  fieldErrors?: { title?: string; content?: string };
};

export type FinalizeResult = { ok: boolean; error?: string };

export type AttachmentRecord = {
  path: string;
  name: string;
  size: number;
  mime: string;
  order: number;
};

function validateText(
  board: BoardType,
  title: string,
  content: string,
): PostMutationResult["fieldErrors"] | null {
  const config = getBoardConfig(board);
  const fe: NonNullable<PostMutationResult["fieldErrors"]> = {};
  if (!title) fe.title = "제목을 입력해주세요.";
  else if (title.length > TITLE_MAX)
    fe.title = `제목은 ${TITLE_MAX}자 이내로 입력해주세요.`;
  if (config.contentRequired && !content) fe.content = "내용을 입력해주세요.";
  return Object.keys(fe).length > 0 ? fe : null;
}

function revalidateBoard(board: BoardType, id?: string) {
  const config = getBoardConfig(board);
  revalidatePath(adminBoardPath(board));
  revalidatePath("/admin/posts");
  revalidatePath(config.listPath);
  if (id) revalidatePath(postDetailPath(board, id));
}

/** 글 본문 생성 (첨부는 이후 finalizeAttachments로). */
export async function createPostRecord(input: {
  board: string;
  title: string;
  content: string;
  isPinned: boolean;
}): Promise<PostMutationResult> {
  const { supabase, user, profile } = await requireAdmin();
  if (!isBoardType(input.board)) return { ok: false, error: "잘못된 게시판입니다." };
  const board = input.board;
  const title = input.title.trim();
  const content = input.content.trim();

  const fieldErrors = validateText(board, title, content);
  if (fieldErrors) return { ok: false, fieldErrors };

  const authorName = profile?.display_name?.trim() || "관리자";
  const { data, error } = await supabase
    .from("posts")
    .insert({
      board_type: board,
      title,
      content: content || null,
      author_id: user.id,
      author_name: authorName,
      is_pinned: input.isPinned,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidateBoard(board, data.id);
  return { ok: true, postId: data.id };
}

/** 글 본문 수정. */
export async function updatePostRecord(input: {
  id: string;
  board: string;
  title: string;
  content: string;
  isPinned: boolean;
}): Promise<PostMutationResult> {
  const { supabase } = await requireAdmin();
  if (!input.id) return { ok: false, error: "잘못된 접근입니다." };
  if (!isBoardType(input.board)) return { ok: false, error: "잘못된 게시판입니다." };
  const board = input.board;
  const title = input.title.trim();
  const content = input.content.trim();

  const fieldErrors = validateText(board, title, content);
  if (fieldErrors) return { ok: false, fieldErrors };

  const { error } = await supabase
    .from("posts")
    .update({ title, content: content || null, is_pinned: input.isPinned })
    .eq("id", input.id)
    .eq("board_type", board);
  if (error) return { ok: false, error: "글 수정 중 오류가 발생했습니다." };

  revalidateBoard(board, input.id);
  return { ok: true, postId: input.id };
}

/**
 * 브라우저가 Storage에 올린 파일들의 메타데이터 행을 삽입.
 * MIME 화이트리스트 검증 + 게시판별 개수 트리거(check_attachment_count)가 backstop.
 */
export async function finalizeAttachments(input: {
  postId: string;
  board: string;
  records: AttachmentRecord[];
}): Promise<FinalizeResult> {
  const { supabase } = await requireAdmin();
  if (!input.postId || !isBoardType(input.board))
    return { ok: false, error: "잘못된 접근입니다." };
  const config = getBoardConfig(input.board);
  if (!config.attach) return { ok: false, error: "이 게시판은 첨부를 지원하지 않습니다." };
  if (input.records.length === 0) return { ok: true };

  const { bucket, mimes, max } = config.attach;

  for (const r of input.records) {
    if (!mimes.includes(r.mime)) {
      // 잘못된 형식 — 이미 올라간 객체 정리
      await supabase.storage.from(bucket).remove([r.path]);
      return { ok: false, error: `"${r.name}" — 허용되지 않는 파일 형식입니다.` };
    }
  }

  const rows = input.records.map((r) => ({
    post_id: input.postId,
    bucket,
    storage_path: r.path,
    file_name: r.name,
    file_size: r.size,
    mime_type: r.mime,
    display_order: r.order,
  }));

  const { error } = await supabase.from("attachments").insert(rows);
  if (error) {
    // 트리거 초과 등 — 방금 올린 객체 정리
    await supabase.storage.from(bucket).remove(input.records.map((r) => r.path));
    return {
      ok: false,
      error: `첨부 등록에 실패했습니다 (최대 ${max}개). ${error.message}`,
    };
  }

  revalidateBoard(input.board, input.postId);
  return { ok: true };
}

// ── 폼 액션 (작은 페이로드 — 서버에서 직접 처리) ──────────────────────────────

type ExistingAttachment = {
  id: string;
  bucket: string;
  storage_path: string;
};

async function removeAttachmentRows(
  supabase: SupabaseClient,
  rows: ExistingAttachment[],
) {
  if (rows.length === 0) return;
  const byBucket = new Map<string, string[]>();
  for (const r of rows) {
    const arr = byBucket.get(r.bucket);
    if (arr) arr.push(r.storage_path);
    else byBucket.set(r.bucket, [r.storage_path]);
  }
  for (const [bucket, paths] of byBucket) {
    await supabase.storage.from(bucket).remove(paths);
  }
  await supabase
    .from("attachments")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    );
}

/** 개별 첨부 삭제 (수정 화면). */
export async function deleteAttachment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const attachmentId = String(formData.get("attachmentId") ?? "");
  const board = String(formData.get("board") ?? "");
  const postId = String(formData.get("postId") ?? "");
  if (!attachmentId) return;

  const { data } = await supabase
    .from("attachments")
    .select("id, bucket, storage_path")
    .eq("id", attachmentId)
    .maybeSingle();
  if (data) await removeAttachmentRows(supabase, [data as ExistingAttachment]);
  if (isBoardType(board)) revalidateBoard(board, postId);
}

/** 상단 고정 토글 (관리 목록). */
export async function togglePin(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const board = String(formData.get("board") ?? "");
  if (!id || !isBoardType(board)) return;

  const { data } = await supabase
    .from("posts")
    .select("is_pinned")
    .eq("id", id)
    .eq("board_type", board)
    .maybeSingle();
  if (!data) return;
  await supabase
    .from("posts")
    .update({ is_pinned: !data.is_pinned })
    .eq("id", id)
    .eq("board_type", board);
  revalidateBoard(board, id);
}

/** 게시글 삭제 (첨부 Storage 객체 + 행 cascade). redirectTo 있으면 이동. */
export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const board = String(formData.get("board") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");
  if (!id || !isBoardType(board)) return;

  const { data } = await supabase
    .from("attachments")
    .select("id, bucket, storage_path")
    .eq("post_id", id);
  await removeAttachmentRows(supabase, (data ?? []) as ExistingAttachment[]);

  await supabase.from("posts").delete().eq("id", id).eq("board_type", board);
  revalidateBoard(board, id);

  if (redirectTo) redirect(redirectTo);
}
