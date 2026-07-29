"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { partners, type Partner } from "@/data/site-content";

/* Phase 10 P1-06 — 카테고리별 행 그룹 + stagger 압축
   기존 4x2 fade-in이 600ms 이상 지연되던 문제 → 전체 stagger ≤ 400ms로 축소
   카테고리 구분이 시각적으로 명확하지 않던 문제 → 행 단위 sticky 헤더 분리 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Phase 13 P2-G — 라벨 명확화 ("발주처 1개사" → "주요 위탁기관")
   클라 요청 — "시공사(CONSTRUCTION PARTNERS)" 그룹 노출 제거 */
const CATEGORY_GROUPS: {
  key: Partner["category"];
  label: string;
  caption: string;
}[] = [
  { key: "client", label: "주요 위탁기관", caption: "PRIMARY CLIENT" },
  { key: "public", label: "공공기관", caption: "PUBLIC AGENCIES" },
];

export function Partners() {
  const shouldReduce = useReducedMotion() ?? false;

  /* Phase 11 P1-A — 헤딩 fade 흐릿 해소
     duration 0.4 → 0.25, 시작 opacity 0 → 0.6, y 10 → 6 */
  const item: Variants = {
    hidden: { opacity: 0.6, y: shouldReduce ? 0 : 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.25, ease: EASE_OUT },
    },
  };

  return (
    <section className="section bg-gray-50">
      <Container>
        <div className="mb-12 max-w-3xl md:mb-16">
          {/* 헤딩은 fade 없이 즉시 노출 — flash 방지 */}
          <p className="eyebrow">PARTNERS</p>
          <h2 className="mt-4 font-extrabold tracking-tight text-ink-strong">
            함께 신뢰를 쌓아온 파트너
          </h2>
        </div>

        {/* 카테고리별 행 분리 — 발주처 / 공공기관 */}
        <div className="space-y-12">
          {CATEGORY_GROUPS.map((group) => {
            const items = partners.filter((p) => p.category === group.key);
            if (items.length === 0) return null;
            return (
              <motion.section
                key={group.key}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: shouldReduce ? 0 : 0.04,
                    },
                  },
                }}
                aria-labelledby={`partner-group-${group.key}`}
              >
                {/* 카테고리 헤더 */}
                <motion.div
                  variants={item}
                  className="mb-4 flex items-baseline justify-between border-b border-line pb-3"
                >
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent-deep">
                      {group.caption}
                    </p>
                    <h3
                      id={`partner-group-${group.key}`}
                      className="mt-1 font-display text-[18px] font-bold tracking-tight text-ink-strong md:text-[20px]"
                    >
                      {group.label}
                    </h3>
                  </div>
                  <span className="font-mono-num text-[13px] text-ink-faint">
                    {items.length}개사
                  </span>
                </motion.div>

                {/* Phase 14-C C-3 — 카드 수 < 4일 때 빈 셀 노출 → 카드 수에 따라 컬럼 자동 조정.
                    1개: 단일 컬럼, 2개: 2열, 3개: 3열, 4개 이상: 4열 (lg) / 3열 (sm) / 2열 (mobile) */}
                <ul
                  className={
                    "grid gap-px overflow-hidden rounded-md bg-line " +
                    (items.length === 1
                      ? "grid-cols-1"
                      : items.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : items.length === 3
                          ? "grid-cols-2 sm:grid-cols-3"
                          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")
                  }
                >
                  {items.map((p) => (
                    <motion.li
                      key={p.name}
                      variants={item}
                      className="group flex h-28 flex-col justify-between bg-white p-5 grayscale transition-all duration-300 [transition-timing-function:var(--ease)] hover:bg-white hover:grayscale-0"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint transition-colors group-hover:text-accent-deep">
                        {p.note ?? group.label}
                      </p>
                      <p className="font-display text-[15px] font-bold tracking-tight text-ink-muted transition-colors group-hover:text-ink-strong">
                        {p.name}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </motion.section>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
