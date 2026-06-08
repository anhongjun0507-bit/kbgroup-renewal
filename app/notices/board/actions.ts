"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 자유게시판(board_type='free') 서버 액션.
 * - 작성/수정: 로그인 필요. RLS(posts_insert/update_*)가 작성자·admin만 허용.
 * - 삭제: 작성자·admin만 (RLS).
 * - 조회수: increment_post_view RPC(SECURITY DEFINER)로 누구나 +1.
 */

export type PostFormState = {
  error: string | null;
  fieldErrors?: { title?: string; content?: string };
};

const TITLE_MAX = 200;

function validate(title: string, content: string): PostFormState["fieldErrors"] {
  const fe: PostFormState["fieldErrors"] = {};
  if (!title) fe.title = "제목을 입력해주세요.";
  else if (title.length > TITLE_MAX)
    fe.title = `제목은 ${TITLE_MAX}자 이내로 입력해주세요.`;
  if (!content) fe.content = "내용을 입력해주세요.";
  return fe;
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const fieldErrors = validate(title, content);
  if (Object.keys(fieldErrors!).length > 0) return { error: null, fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notices/board/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .single();
  const authorName =
    profile?.display_name?.trim() ||
    (profile?.email ?? user.email ?? "회원").split("@")[0];

  const { data, error } = await supabase
    .from("posts")
    .insert({
      board_type: "free",
      title,
      content,
      author_id: user.id,
      author_name: authorName,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: "글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  revalidatePath("/notices/board");
  redirect(`/notices/board/${data.id}`);
}

export async function updatePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!id) return { error: "잘못된 접근입니다." };
  const fieldErrors = validate(title, content);
  if (Object.keys(fieldErrors!).length > 0) return { error: null, fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/notices/board/${id}/edit`);

  const { data, error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", id)
    .eq("board_type", "free")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "수정 권한이 없거나 오류가 발생했습니다." };
  }

  revalidatePath(`/notices/board/${id}`);
  revalidatePath("/notices/board");
  redirect(`/notices/board/${id}`);
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS(posts_delete_author_or_admin)가 작성자·admin만 삭제 허용
  await supabase.from("posts").delete().eq("id", id).eq("board_type", "free");

  revalidatePath("/notices/board");
  redirect("/notices/board");
}

/** 상세 진입 시 조회수 +1 (SECURITY DEFINER RPC) */
export async function recordView(id: string) {
  if (!id) return;
  const supabase = await createClient();
  await supabase.rpc("increment_post_view", { p_id: id });
}
