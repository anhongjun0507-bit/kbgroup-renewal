"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { complexes } from "@/data/site-content";

/* Phase 5.G.2 — 대한민국 SVG 지도 + 운영 단지 핀
   광역시·도 단위 좌표 매핑. 단지 region에서 첫 토큰으로 분류 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* 광역시·도 핀 좌표 (300x400 viewBox 기준) — 대략 위치
   Phase 14-C C-4: 서울(110,130)과 경기(120,145) 간 거리 부족으로 라벨 침범.
     경기 → (140, 158)로 우하 분리, 인천 → (78, 135)로 좌 분리 */
const REGION_POS: Record<string, { x: number; y: number; short: string }> = {
  "서울특별시": { x: 110, y: 128, short: "서울" },
  "서울": { x: 110, y: 128, short: "서울" },
  "인천광역시": { x: 78, y: 135, short: "인천" },
  "인천": { x: 78, y: 135, short: "인천" },
  "경기도": { x: 140, y: 158, short: "경기" },
  "경기": { x: 140, y: 158, short: "경기" },
  "강원도": { x: 175, y: 110, short: "강원" },
  "강원": { x: 175, y: 110, short: "강원" },
  "강원특별자치도": { x: 175, y: 110, short: "강원" },
  "충청북도": { x: 150, y: 175, short: "충북" },
  "충북": { x: 150, y: 175, short: "충북" },
  "충청남도": { x: 110, y: 185, short: "충남" },
  "충남": { x: 110, y: 185, short: "충남" },
  "대전광역시": { x: 130, y: 200, short: "대전" },
  "대전": { x: 130, y: 200, short: "대전" },
  "세종특별자치시": { x: 125, y: 195, short: "세종" },
  "세종": { x: 125, y: 195, short: "세종" },
  "전라북도": { x: 105, y: 235, short: "전북" },
  "전북": { x: 105, y: 235, short: "전북" },
  "전북특별자치도": { x: 105, y: 235, short: "전북" },
  "전라남도": { x: 100, y: 285, short: "전남" },
  "전남": { x: 100, y: 285, short: "전남" },
  "광주광역시": { x: 100, y: 270, short: "광주" },
  "광주": { x: 100, y: 270, short: "광주" },
  "경상북도": { x: 200, y: 195, short: "경북" },
  "경북": { x: 200, y: 195, short: "경북" },
  "대구광역시": { x: 190, y: 225, short: "대구" },
  "대구": { x: 190, y: 225, short: "대구" },
  "경상남도": { x: 175, y: 265, short: "경남" },
  "경남": { x: 175, y: 265, short: "경남" },
  "부산광역시": { x: 215, y: 270, short: "부산" },
  "부산": { x: 215, y: 270, short: "부산" },
  "울산광역시": { x: 230, y: 245, short: "울산" },
  "울산": { x: 230, y: 245, short: "울산" },
  "제주특별자치도": { x: 95, y: 360, short: "제주" },
  "제주": { x: 95, y: 360, short: "제주" },
};

function getPos(region: string) {
  const first = region.split(/\s+/)[0];
  return REGION_POS[first];
}

export function CasesMap() {
  const shouldReduce = useReducedMotion() ?? false;

  /* 광역시·도별 단지 수 카운트 */
  const counts = useMemo(() => {
    const m = new Map<string, { count: number; lh: number }>();
    for (const c of complexes) {
      const first = c.region.split(/\s+/)[0];
      if (!REGION_POS[first]) continue;
      const prev = m.get(first) ?? { count: 0, lh: 0 };
      const isLh = c.name.startsWith("LH") || c.type === "LH";
      m.set(first, { count: prev.count + 1, lh: prev.lh + (isLh ? 1 : 0) });
    }
    return Array.from(m.entries()).map(([region, { count, lh }]) => ({
      region,
      count,
      lh,
      pos: REGION_POS[region],
    }));
  }, []);

  const maxCount = useMemo(() => Math.max(1, ...counts.map((c) => c.count)), [counts]);

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
      aria-labelledby="cases-map-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          className="mb-12"
        >
          <Heading
            kicker="NATIONWIDE COVERAGE"
            title="전국 운영 분포"
            italicWord="분포"
            subtitle="시도 단위로 보는 케이비개발 운영 단지 현황"
            align="left"
            size="md"
            as="h2"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* 지도 SVG */}
          <div className="rounded-md border border-line bg-gray-50 p-6">
            <svg
              viewBox="0 0 300 400"
              role="img"
              aria-label="대한민국 시도별 운영 단지 지도"
              className="h-auto w-full max-w-[420px] mx-auto"
            >
              {/* 추상 한반도 실루엣 — 단순화된 path */}
              <path
                d="M120 60 C 140 50, 170 60, 180 80 C 195 95, 210 110, 215 130 C 220 150, 230 170, 235 195 C 240 225, 230 250, 225 270 C 220 290, 200 300, 175 295 C 160 290, 140 285, 120 290 C 100 295, 85 290, 78 270 C 70 250, 72 225, 80 200 C 86 180, 88 160, 85 140 C 82 120, 92 95, 105 80 C 110 70, 115 62, 120 60 Z"
                fill="#EEF0F4"
                stroke="#DEE2E8"
                strokeWidth="1.2"
              />
              {/* 제주 */}
              <ellipse cx="95" cy="362" rx="22" ry="10" fill="#EEF0F4" stroke="#DEE2E8" strokeWidth="1.2" />

              {/* 핀 — Phase 14 UP-03: hover 인터랙션 + native tooltip */}
              {counts.map(({ region, count, lh, pos }) => {
                const r = 6 + (count / maxCount) * 14;
                const hasLh = lh > 0;
                const tooltip =
                  `${region} · ${count}개 단지` +
                  (hasLh ? ` (LH 발주 ${lh}개 포함)` : "");
                return (
                  <g
                    key={region}
                    className="cases-map-pin cursor-pointer transition-transform duration-200 [transform-box:fill-box] [transform-origin:center] hover:scale-110 focus-visible:scale-110"
                    tabIndex={0}
                    role="img"
                    aria-label={tooltip}
                  >
                    <title>{tooltip}</title>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={hasLh ? "rgba(201,162,75,0.18)" : "rgba(21,32,63,0.18)"}
                      stroke={hasLh ? "#C9A24B" : "#0E1F3A"}
                      strokeWidth="1.5"
                      className="transition-[fill,stroke-width] duration-200 group-hover:stroke-[2.5]"
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={3}
                      fill={hasLh ? "#C9A24B" : "#0E1F3A"}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - r - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill="#0E1F3A"
                    >
                      {pos.short}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#FFFFFF"
                    >
                      {count}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* 범례 */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-[12px] text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border border-accent-500 bg-accent-500/20" />
                LH 발주 포함
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border border-navy-800 bg-navy-800/20" />
                민간 단지
              </span>
            </div>
          </div>

          {/* 시도 리스트 */}
          <div>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {counts
                .sort((a, b) => b.count - a.count)
                .map(({ region, count, lh }) => (
                  <li
                    key={region}
                    className="flex items-baseline justify-between rounded-sm border border-line bg-white px-4 py-3"
                  >
                    <span className="font-display text-[14px] font-bold text-ink-strong">
                      {region}
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span className="font-mono-num text-[18px] font-extrabold text-navy-800">
                        {count}
                      </span>
                      {lh > 0 && (
                        <span className="font-mono-num text-[11px] font-bold text-accent-ink">
                          ·LH{lh}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Container>

      <span id="cases-map-heading" className="sr-only">전국 운영 분포</span>
    </section>
  );
}
