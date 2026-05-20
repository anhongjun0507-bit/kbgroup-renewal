"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";
import { cn } from "@/lib/cn";
import {
  CasesFilter,
  type CasesFilterValue,
  type CasesSortValue,
} from "./CasesFilter";

/* Phase 14-M (2026-05-20) — 전체 단지 컴팩트 리스트.
   클라 hwpx 요청: "주요 단지는 카드, 나머지는 리스트화". 154개 전체를 행 단위로 표시.
   CasesGallery(주요 24)와 분리 운영. 검색·필터·정렬 기능은 본 컴포넌트에 집중. */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function isLh(c: Complex) {
  return c.name.startsWith("LH") || c.type === "LH";
}

function matchesQuery(c: Complex, q: string) {
  if (!q) return true;
  const haystacks = [
    c.name,
    c.region,
    c.client ?? "",
    ...(c.aliases ?? []),
  ]
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  return haystacks.some((h) => h.includes(q));
}

export function CasesList() {
  const shouldReduce = useReducedMotion() ?? false;
  const [filter, setFilter] = useState<CasesFilterValue>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CasesSortValue>("name");

  const counts = useMemo<Record<CasesFilterValue, number>>(() => {
    const lh = complexes.filter(isLh).length;
    return {
      ALL: complexes.length,
      LH: lh,
      민간: complexes.length - lh,
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = complexes;
    if (filter === "LH") arr = arr.filter(isLh);
    else if (filter === "민간") arr = arr.filter((c) => !isLh(c));
    if (q) arr = arr.filter((c) => matchesQuery(c, q));
    arr = [...arr].sort((a, b) => {
      switch (sort) {
        case "region":
          return a.region.localeCompare(b.region, "ko");
        case "type":
          return (a.type ?? "민간").localeCompare(b.type ?? "민간", "ko");
        default:
          return a.name.localeCompare(b.name, "ko");
      }
    });
    return arr;
  }, [filter, search, sort]);

  return (
    <>
      <CasesFilter
        current={filter}
        onChange={setFilter}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      <section
        aria-labelledby="cases-list-heading"
        className="section bg-white"
      >
        <Container>
          <Heading
            kicker={`FULL LIST · 전체 ${complexes.length}단지`}
            title="현재 운영 중인 모든 단지"
            italicWord="모든 단지"
            subtitle="전국에 흩어져 있는 모든 단지의 운영 현황입니다. 검색·필터·정렬로 원하는 단지를 찾아보세요."
            align="left"
            size="md"
            as="h2"
            className="mb-10"
          />

          {filtered.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{
                duration: shouldReduce ? 0 : 0.5,
                ease: EASE_OUT_EXPO,
              }}
            >
              {/* 결과 카운트 */}
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {filtered.length}개 단지
                {search.trim() && (
                  <span className="ml-2 normal-case text-ink-muted">
                    · &ldquo;{search.trim()}&rdquo; 검색
                  </span>
                )}
              </p>

              {/* 데스크탑 테이블 / 모바일 카드 리스트 — 동일 데이터, 반응형 표시 */}
              <ul className="divide-y divide-line border-y border-line">
                {filtered.map((c) => {
                  const lh = isLh(c);
                  return (
                    <li
                      key={c.name}
                      className="grid grid-cols-12 items-baseline gap-3 px-1 py-4 transition-colors duration-200 hover:bg-gray-50 md:gap-6 md:py-5"
                    >
                      {/* LH/민간 뱃지 */}
                      <span className="col-span-2 flex items-center md:col-span-1">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                            lh
                              ? "border-accent-500 bg-accent-500 text-navy-900"
                              : "border-line text-ink-muted",
                          )}
                        >
                          {lh ? "LH" : c.type ?? "민간"}
                        </span>
                      </span>

                      {/* 단지명 (+ 별칭) */}
                      <div className="col-span-10 md:col-span-5">
                        <p className="font-display text-[14px] font-bold leading-snug tracking-tight text-ink-strong md:text-[16px]">
                          {c.name}
                          {c.isFeatured && !lh && (
                            <span
                              aria-label="주요 단지"
                              className="ml-2 inline-flex items-center rounded-sm bg-navy-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white"
                            >
                              주요
                            </span>
                          )}
                        </p>
                        {c.aliases && c.aliases.length > 0 && (
                          <p className="mt-1 text-[11px] text-ink-faint md:text-[12px]">
                            별칭: {c.aliases.join(" · ")}
                          </p>
                        )}
                      </div>

                      {/* 지역 */}
                      <p className="col-span-7 text-[12px] text-ink-muted md:col-span-3 md:text-[13px]">
                        {c.region}
                      </p>

                      {/* 세대수 */}
                      <p className="col-span-5 text-right font-mono-num text-[12px] text-ink-muted md:col-span-2 md:text-[13px]">
                        {c.households !== undefined
                          ? `${c.households.toLocaleString()}세대`
                          : "—"}
                      </p>

                      {/* 면적 (데스크탑만) */}
                      <p className="hidden text-right font-mono-num text-[12px] text-ink-faint md:col-span-1 md:block md:text-[13px]">
                        {c.area !== undefined ? c.area.toLocaleString() : "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ) : (
            <div className="mx-auto max-w-xl rounded-md border border-line bg-white px-6 py-16 text-center md:py-20">
              <div className="mx-auto h-12 w-12 text-accent-ink" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="22" cy="22" r="14" />
                  <path d="M32 32L42 42" />
                  <path d="M16 22H28" />
                </svg>
              </div>
              <p className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[24px]">
                조건에 맞는 단지가 없습니다
              </p>
              <p className="mt-3 text-[14px] leading-[1.75] text-ink-muted">
                필터나 검색어를 조정해 보세요.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter("ALL");
                  setSearch("");
                  setSort("name");
                }}
                className="mt-7 inline-flex min-h-11 items-center rounded-sm bg-accent-500 px-5 py-2.5 text-[13px] font-semibold text-navy-900 transition-colors duration-200 hover:bg-accent-600 hover:text-white"
              >
                필터 초기화
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
