import Link from "next/link";
import { adminNewPath, type BoardConfig } from "@/lib/boards";

/** 게시판 상단 바 — 글 수 + 제목 검색(GET) + 관리자 글쓰기 버튼. */
export function BoardToolbar({
  config,
  total,
  q = "",
  isAdmin = false,
  unit = "개의 글",
}: {
  config: BoardConfig;
  total: number;
  q?: string;
  isAdmin?: boolean;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[14px] text-ink-muted">
        총 <span className="font-semibold text-ink-strong">{total}</span>
        {unit}
        {q && <> · &ldquo;{q}&rdquo; 검색 결과</>}
      </p>

      <div className="flex items-center gap-3">
        <form method="get" action={config.listPath} className="relative">
          <span
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16.65 16.65" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="제목 검색"
            aria-label="게시글 검색"
            className="h-11 w-full rounded-sm border border-line bg-white pl-10 pr-3 text-[15px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none sm:w-56"
          />
        </form>
        {isAdmin && (
          <Link
            href={adminNewPath(config.type)}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-sm bg-accent-500 px-5 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            글쓰기
          </Link>
        )}
      </div>
    </div>
  );
}
