import Link from "next/link";
import { Container } from "@/components/ui";
import {
  postDetailPath,
  adminNewPath,
  formatBytes,
  fileExtLabel,
  type BoardConfig,
} from "@/lib/boards";
import type { Post, Attachment } from "@/lib/posts";
import { BoardToolbar } from "./BoardToolbar";
import { BoardPagination } from "./BoardPagination";

export type ResourceItem = {
  post: Post;
  file: Attachment | null;
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

/** 자료실 — 자료 목록 + 다운로드 버튼. */
export function ResourceListSection({
  config,
  items,
  total,
  page,
  pageCount,
  q = "",
  isAdmin = false,
}: {
  config: BoardConfig;
  items: ResourceItem[];
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
          unit="개의 자료"
        />

        {items.length > 0 ? (
          <ul className="mt-8 space-y-3">
            {items.map(({ post, file }) => (
              <li
                key={post.id}
                className="flex flex-col gap-4 rounded-md border border-line bg-white p-5 transition-colors hover:border-navy-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-[11px] font-bold text-accent-300">
                    {file ? fileExtLabel(file.fileName) : "DOC"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                          공지
                        </span>
                      )}
                      <Link
                        href={postDetailPath(config.type, post.id)}
                        className="truncate font-display text-[16px] font-bold tracking-tight text-ink-strong transition-colors hover:text-accent-deep"
                      >
                        {post.title}
                      </Link>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-faint">
                      <span className="font-mono-num">{formatDate(post.createdAt)}</span>
                      {file && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{file.fileName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{formatBytes(file.fileSize)}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {file && (
                  <a
                    href={file.downloadUrl}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-ink-strong px-5 text-[14px] font-semibold text-ink-strong transition-colors hover:bg-ink-strong hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    다운로드
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-md border border-line bg-gray-50 px-6 py-20 text-center">
            <div className="mx-auto h-10 w-10 text-accent-500" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 6h12l8 8v28H14z" />
                <path d="M26 6v8h8" />
                <path d="M20 26h12M20 32h8" />
              </svg>
            </div>
            <p className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink-strong">
              {q ? "검색 결과가 없습니다" : "아직 등록된 자료가 없습니다"}
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              {q ? "다른 검색어로 다시 시도해 주세요." : "회사소개서·홍보물 등을 곧 제공해드리겠습니다."}
            </p>
            {isAdmin && !q && (
              <div className="mt-7">
                <Link
                  href={adminNewPath(config.type)}
                  className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-colors hover:bg-accent-600"
                >
                  자료 올리기 →
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
