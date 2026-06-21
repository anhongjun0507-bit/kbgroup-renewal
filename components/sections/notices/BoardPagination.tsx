import Link from "next/link";

/** 게시판 페이지네이션 (서버 렌더 — searchParams 기반 Link). */
export function BoardPagination({
  basePath,
  page,
  pageCount,
  q = "",
}: {
  basePath: string;
  page: number;
  pageCount: number;
  q?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <nav
      aria-label="페이지네이션"
      className="mt-10 flex items-center justify-center gap-2"
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-strong transition-colors hover:border-navy-700"
          aria-label="이전 페이지"
        >
          ←
        </Link>
      )}
      {Array.from({ length: pageCount }).map((_, i) => {
        const p = i + 1;
        const active = p === page;
        return (
          <Link
            key={p}
            href={href(p)}
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
      {page < pageCount && (
        <Link
          href={href(page + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-strong transition-colors hover:border-navy-700"
          aria-label="다음 페이지"
        >
          →
        </Link>
      )}
    </nav>
  );
}
