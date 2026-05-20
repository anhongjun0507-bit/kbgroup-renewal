"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { pastComplexes } from "@/data/site-content";

/* Phase 14-M (2026-05-20) — 과거 운영 단지 18건.
   현재 단지(CasesGallery)와 시각적으로 명확 구분: 회색 톤·작은 카드·grayscale 라벨.
   클라 옵션 A: /cases 페이지 별도 섹션. 카운트는 카운터에 비포함. */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function PastProjects() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.04 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  const lhCount = pastComplexes.filter((c) => c.type === "LH").length;
  const totalHouseholds = pastComplexes.reduce(
    (s, c) => s + (c.households ?? 0),
    0,
  );

  return (
    <section
      aria-labelledby="past-projects-heading"
      className="section bg-gray-50"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <Heading
              kicker="PAST PROJECTS · 과거 운영 실적"
              title="현재는 관리하지 않지만 — 함께한 단지의 기록"
              italicWord="기록"
              subtitle="계약 종료·재계약 미진행 등으로 현재 운영 목록에서는 제외되었지만, 우리가 운영했던 단지의 신뢰를 남깁니다."
              align="left"
              size="md"
              as="h2"
            />
          </div>
          <dl className="grid grid-cols-3 gap-6 text-center md:text-right">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                과거 단지
              </dt>
              <dd className="mt-1 font-display text-[22px] font-extrabold text-navy-800 md:text-[26px]">
                {pastComplexes.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                LH 발주
              </dt>
              <dd className="mt-1 font-display text-[22px] font-extrabold text-navy-800 md:text-[26px]">
                {lhCount}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                누적 세대수
              </dt>
              <dd className="mt-1 font-display text-[22px] font-extrabold text-navy-800 md:text-[26px]">
                {totalHouseholds.toLocaleString()}
              </dd>
            </div>
          </dl>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3"
        >
          {pastComplexes.map((c) => (
            <motion.li
              key={c.name}
              variants={itemVariants}
              className="group relative flex flex-col gap-2 rounded-md border border-line bg-white p-5 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:border-ink-muted"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-sm bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  종료
                </span>
                {c.type === "LH" && (
                  <span className="inline-flex items-center rounded-sm border border-navy-700 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-800">
                    LH
                  </span>
                )}
                {c.kind === "mixed-use" && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    집합건물
                  </span>
                )}
              </div>
              <h3 className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink-strong md:text-[16px]">
                {c.name}
              </h3>
              <p className="text-[12px] text-ink-muted">{c.region}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faint">
                {c.households !== undefined && (
                  <span>
                    <span className="font-mono-num font-semibold text-ink-muted">
                      {c.households.toLocaleString()}
                    </span>{" "}
                    세대
                  </span>
                )}
                {c.area !== undefined && (
                  <span>
                    <span className="font-mono-num font-semibold text-ink-muted">
                      {c.area.toLocaleString()}
                    </span>{" "}
                    ㎡
                  </span>
                )}
              </div>
              {c.period && (
                <p className="mt-1 text-[11px] text-ink-faint">{c.period}</p>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
