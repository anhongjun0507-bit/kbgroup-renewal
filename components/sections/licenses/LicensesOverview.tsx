"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { certifications, licenses } from "@/data/site-content";

/* Phase 4.H.4 — 분야별 도넛 차트
   자격증을 5개 카테고리로 자동 분류 후 SVG donut */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type CertCategory =
  | "시설관리"
  | "안전·소방"
  | "회계·세무"
  | "전문 자격"
  | "환경·기타";

const CATEGORY_COLOR: Record<CertCategory, string> = {
  "시설관리": "#C9A24B",
  "안전·소방": "#0E1F3A",
  "회계·세무": "#9099A5",
  "전문 자격": "#16315C",
  "환경·기타": "#6B7380",
};

function categorizeCert(name: string): CertCategory {
  if (/(전기|승강기|기계설비|건축|토목|열처리|에너지|고압가스|위험물)/.test(name)) return "시설관리";
  if (/소방/.test(name)) return "안전·소방";
  if (/(전산세무|전산회계)/.test(name)) return "회계·세무";
  if (/(주택관리사|공인중개사|경비지도사|수목치료사)/.test(name)) return "전문 자격";
  return "환경·기타";
}

export function LicensesOverview() {
  const shouldReduce = useReducedMotion() ?? false;

  /* 카테고리별 인원수 합산 */
  const distribution = certifications.reduce<Record<CertCategory, number>>(
    (acc, c) => {
      const cat = categorizeCert(c.name);
      acc[cat] = (acc[cat] ?? 0) + c.count;
      return acc;
    },
    {
      "시설관리": 0,
      "안전·소방": 0,
      "회계·세무": 0,
      "전문 자격": 0,
      "환경·기타": 0,
    },
  );

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const entries = (Object.keys(distribution) as CertCategory[])
    .map((k) => ({ name: k, value: distribution[k] }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);

  /* SVG donut 계산 — radius 90, stroke 26, circumference */
  const R = 90;
  const C = 2 * Math.PI * R;
  let cumulative = 0;
  const arcs = entries.map((e) => {
    const portion = e.value / total;
    const dash = C * portion;
    const offset = -C * cumulative;
    cumulative += portion;
    return {
      ...e,
      dash,
      gap: C - dash,
      offset,
      color: CATEGORY_COLOR[e.name],
    };
  });

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="licenses-overview-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="BY CATEGORY"
            title="분야별 전문성"
            italicWord="전문성"
            subtitle="법적 자격과 기술 인증, 두 축으로 케이비개발의 전문성을 증명합니다."
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
          {/* 도넛 차트 */}
          <div className="flex justify-center">
            <div className="relative">
              <svg
                viewBox="0 0 240 240"
                className="h-[240px] w-[240px] md:h-[280px] md:w-[280px]"
                role="img"
                aria-label="자격증 분야별 분포"
              >
                {/* 배경 트랙 */}
                <circle
                  cx="120"
                  cy="120"
                  r={R}
                  fill="none"
                  stroke="#EEF0F4"
                  strokeWidth="26"
                />
                {/* 카테고리 arc */}
                <g transform="rotate(-90 120 120)">
                  {arcs.map((arc) => (
                    <circle
                      key={arc.name}
                      cx="120"
                      cy="120"
                      r={R}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="26"
                      strokeDasharray={`${arc.dash} ${arc.gap}`}
                      strokeDashoffset={arc.offset}
                      style={{
                        transition: shouldReduce
                          ? undefined
                          : "stroke-dashoffset 700ms var(--ease)",
                      }}
                    />
                  ))}
                </g>
                {/* 중앙 텍스트 */}
                <text
                  x="120"
                  y="112"
                  textAnchor="middle"
                  fontSize="42"
                  fontWeight="800"
                  fill="#0F1218"
                  fontFamily="var(--font-display)"
                >
                  {total.toLocaleString()}
                </text>
                <text
                  x="120"
                  y="136"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="#9099A5"
                  letterSpacing="3"
                >
                  TOTAL
                </text>
              </svg>
            </div>
          </div>

          {/* 범례 + 총 인허가·인증 카드 */}
          <div>
            <ul className="divide-y divide-line">
              {arcs.map((arc) => {
                const pct = ((arc.value / total) * 100).toFixed(1);
                return (
                  <li
                    key={arc.name}
                    className="grid grid-cols-12 items-baseline gap-4 py-4"
                  >
                    <span className="col-span-1 flex items-center">
                      <span
                        aria-hidden="true"
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ backgroundColor: arc.color }}
                      />
                    </span>
                    <span className="col-span-6 font-display text-[16px] font-bold text-ink-strong">
                      {arc.name}
                    </span>
                    <span className="col-span-3 text-right font-mono-num text-[15px] text-ink-muted">
                      {arc.value.toLocaleString()}명
                    </span>
                    <span className="col-span-2 text-right font-mono-num text-[13px] text-ink-faint">
                      {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-md border border-line bg-gray-50 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  LICENSES
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono-num font-display text-[36px] font-extrabold leading-none text-navy-800">
                    {licenses.length}
                  </span>
                  <span className="font-mono-num text-[16px] font-bold text-accent-500">+</span>
                </p>
                <p className="mt-2 text-[13px] text-ink-muted">
                  법적으로 등록된 사업 자격
                </p>
              </div>
              <div className="rounded-md border border-line bg-gray-50 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  CERTIFICATIONS
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono-num font-display text-[36px] font-extrabold leading-none text-navy-800">
                    {certifications.length}
                  </span>
                  <span className="font-mono-num text-[16px] font-bold text-accent-500">+</span>
                </p>
                <p className="mt-2 text-[13px] text-ink-muted">
                  전문 기술과 역량 자격
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <span id="licenses-overview-heading" className="sr-only">
        분야별 전문성
      </span>
    </section>
  );
}
