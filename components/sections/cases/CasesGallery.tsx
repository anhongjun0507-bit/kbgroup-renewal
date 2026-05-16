"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";
import {
  CasesFilter,
  type CasesFilterValue,
  type CasesSortValue,
} from "./CasesFilter";

/* Phase 5.G.4 — 갤러리: placeholder 업그레이드 + 배지 + 메타 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const HUES = [0, 14, -10, 22, -16, 6, 28, -22];

function isLh(c: Complex) {
  return c.name.startsWith("LH") || c.type === "LH";
}

function getInitial(name: string) {
  const noLh = name.replace(/^LH\s+/, "").trim();
  const tokens = noLh.split(/\s+/).filter(Boolean);
  return (tokens[tokens.length - 1] ?? noLh).charAt(0) || "K";
}

function badgeStyle(type?: Complex["type"]) {
  if (type === "LH") return "bg-accent-500 text-white";
  if (type === "민간") return "bg-navy-800 text-white";
  if (type === "공공") return "bg-navy-700 text-white";
  return "bg-white/85 text-ink-strong";
}

export function CasesGallery() {
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
    if (q) {
      arr = arr.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          (c.client && c.client.toLowerCase().includes(q)),
      );
    }
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
        aria-labelledby="cases-gallery-heading"
        className="section bg-gray-50"
      >
        <Container>
          {filtered.length > 0 ? (
            <motion.ul
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((c, idx) => (
                  <motion.li
                    key={c.name}
                    layout
                    initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduce ? 0 : -16 }}
                    transition={{
                      duration: shouldReduce ? 0 : 0.5,
                      ease: EASE_OUT_EXPO,
                    }}
                  >
                    <CaseCard complex={c} hue={HUES[idx % HUES.length]} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="rounded-md border border-line bg-white px-6 py-20 text-center">
              <p className="font-display text-[20px] font-bold text-ink-strong">
                검색 결과가 없습니다
              </p>
              <p className="mt-3 text-[14px] text-ink-muted">
                필터나 검색어를 조정해 보세요.
              </p>
            </div>
          )}
        </Container>

        <span id="cases-gallery-heading" className="sr-only">관리 단지 갤러리</span>
      </section>
    </>
  );
}

function CaseCard({ complex, hue }: { complex: Complex; hue: number }) {
  const lh = isLh(complex);
  const badge = lh ? "LH" : (complex.type ?? "민간");
  const initial = getInitial(complex.name);
  const slug = encodeURIComponent(complex.name);
  const meta = [
    complex.region,
    complex.households ? `${complex.households.toLocaleString()}세대` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group overflow-hidden rounded-md border border-line bg-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <Link href={`/cases/${slug}`} className="block" aria-label={`${complex.name} 상세보기`}>
        <div
          className="relative aspect-[4/5] overflow-hidden bg-navy-900"
          style={{ filter: `hue-rotate(${hue}deg)` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0E1F3A 0%, #16315C 50%, #0B1A33 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 origin-center transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.03]"
            style={{
              background:
                "radial-gradient(60% 60% at 30% 30%, rgba(201,162,75,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="absolute inset-0 bg-navy-900/40 transition-opacity duration-500 group-hover:bg-navy-900/20" />

          <span
            className={
              "absolute left-3 top-3 z-10 inline-flex items-center rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] " +
              badgeStyle(badge as Complex["type"])
            }
          >
            {badge}
          </span>

          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-white/10 px-2 py-1 text-[10px] font-medium text-white/85 backdrop-blur-sm">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1.5C5.2 1.5 3 3.7 3 6.5C3 10 8 14.5 8 14.5S13 10 13 6.5C13 3.7 10.8 1.5 8 1.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="8" cy="6.5" r="1.5" fill="currentColor" />
            </svg>
            {complex.region.split(/\s+/)[0]}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="font-display text-[clamp(5rem,12vw,9rem)] font-black leading-none text-white/15 transition-colors duration-500 group-hover:text-white/30"
            >
              {initial}
            </span>
          </div>

          {/* 우상단 화살표 (hover 시 slide) */}
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white/0 text-white opacity-0 transition-all duration-300 group-hover:bg-white/15 group-hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        <div className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint">
            {complex.region}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-[3.25rem] font-display text-[16px] font-bold leading-snug tracking-tight text-ink-strong transition-colors duration-300 group-hover:text-accent-500 md:text-[17px]">
            {complex.name}
          </h3>
          {meta && (
            <p className="mt-3 truncate text-[12px] text-ink-muted">{meta}</p>
          )}
          {complex.client && (
            <p className="mt-1 truncate text-[12px] text-ink-faint">
              {complex.client}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
