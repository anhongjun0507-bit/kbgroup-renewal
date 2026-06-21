import Link from "next/link";
import { Container } from "@/components/ui";
import { postDetailPath, adminNewPath, type BoardConfig } from "@/lib/boards";
import type { Post } from "@/lib/posts";
import { BoardToolbar } from "./BoardToolbar";
import { BoardPagination } from "./BoardPagination";

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

/** 공지사항·단지소식 목록 (표 형태). */
export function PostListSection({
  config,
  posts,
  total,
  page,
  pageCount,
  q = "",
  isAdmin = false,
}: {
  config: BoardConfig;
  posts: Post[];
  total: number;
  page: number;
  pageCount: number;
  q?: string;
  isAdmin?: boolean;
}) {
  return (
    <section className="section bg-white">
      <Container>
        <BoardToolbar config={config} total={total} q={q} isAdmin={isAdmin} />

        {/* 목록 헤더 (데스크탑) */}
        <div className="mt-8 hidden grid-cols-[72px_1fr_120px_72px] items-center gap-4 border-y-2 border-ink-strong px-2 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted md:grid">
          <span className="text-center">번호</span>
          <span>제목</span>
          <span className="text-center">날짜</span>
          <span className="text-center">조회</span>
        </div>

        {posts.length > 0 ? (
          <ul className="border-t border-line md:border-t-0">
            {posts.map((p) => (
              <li
                key={p.id}
                className={
                  "border-b border-line " + (p.isPinned ? "bg-accent-50/40" : "")
                }
              >
                <Link
                  href={postDetailPath(config.type, p.id)}
                  className="group block px-2 py-4 transition-colors hover:bg-gray-50 md:grid md:grid-cols-[72px_1fr_120px_72px] md:items-center md:gap-4 md:py-3.5"
                >
                  <span className="hidden text-center md:block">
                    {p.isPinned ? (
                      <span className="inline-flex items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                        공지
                      </span>
                    ) : (
                      <span className="font-mono-num text-[13px] text-ink-faint">
                        {p.postNumber}
                      </span>
                    )}
                  </span>

                  <span className="block min-w-0">
                    <span className="flex items-center gap-2">
                      {p.isPinned && (
                        <span className="inline-flex shrink-0 items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900 md:hidden">
                          공지
                        </span>
                      )}
                      <span className="truncate font-display text-[16px] font-bold tracking-tight text-ink-strong transition-colors group-hover:text-accent-deep md:text-[15px] md:font-semibold">
                        {p.title}
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center gap-2 text-[12px] text-ink-faint md:hidden">
                      <span className="font-mono-num">{formatDate(p.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">조회 {p.viewCount}</span>
                    </span>
                  </span>

                  <span className="hidden text-center font-mono-num text-[13px] text-ink-faint md:block">
                    {formatDate(p.createdAt)}
                  </span>
                  <span className="hidden text-center font-mono-num text-[13px] text-ink-faint md:block">
                    {p.viewCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState config={config} q={q} isAdmin={isAdmin} />
        )}

        <BoardPagination
          basePath={config.listPath}
          page={page}
          pageCount={pageCount}
          q={q}
        />
      </Container>
    </section>
  );
}

function EmptyState({
  config,
  q,
  isAdmin,
}: {
  config: BoardConfig;
  q: string;
  isAdmin: boolean;
}) {
  return (
    <div className="mt-px rounded-md border border-line bg-gray-50 px-6 py-20 text-center">
      <div className="mx-auto h-10 w-10 text-accent-500" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="8" width="28" height="24" rx="2" />
          <path d="M6 14H34" />
          <path d="M12 22H28M12 26H22" />
        </svg>
      </div>
      <p className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink-strong">
        {q ? "검색 결과가 없습니다" : `아직 등록된 ${config.label}이 없습니다`}
      </p>
      <p className="mt-3 text-[14px] text-ink-muted">
        {q ? "다른 검색어로 다시 시도해 주세요." : "곧 새로운 소식으로 찾아뵙겠습니다."}
      </p>
      {isAdmin && !q && (
        <div className="mt-7">
          <Link
            href={adminNewPath(config.type)}
            className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-colors hover:bg-accent-600"
          >
            첫 글 작성 →
          </Link>
        </div>
      )}
    </div>
  );
}
