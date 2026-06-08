import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ViewBump } from "@/components/sections/board/ViewBump";
import { Comments, type CommentRow } from "@/components/sections/board/Comments";
import { getViewer } from "@/lib/auth";
import { deletePost } from "../actions";

type Params = { id: string };

export const dynamic = "force-dynamic";

function formatDateTime(iso: string): string {
  return new Date(iso)
    .toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\.\s/g, ".");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const { supabase } = await getViewer();
  const { data: post } = await supabase
    .from("posts")
    .select("title")
    .eq("id", id)
    .eq("board_type", "free")
    .maybeSingle();
  return {
    title: post
      ? `${post.title} | 자유게시판 | (주)케이비개발`
      : "자유게시판 | (주)케이비개발",
    robots: { index: false, follow: false },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const { user, isAdmin, supabase } = await getViewer();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", "free")
    .maybeSingle();

  if (!post) notFound();

  const canManage = !!user && (user.id === post.author_id || isAdmin);

  const { data: commentRows } = await supabase
    .from("post_comments")
    .select("id, parent_id, author_id, author_name, content, created_at")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });
  const comments = (commentRows ?? []) as CommentRow[];

  return (
    <>
      <ViewBump id={post.id} />
      <PageHero
        kicker="COMMUNITY · 자유게시판"
        title={post.title}
        italicWord=""
        subtitle={`${post.author_name ?? "회원"} · ${formatDateTime(post.created_at)}`}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "BOARD", href: "/notices/board" },
          { label: "POST" },
        ]}
      />

      <article className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* 메타 바 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-strong">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700"
                  >
                    {(post.author_name ?? "회").charAt(0)}
                  </span>
                  {post.author_name ?? "회원"}
                </span>
                <span aria-hidden="true" className="text-ink-faint">·</span>
                <time
                  dateTime={post.created_at}
                  className="font-mono-num text-ink-faint"
                >
                  {formatDateTime(post.created_at)}
                </time>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono-num text-[13px] text-ink-faint">
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                조회 {post.view_count}
              </span>
            </div>

            {/* 본문 */}
            <div className="min-h-[160px] whitespace-pre-wrap py-10 text-[16px] leading-[1.9] text-ink-muted md:text-[17px]">
              {post.content}
            </div>

            {/* 관리 버튼 (작성자·admin) */}
            {canManage && (
              <div className="flex items-center justify-end gap-2 border-t border-line pt-6">
                <Link
                  href={`/notices/board/${post.id}/edit`}
                  className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-[13px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
                >
                  수정
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <ConfirmButton
                    message="이 글을 삭제하시겠습니까? 되돌릴 수 없습니다."
                    className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-[13px] font-semibold text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    삭제
                  </ConfirmButton>
                </form>
              </div>
            )}

            {/* 댓글·답글 */}
            <Comments
              postId={post.id}
              comments={comments}
              viewer={{ userId: user?.id ?? null, isAdmin }}
            />

            {/* 목록 버튼 */}
            <div className="mt-12 text-center">
              <Link
                href="/notices/board"
                className="inline-flex h-12 items-center gap-2 rounded-sm border border-ink-strong px-6 text-[14px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
              >
                ← 목록으로
              </Link>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}
