import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BoardType } from "@/lib/boards";

/**
 * 소식 게시판(posts) 데이터 접근 — 서버 전용.
 *
 * 읽기는 모두 RLS posts_select_public(익명 포함 누구나)로 통과하므로 일반 클라이언트 사용.
 * 첨부 파일 공개 URL은 public 버킷이므로 환경변수로 직접 구성(클라이언트 불필요).
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Post = {
  id: string;
  board: BoardType;
  postNumber: number;
  title: string;
  content: string | null;
  authorName: string | null;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Attachment = {
  id: string;
  postId: string;
  bucket: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  displayOrder: number;
  /** 공개 URL (인라인 표시용) */
  url: string;
  /** 다운로드 URL (원본 파일명 강제) */
  downloadUrl: string;
};

type PostRow = {
  id: string;
  board_type: string;
  post_number: number;
  title: string;
  content: string | null;
  author_name: string | null;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

type AttachmentRow = {
  id: string;
  post_id: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  display_order: number;
};

/** public 버킷 객체 공개 URL */
export function storagePublicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const enc = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${enc}`;
}

function mapPost(r: PostRow): Post {
  return {
    id: r.id,
    board: r.board_type as BoardType,
    postNumber: r.post_number,
    title: r.title,
    content: r.content,
    authorName: r.author_name,
    isPinned: r.is_pinned,
    viewCount: r.view_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapAttachment(r: AttachmentRow): Attachment {
  const url = storagePublicUrl(r.bucket, r.storage_path);
  return {
    id: r.id,
    postId: r.post_id,
    bucket: r.bucket,
    storagePath: r.storage_path,
    fileName: r.file_name,
    fileSize: r.file_size,
    mimeType: r.mime_type,
    displayOrder: r.display_order,
    url,
    downloadUrl: `${url}?download=${encodeURIComponent(r.file_name)}`,
  };
}

const POST_COLS =
  "id, board_type, post_number, title, content, author_name, is_pinned, view_count, created_at, updated_at";

/** 게시판 목록 (상단고정 우선, 최신순) + 총 개수. q는 제목 검색. */
export async function listPosts(
  board: BoardType,
  { page = 1, pageSize = 12, q = "" }: { page?: number; pageSize?: number; q?: string } = {},
): Promise<{ posts: Post[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("posts")
    .select(POST_COLS, { count: "exact" })
    .eq("board_type", board);
  if (q) query = query.ilike("title", `%${q}%`);
  query = query
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, count } = await query;
  return {
    posts: ((data ?? []) as PostRow[]).map(mapPost),
    total: count ?? 0,
  };
}

/** 단일 게시글 (board_type 일치 강제) */
export const getPost = cache(
  async (board: BoardType, id: string): Promise<Post | null> => {
    if (!UUID_RE.test(id)) return null;
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select(POST_COLS)
      .eq("id", id)
      .eq("board_type", board)
      .maybeSingle();
    return data ? mapPost(data as PostRow) : null;
  },
);

/** 특정 게시글 첨부 (display_order 오름차순) */
export async function getAttachments(postId: string): Promise<Attachment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attachments")
    .select("*")
    .eq("post_id", postId)
    .order("display_order", { ascending: true });
  return ((data ?? []) as AttachmentRow[]).map(mapAttachment);
}

/** 여러 게시글의 첨부를 한 번에 (목록 썸네일/다운로드용) → postId별 그룹 Map */
export async function getAttachmentsForPosts(
  postIds: string[],
): Promise<Map<string, Attachment[]>> {
  const map = new Map<string, Attachment[]>();
  if (postIds.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("attachments")
    .select("*")
    .in("post_id", postIds)
    .order("display_order", { ascending: true });
  for (const row of (data ?? []) as AttachmentRow[]) {
    const a = mapAttachment(row);
    const arr = map.get(a.postId);
    if (arr) arr.push(a);
    else map.set(a.postId, [a]);
  }
  return map;
}

/** 이전·다음 글 (post_number 기준 — 다음=더 큰 번호, 이전=더 작은 번호) */
export async function getAdjacentPosts(
  board: BoardType,
  postNumber: number,
): Promise<{ prev: Pick<Post, "id" | "title"> | null; next: Pick<Post, "id" | "title"> | null }> {
  const supabase = await createClient();
  const [{ data: prevRows }, { data: nextRows }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title")
      .eq("board_type", board)
      .lt("post_number", postNumber)
      .order("post_number", { ascending: false })
      .limit(1),
    supabase
      .from("posts")
      .select("id, title")
      .eq("board_type", board)
      .gt("post_number", postNumber)
      .order("post_number", { ascending: true })
      .limit(1),
  ]);
  return {
    prev: prevRows?.[0] ?? null,
    next: nextRows?.[0] ?? null,
  };
}

/** 게시판별 게시글 수 (관리자 허브) */
export async function countByBoard(
  board: BoardType,
): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("board_type", board);
  return count ?? 0;
}
