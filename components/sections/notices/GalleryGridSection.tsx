import Link from "next/link";
import { Container } from "@/components/ui";
import { postDetailPath, adminNewPath, type BoardConfig } from "@/lib/boards";
import type { Post, Attachment } from "@/lib/posts";
import { BoardToolbar } from "./BoardToolbar";
import { BoardPagination } from "./BoardPagination";

export type GalleryItem = {
  post: Post;
  cover: Attachment | null;
  count: number;
};

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

/** 갤러리 격자 — 각 게시글의 대표 이미지(첫 첨부) 썸네일. */
export function GalleryGridSection({
  config,
  items,
  total,
  page,
  pageCount,
  q = "",
  isAdmin = false,
}: {
  config: BoardConfig;
  items: GalleryItem[];
  total: number;
  page: number;
  pageCount: number;
  q?: string;
  isAdmin?: boolean;
}) {
  return (
    <section className="section bg-white">
      <Container>
        <BoardToolbar
          config={config}
          total={total}
          q={q}
          isAdmin={isAdmin}
          unit="개의 앨범"
        />

        {items.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ post, cover, count }) => (
              <li key={post.id}>
                <Link
                  href={postDetailPath(config.type, post.id)}
                  className="group block overflow-hidden rounded-md border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[0_12px_28px_rgba(11,26,51,0.10)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover.url}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-accent-300/40">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <rect x="8" y="10" width="32" height="28" rx="2" />
                          <circle cx="18" cy="20" r="3" />
                          <path d="M8 32l9-8 7 6 6-5 10 9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    {count > 1 && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="3" width="14" height="14" rx="2" />
                          <path d="M7 21h12a2 2 0 0 0 2-2V7" />
                        </svg>
                        {count}
                      </span>
                    )}
                    {post.isPinned && (
                      <span className="absolute left-2 top-2 inline-flex items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                        공지
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 font-display text-[16px] font-bold tracking-tight text-ink-strong transition-colors group-hover:text-accent-deep">
                      {post.title}
                    </p>
                    <p className="mt-1 font-mono-num text-[12px] text-ink-faint">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-md border border-line bg-gray-50 px-6 py-20 text-center">
            <div className="mx-auto h-10 w-10 text-accent-500" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="8" y="10" width="32" height="28" rx="2" />
                <circle cx="18" cy="20" r="3" />
                <path d="M8 32l9-8 7 6 6-5 10 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink-strong">
              {q ? "검색 결과가 없습니다" : "아직 등록된 사진이 없습니다"}
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              {q ? "다른 검색어로 다시 시도해 주세요." : "현장과 행사의 순간을 곧 담아 올리겠습니다."}
            </p>
            {isAdmin && !q && (
              <div className="mt-7">
                <Link
                  href={adminNewPath(config.type)}
                  className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-colors hover:bg-accent-600"
                >
                  사진 올리기 →
                </Link>
              </div>
            )}
          </div>
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
