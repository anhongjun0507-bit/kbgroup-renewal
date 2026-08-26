import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import {
  isBoardType,
  adminNewPath,
  adminEditPath,
  postDetailPath,
} from "@/lib/boards";
import { getBoardConfigWithOverride } from "@/lib/board-categories";
import { listPosts, getAttachmentsForPosts } from "@/lib/posts";
import { deletePost, togglePin } from "../actions";

export const metadata: Metadata = {
  title: "관리자 · 소식 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
}

export default async function AdminBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { board } = await params;
  if (!isBoardType(board)) notFound();
  const config = await getBoardConfigWithOverride(board);

  await requireAdmin(`/admin/posts/${board}`);

  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { posts, total } = await listPosts(board, { page, pageSize: PAGE_SIZE });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const attachMap = await getAttachmentsForPosts(posts.map((p) => p.id));

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="posts" />

        <div className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-accent-deep">
              ADMIN · 소식 관리 ·{" "}
              <Link href="/admin/posts" className="underline-offset-2 hover:underline">
                전체
              </Link>
            </p>
            <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
              {config.label} 관리
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              총 <span className="font-semibold text-ink-strong">{total}</span>건
            </p>
          </div>
          <Link
            href={adminNewPath(board)}
            className="inline-flex h-12 shrink-0 items-center gap-1.5 self-start rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] sm:self-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            새 글 작성
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-md border border-line bg-white p-12 text-center">
            <p className="font-display text-[20px] font-bold text-ink-strong">
              등록된 글이 없습니다
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              새 글을 작성하면 {config.label} 페이지에 노출됩니다.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {posts.map((p) => {
              const atts = attachMap.get(p.id) ?? [];
              return (
                <li
                  key={p.id}
                  className="rounded-md border border-line bg-white p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.isPinned && (
                          <span className="inline-flex items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                            공지
                          </span>
                        )}
                        <span className="font-mono-num text-[12px] text-ink-faint">
                          #{p.postNumber} · {formatDate(p.createdAt)} · 조회{" "}
                          {p.viewCount}
                          {atts.length > 0 && ` · 첨부 ${atts.length}`}
                        </span>
                      </div>
                      <p className="mt-2 truncate font-display text-[18px] font-bold tracking-tight text-ink-strong">
                        {p.title}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        href={postDetailPath(board, p.id)}
                        className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
                      >
                        미리보기
                      </Link>
                      <form action={togglePin}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="board" value={board} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-navy-700 hover:text-navy-700"
                        >
                          {p.isPinned ? "고정 해제" : "상단 고정"}
                        </button>
                      </form>
                      <Link
                        href={adminEditPath(board, p.id)}
                        className="inline-flex h-9 items-center rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-navy-800"
                      >
                        수정
                      </Link>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="board" value={board} />
                        <ConfirmButton
                          message="이 글을 삭제하시겠습니까? 첨부 파일도 함께 삭제되며 되돌릴 수 없습니다."
                          className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          삭제
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* 페이지네이션 */}
        {pageCount > 1 && (
          <nav
            aria-label="페이지네이션"
            className="mt-10 flex items-center justify-center gap-2"
          >
            {Array.from({ length: pageCount }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <Link
                  key={p}
                  href={p === 1 ? `/admin/posts/${board}` : `/admin/posts/${board}?page=${p}`}
                  aria-current={active ? "page" : undefined}
                  className={
                    "inline-flex h-10 w-10 items-center justify-center rounded-sm font-mono-num text-[13px] font-semibold transition-colors " +
                    (active
                      ? "bg-navy-800 text-white"
                      : "border border-line text-ink-strong hover:border-navy-700")
                  }
                >
                  {p}
                </Link>
              );
            })}
          </nav>
        )}
      </Container>
    </section>
  );
}
