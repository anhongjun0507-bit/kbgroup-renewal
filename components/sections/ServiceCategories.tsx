"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { businessAreas, type BusinessCategory } from "@/data/site-content";

/* Phase 3.C — BUSINESS 5가지
   - 카드 상단 16:9 비주얼 영역 (사업별 컬러 키 + SVG 라인 일러스트)
   - hover: 워터마크 숫자 navy → accent/15 점등, "자세히 보기" 24px 슬라이드
   - 5번째 "기타" 카드는 별도 풀폭 배너 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Phase 6 B-3 — 사업별 컬러 키 (배경 그라데이션 + 좌상단 4px 색띠) */
const VISUAL_BG: Record<BusinessCategory, string> = {
  facility: "linear-gradient(135deg, #0E1F3A 0%, #16315C 100%)",
  sanitation: "linear-gradient(135deg, #16315C 0%, #2C4276 100%)",
  security: "linear-gradient(135deg, #0B1A33 0%, #16315C 100%)",
  development: "linear-gradient(135deg, #0E1F3A 0%, #B88B3A 180%)",
  other: "linear-gradient(135deg, #16315C 0%, #0E1F3A 100%)",
};

/* Phase 9 P1-05 — 4색 hue → 단일 골드 opacity 4단계
   "한 회사가 책임지는" 카피에 맞춰 톤 통일. 위계는 opacity로만 */
const ACCENT_BAR: Record<BusinessCategory, string> = {
  facility: "rgba(201,162,75,1)",       /* 100% */
  sanitation: "rgba(201,162,75,0.78)",  /* 78% */
  security: "rgba(201,162,75,0.58)",    /* 58% */
  development: "rgba(201,162,75,0.4)",  /* 40% */
  other: "rgba(201,162,75,0.25)",       /* 25% */
};

/* 사업별 라인 일러스트 SVG */
function VisualIcon({ id }: { id: BusinessCategory }) {
  const common = {
    fill: "none",
    stroke: "rgba(255,255,255,0.85)",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "facility":
      /* 공구/계측기 — 스패너 + 게이지 */
      return (
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <g {...common}>
            {/* 스패너 */}
            <path d="M55 90 L100 45 M50 95 a8 8 0 1 0 0.1 0.1 z M115 30 a18 18 0 1 0 -30 30 l30 30 a18 18 0 1 0 30 -30 z" />
            {/* 게이지 */}
            <circle cx="150" cy="60" r="22" />
            <path d="M150 60 L162 50" />
            <path d="M130 60 H134 M166 60 H170 M150 40 V44 M150 76 V80" />
          </g>
        </svg>
      );
    case "sanitation":
      /* 물방울 + 브러시 */
      return (
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <g {...common}>
            {/* 물방울 */}
            <path d="M70 30 C70 30, 50 55, 50 75 a20 20 0 1 0 40 0 C90 55, 70 30, 70 30 z" />
            {/* 브러시 */}
            <rect x="115" y="40" width="55" height="14" rx="2" />
            <path d="M118 56 V70 M125 56 V72 M132 56 V70 M139 56 V72 M146 56 V70 M153 56 V72 M160 56 V70 M167 56 V72" />
            <path d="M115 40 L100 25 L115 25" />
          </g>
        </svg>
      );
    case "security":
      /* 실드 + CCTV */
      return (
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <g {...common}>
            {/* 실드 */}
            <path d="M55 30 L55 60 C55 80, 75 92, 80 95 C85 92, 105 80, 105 60 L105 30 L80 22 z" />
            <path d="M70 60 L78 70 L92 50" />
            {/* CCTV */}
            <rect x="125" y="40" width="50" height="22" rx="3" />
            <path d="M175 50 L160 45 L160 55 z" fill="rgba(255,255,255,0.85)" stroke="none" />
            <path d="M150 62 V72 H140" />
          </g>
        </svg>
      );
    case "development":
      /* 크레인 + 도면 */
      return (
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <g {...common}>
            {/* 크레인 */}
            <path d="M55 95 V25" />
            <path d="M55 28 L130 28" />
            <path d="M55 28 L65 18 L70 28" />
            <path d="M95 28 V40" />
            <path d="M88 40 H102 V52 H88 z" />
            {/* 도면 */}
            <rect x="135" y="65" width="48" height="32" />
            <path d="M140 75 H178 M140 82 H170 M140 89 H160" />
          </g>
        </svg>
      );
    case "other":
      /* 박스 + 트럭 */
      return (
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <g {...common}>
            {/* 박스 */}
            <rect x="50" y="55" width="50" height="40" />
            <path d="M50 65 H100 M75 55 V95" />
            {/* 트럭 */}
            <path d="M115 80 H145 V55 H115 z" />
            <path d="M145 65 H165 L172 75 V80 H145 z" />
            <circle cx="125" cy="86" r="6" />
            <circle cx="160" cy="86" r="6" />
          </g>
        </svg>
      );
  }
}

export function ServiceCategories() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  const mainAreas = businessAreas.slice(0, 4);
  const extraArea = businessAreas[4];

  return (
    <section className="section bg-gray-50">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-14 max-w-3xl md:mb-20"
        >
          <motion.p variants={item} className="eyebrow">
            BUSINESS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 font-extrabold tracking-tight text-ink-strong"
          >
            한 회사가 책임지는 <span className="accent-em">종합 시설관리</span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink md:text-lg"
          >
            시설관리부터 위생청소·경비보안·시행건설까지, 단지 운영에 필요한
            모든 서비스를 한 곳에서 제공합니다.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
          }}
          className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {mainAreas.map((area, idx) => (
            <motion.article key={area.id} variants={item}>
              <Link
                href={`/business/${area.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
                style={{ "--card-accent": ACCENT_BAR[area.id] } as React.CSSProperties}
              >
                {/* 16:9 비주얼 영역 */}
                <div
                  className="relative aspect-[16/9] overflow-hidden"
                  style={{ background: VISUAL_BG[area.id] }}
                >
                  {/* Phase 6 B-3 — 좌상단 4px 액센트 색띠 */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 z-10 h-1 w-full"
                    style={{ backgroundColor: ACCENT_BAR[area.id] }}
                  />
                  {/* 워터마크 번호 — hover 시 사업별 액센트 컬러로 점등 */}
                  <span
                    aria-hidden="true"
                    className="number-display absolute right-4 top-3 text-[88px] font-extrabold text-white/[0.12] transition-colors duration-300 group-hover:[color:var(--card-accent)] group-hover:opacity-30"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {/* 라인 일러스트 */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <VisualIcon id={area.id} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-ink-faint">
                    {area.englishName}
                  </p>
                  <h3 className="mt-3 text-[22px] font-bold tracking-tight text-ink-strong">
                    {area.name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink">
                    {area.tagline}
                  </p>

                  <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-ink-muted">
                    {area.highlights.slice(0, 2).map((h) => (
                      <li key={h} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-2 inline-block h-1 w-1 flex-shrink-0 bg-accent-500"
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-strong">
                      자세히 보기
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 group-hover:translate-x-[24px]"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {/* 5번째 — "기타" 가로 배너 */}
        {extraArea && (
          <motion.article
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: shouldReduce ? 0 : 0.7,
              ease: EASE_OUT,
              delay: 0.2,
            }}
            className="mt-6 rounded-md border border-line bg-white"
          >
            <Link
              href={`/business/${extraArea.slug}`}
              className="group flex flex-col gap-6 p-7 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between md:gap-10 lg:p-9"
            >
              <div className="flex items-baseline gap-6">
                <span
                  aria-hidden="true"
                  className="tabular text-[44px] font-extrabold leading-none text-accent-500/25"
                  style={{ letterSpacing: "var(--tracking-tighter)" }}
                >
                  05
                </span>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-ink-faint">
                    {extraArea.englishName}
                  </p>
                  <h3 className="mt-2 text-[22px] font-bold tracking-tight text-ink-strong">
                    {extraArea.name}
                  </h3>
                  <p className="mt-1 text-[14px] text-ink">{extraArea.tagline}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-strong">
                기타 더보기
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-[24px]"
                >
                  →
                </span>
              </span>
            </Link>
          </motion.article>
        )}
      </Container>
    </section>
  );
}
