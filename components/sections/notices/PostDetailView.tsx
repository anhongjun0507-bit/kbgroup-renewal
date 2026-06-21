import Link from "next/link";
import { Container } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { adminEditPath, type BoardConfig } from "@/lib/boards";
import type { Post, Attachment } from "@/lib/posts";
import { deletePost } from "@/app/admin/posts/actions";
import { AttachmentView } from "./AttachmentView";
import { PostViewBump } from "./PostViewBump";

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

type Adjacent = { id: string; title: string } | null;

/** 소식 게시판 공통 상세 뷰 (본문·첨부·관리자 버튼·이전/다음). */
export function PostDetailView({
  config,
  post,
  attachments,
  isAdmin = false,
  prev = null,
  next = null,
}: {
  config: BoardConfig;
  post: Post;
  attachments: Attachment[];
  isAdmin?: boolean;
  prev?: Adjacent;
  next?: Adjacent;
}) {
  const hasContent = !!post.content && post.content.trim().length > 0;
  const isGallery = config.layout === "gallery";

  const Body = hasContent ? (
    <div className="whitespace-pre-wrap text-[16px] leading-[1.9] text-ink-muted md:text-[17px]">
      {post.content}
    </div>
  ) : null;

  const Attachments =
    attachments.length > 0 ? (
      <AttachmentView
        attachments={attachments}
        imageLayout={isGallery ? "grid" : "stack"}
      />
    ) : null;

  return (
    <article className="section bg-white">
      <PostViewBump id={post.id} />
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* 메타 바 */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
              {post.isPinned && (
                <span className="inline-flex items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                  공지
                </span>
              )}
              <span className="font-semibold text-ink-strong">{config.label}</span>
              <span aria-hidden="true" className="text-ink-faint">·</span>
              <time dateTime={post.createdAt} className="font-mono-num text-ink-faint">
                {formatDateTime(post.createdAt)}
              </time>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono-num text-[13px] text-ink-faint">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              조회 {post.viewCount}
            </span>
          </div>

          {/* 본문 + 첨부 (게시판 종류별 순서) */}
          <div className="space-y-10 py-10">
            {isGallery ? (
              <>
                {Attachments}
                {Body}
              </>
            ) : (
              <>
                {Body}
                {Attachments}
              </>
            )}
            {!hasContent && !Attachments && (
              <p className="text-[15px] text-ink-faint">내용이 없습니다.</p>
            )}
          </div>

          {/* 관리자 버튼 */}
          {isAdmin && (
            <div className="flex items-center justify-end gap-2 border-t border-line pt-6">
              <Link
                href={adminEditPath(config.type, post.id)}
                className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-[13px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
              >
                수정
              </Link>
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="board" value={config.type} />
                <input type="hidden" name="redirectTo" value={config.listPath} />
                <ConfirmButton
                  message="이 글을 삭제하시겠습니까? 첨부 파일도 함께 삭제되며 되돌릴 수 없습니다."
                  className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-[13px] font-semibold text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  삭제
                </ConfirmButton>
              </form>
            </div>
          )}

          {/* 이전·다음 */}
          {(prev || next) && (
            <nav
              aria-label="글 네비게이션"
              className="mt-12 grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2 sm:gap-4"
            >
              {next ? (
                <Link
                  href={`${config.listPath}/${next.id}`}
                  className="group rounded-md border border-line p-5 transition-colors duration-200 hover:border-navy-700 hover:bg-gray-50"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                    ← 다음 글
                  </p>
                  <p className="mt-2 line-clamp-1 font-display text-[15px] font-bold tracking-tight text-ink-strong group-hover:text-accent-deep">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {prev ? (
                <Link
                  href={`${config.listPath}/${prev.id}`}
                  className="group rounded-md border border-line p-5 text-right transition-colors duration-200 hover:border-navy-700 hover:bg-gray-50"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                    이전 글 →
                  </p>
                  <p className="mt-2 line-clamp-1 font-display text-[15px] font-bold tracking-tight text-ink-strong group-hover:text-accent-deep">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}

          <div className="mt-10 text-center">
            <Link
              href={config.listPath}
              className="inline-flex h-12 items-center gap-2 rounded-sm border border-ink-strong px-6 text-[14px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
            >
              ← {config.label} 목록으로
            </Link>
          </div>
        </div>
      </Container>
    </article>
  );
}
