"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

/* Phase 5.J — 공지사항 리스트
   - 카테고리 4종 필터 (신규단지/공지/언론보도/채용공고)
   - 리스트 레이아웃: 좌 썸네일(160x100) + 가운데 제목/요약/chip + 우측 날짜
   - 콘텐츠 0건 → empty state + "곧 업데이트 됩니다" */

export type NoticeCategory = "all" | "complex" | "notice" | "press" | "career";

export type NoticeItem = {
  id: string;
  category: Exclude<NoticeCategory, "all">;
  title: string;
  summary?: string;
  date: string; // YYYY-MM-DD
  thumbColor?: string;
};

const CATEGORIES: { value: NoticeCategory; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "complex", label: "신규단지" },
  { value: "notice", label: "공지" },
  { value: "press", label: "언론보도" },
  { value: "career", label: "채용공고" },
];

const CATEGORY_LABEL: Record<NoticeItem["category"], string> = {
  complex: "신규단지",
  notice: "공지",
  press: "언론보도",
  career: "채용공고",
};

const CATEGORY_COLOR: Record<NoticeItem["category"], string> = {
  complex: "bg-accent-500 text-navy-900",
  notice: "bg-navy-800 text-white",
  press: "bg-navy-700 text-white",
  career: "bg-gray-700 text-white",
};

/* Phase 11 P1-F — 카테고리별 라인 아이콘 (빈 다크 박스 → 시각 식별)
   complex=Building / notice=Bell / press=Newspaper / career=Users */
const CATEGORY_ICON: Record<NoticeItem["category"], React.ReactNode> = {
  complex: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 42V14L24 6L40 14V42" />
      <path d="M8 42H40" />
      <path d="M18 42V28H30V42" />
      <path d="M18 20H20M28 20H30M18 26H20M28 26H30" />
    </svg>
  ),
  notice: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20C12 13.4 17.4 8 24 8C30.6 8 36 13.4 36 20V28L40 34H8L12 28V20Z" />
      <path d="M20 34V36C20 38.2 21.8 40 24 40C26.2 40 28 38.2 28 36V34" />
    </svg>
  ),
  press: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="30" height="30" rx="2" />
      <path d="M36 16H42V36C42 38.2 40.2 40 38 40H36" />
      <path d="M12 16H30M12 22H30M12 28H22M12 34H22" />
      <rect x="26" y="28" width="6" height="6" />
    </svg>
  ),
  career: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="16" r="6" />
      <circle cx="34" cy="18" r="5" />
      <path d="M6 40c0-7 5-12 12-12s12 5 12 12" />
      <path d="M28 40c0-5 3-9 6-9s6 4 6 9" />
    </svg>
  ),
};

interface Props {
  /** 페이지 진입 시 기본 카테고리 (서브 라우트에서 prefilter 시 사용) */
  defaultCategory?: NoticeCategory;
  /** 이 카테고리만 보이도록 잠금 (서브 라우트에서 사용) */
  lockCategory?: boolean;
  items: NoticeItem[];
  /** 페이지 사이즈 (페이지네이션) */
  pageSize?: number;
}

export function NoticesList({
  defaultCategory = "all",
  lockCategory = false,
  items,
  pageSize = 10,
}: Props) {
  const [category, setCategory] = useState<NoticeCategory>(defaultCategory);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const m: Record<NoticeCategory, number> = {
      all: items.length,
      complex: 0,
      notice: 0,
      press: 0,
      career: 0,
    };
    for (const it of items) m[it.category]++;
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = items;
    if (category !== "all") arr = arr.filter((i) => i.category === category);
    if (q) {
      arr = arr.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.summary && i.summary.toLowerCase().includes(q)),
      );
    }
    return arr.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [items, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section
      aria-labelledby="notices-list-heading"
      className="section bg-white"
    >
      <Container>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 카테고리 chip */}
          {!lockCategory && (
            <ul
              className="-mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="공지 카테고리"
            >
              {CATEGORIES.map((c) => {
                const isActive = c.value === category;
                return (
                  <li key={c.value} className="flex-shrink-0">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setCategory(c.value);
                        setPage(1);
                      }}
                      className={cn(
                        /* Phase 9 P0-05 — pill 형태 + 0 count 회색 처리 */
                        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors duration-200",
                        isActive
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-gray-200 bg-white text-ink hover:border-navy-700 hover:text-navy-700",
                      )}
                    >
                      {c.label}
                      <span
                        className={cn(
                          "font-mono-num text-[11px]",
                          isActive
                            ? "text-accent-300"
                            : counts[c.value] === 0
                              ? "text-ink-placeholder"
                              : "text-ink-faint",
                        )}
                      >
                        {counts[c.value]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 검색 */}
          <div className="relative w-full lg:max-w-xs">
            <span
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.65 16.65" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="공지 검색"
              className="w-full rounded-sm border border-line bg-white px-3 py-2.5 pl-10 text-[14px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none"
            />
          </div>
        </div>

        {/* 리스트 */}
        <div className="mt-8">
          {pageItems.length > 0 ? (
            <ul className="divide-y divide-line border-y border-line">
              {pageItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/notices/${item.id}`}
                    className="group grid grid-cols-12 items-center gap-4 py-5 transition-colors duration-200 hover:bg-gray-50 md:gap-6"
                  >
                    {/* Phase 11 P1-F — 썸네일 빈 박스 → 카테고리별 라인 아이콘 */}
                    <div
                      className="relative col-span-3 aspect-[8/5] overflow-hidden rounded-sm md:col-span-2"
                      style={{
                        background:
                          item.thumbColor ??
                          "linear-gradient(135deg, #0E1F3A 0%, #16315C 100%)",
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-10 w-10 text-accent-300/40 transition-colors duration-300 group-hover:text-accent-300/80 md:h-11 md:w-11">
                          {CATEGORY_ICON[item.category]}
                        </div>
                      </div>
                    </div>

                    {/* 가운데 */}
                    <div className="col-span-7 md:col-span-8">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                            CATEGORY_COLOR[item.category],
                          )}
                        >
                          {CATEGORY_LABEL[item.category]}
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-2 font-display text-[16px] font-bold tracking-tight text-ink-strong transition-colors duration-200 group-hover:text-accent-500 md:text-[18px]">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="mt-1 line-clamp-1 text-[13px] text-ink-muted">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    {/* 우측 날짜 */}
                    <p className="col-span-2 text-right font-mono-num text-[12px] text-ink-faint md:text-[13px]">
                      {item.date}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <nav
            aria-label="공지 페이지네이션"
            className="mt-10 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-strong transition-colors disabled:opacity-40 hover:border-navy-700"
              aria-label="이전 페이지"
            >
              ←
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isActive = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-sm font-mono-num text-[13px] font-semibold transition-colors",
                    isActive
                      ? "bg-navy-800 text-white"
                      : "border border-line text-ink-strong hover:border-navy-700",
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-strong transition-colors disabled:opacity-40 hover:border-navy-700"
              aria-label="다음 페이지"
            >
              →
            </button>
          </nav>
        )}
      </Container>

      <span id="notices-list-heading" className="sr-only">공지사항 리스트</span>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-line bg-gray-50 px-6 py-16 text-center md:py-20">
      <div className="mx-auto h-10 w-10 text-accent-500">
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="8" width="28" height="24" rx="2" />
          <path d="M6 14H34" />
          <path d="M12 22H28M12 26H22" />
        </svg>
      </div>
      <p className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[24px]">
        (주)케이비개발의 새 소식을 준비 중입니다
      </p>
      <p className="mt-4 text-[15px] leading-[1.75] text-ink-muted">
        선택하신 카테고리에 아직 게시된 글이 없습니다. 다른 카테고리를 확인하거나
        <br className="hidden sm:inline" />
        궁금하신 점은 아래 채널로 직접 문의해 주세요.
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <a
          href="/business"
          className="inline-flex min-h-11 items-center rounded-sm border border-ink-strong px-5 py-2.5 text-[13px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
        >
          사업영역 보기
        </a>
        <a
          href="#contact-form-heading"
          className="inline-flex min-h-11 items-center rounded-sm bg-accent-500 px-5 py-2.5 text-[13px] font-semibold text-navy-900 transition-colors duration-200 hover:bg-accent-600 hover:text-white"
        >
          상담 문의 →
        </a>
      </div>
    </div>
  );
}
