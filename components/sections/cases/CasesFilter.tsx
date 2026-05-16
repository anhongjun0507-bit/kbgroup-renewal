"use client";

import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

/* Phase 5.G.3 — sticky 필터바
   좌측 검색 input + 우측 chip group + 정렬 dropdown */

export type CasesFilterValue = "ALL" | "LH" | "민간";
export type CasesSortValue = "name" | "region" | "type";

interface Props {
  current: CasesFilterValue;
  onChange: (value: CasesFilterValue) => void;
  counts: Record<CasesFilterValue, number>;
  search: string;
  onSearchChange: (s: string) => void;
  sort: CasesSortValue;
  onSortChange: (s: CasesSortValue) => void;
}

const OPTIONS: { value: CasesFilterValue; label: string }[] = [
  { value: "ALL", label: "ALL" },
  { value: "LH", label: "LH 발주" },
  { value: "민간", label: "민간" },
];

const SORT_OPTIONS: { value: CasesSortValue; label: string }[] = [
  { value: "name", label: "단지명순" },
  { value: "region", label: "지역순" },
  { value: "type", label: "발주처순" },
];

export function CasesFilter({
  current,
  onChange,
  counts,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur-sm md:top-20">
      <Container>
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {/* 검색 */}
          <div className="relative w-full lg:max-w-sm">
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="단지명·지역 검색"
              className="w-full rounded-sm border border-line bg-white px-3 py-2.5 pl-10 text-[14px] text-ink-strong placeholder:text-ink-faint transition-colors duration-200 focus:border-navy-700 focus:outline-none"
            />
          </div>

          {/* chip + 정렬 */}
          <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div role="tablist" aria-label="단지 필터" className="flex flex-shrink-0 items-center gap-2">
              {OPTIONS.map((opt) => {
                const isActive = current === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-sm border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
                      isActive
                        ? "border-navy-800 bg-navy-800 text-white"
                        : "border-line bg-white text-ink hover:border-navy-700 hover:text-ink-strong",
                    )}
                  >
                    {opt.label}
                    <span
                      className={cn(
                        "font-mono-num text-[11px]",
                        isActive ? "text-white/65" : "text-ink-faint",
                      )}
                    >
                      {counts[opt.value]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex flex-shrink-0 items-center gap-2 pl-3">
              <label htmlFor="cases-sort" className="text-[12px] text-ink-faint">
                정렬
              </label>
              <select
                id="cases-sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as CasesSortValue)}
                className="rounded-sm border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink-strong transition-colors duration-200 focus:border-navy-700 focus:outline-none"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
