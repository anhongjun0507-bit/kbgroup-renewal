"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { complexes } from "@/data/site-content";

/* Phase 14-K K-7 — 한반도 SVG 지도 → 권역·지역별 인포그래픽으로 디자인 재구성.
   이전: 추상 SVG 지도 + 원형 핀(작은 화면 가독성·디자인 모두 약함)
   변경:
     1) 권역(수도권·호남권·영남권·충청권·강원·제주) 카드 그리드 — 단지 수·LH 비율 한눈에
     2) 시도별 가로 막대 차트 — 정확한 수치·정렬 비교 강화 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type RegionKey =
  | "수도권"
  | "호남권"
  | "충청권"
  | "영남권"
  | "강원"
  | "제주";

const REGION_MAP: Record<string, RegionKey> = {
  "서울특별시": "수도권",
  "서울": "수도권",
  "인천광역시": "수도권",
  "인천": "수도권",
  "경기도": "수도권",
  "경기": "수도권",
  "강원도": "강원",
  "강원": "강원",
  "강원특별자치도": "강원",
  "충청북도": "충청권",
  "충북": "충청권",
  "충청남도": "충청권",
  "충남": "충청권",
  "대전광역시": "충청권",
  "대전": "충청권",
  "세종특별자치시": "충청권",
  "세종": "충청권",
  "전라북도": "호남권",
  "전북": "호남권",
  "전북특별자치도": "호남권",
  "전라남도": "호남권",
  "전남": "호남권",
  "광주광역시": "호남권",
  "광주": "호남권",
  "경상북도": "영남권",
  "경북": "영남권",
  "대구광역시": "영남권",
  "대구": "영남권",
  "경상남도": "영남권",
  "경남": "영남권",
  "부산광역시": "영남권",
  "부산": "영남권",
  "울산광역시": "영남권",
  "울산": "영남권",
  "제주특별자치도": "제주",
  "제주": "제주",
};

const REGION_ORDER: RegionKey[] = [
  "호남권",
  "수도권",
  "충청권",
  "영남권",
  "강원",
  "제주",
];

const REGION_LABEL: Record<RegionKey, { english: string; description: string }> = {
  "호남권": { english: "HONAM", description: "본사 거점 · 광주·전남·전북" },
  "수도권": { english: "CAPITAL", description: "서울·인천·경기" },
  "충청권": { english: "CHUNGCHEONG", description: "대전·세종·충북·충남" },
  "영남권": { english: "YEONGNAM", description: "부산·대구·울산·경북·경남" },
  "강원": { english: "GANGWON", description: "강원특별자치도" },
  "제주": { english: "JEJU", description: "제주특별자치도" },
};

function firstToken(region: string): string {
  return region.split(/\s+/)[0];
}

function isLh(name: string, type?: string): boolean {
  return name.startsWith("LH") || type === "LH";
}

export function CasesMap() {
  const shouldReduce = useReducedMotion() ?? false;

  /* 권역별 집계 */
  const byRegion = useMemo(() => {
    const m = new Map<RegionKey, { count: number; lh: number }>();
    for (const c of complexes) {
      const key = REGION_MAP[firstToken(c.region)];
      if (!key) continue;
      const prev = m.get(key) ?? { count: 0, lh: 0 };
      m.set(key, {
        count: prev.count + 1,
        lh: prev.lh + (isLh(c.name, c.type) ? 1 : 0),
      });
    }
    return m;
  }, []);

  /* 시도별 집계 (막대 차트) */
  const byProvince = useMemo(() => {
    const m = new Map<string, { count: number; lh: number }>();
    for (const c of complexes) {
      const first = firstToken(c.region);
      if (!REGION_MAP[first]) continue;
      const prev = m.get(first) ?? { count: 0, lh: 0 };
      m.set(first, {
        count: prev.count + 1,
        lh: prev.lh + (isLh(c.name, c.type) ? 1 : 0),
      });
    }
    return Array.from(m.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const total = complexes.length;
  const totalLh = complexes.filter((c) => isLh(c.name, c.type)).length;
  const maxCount = Math.max(1, ...byProvince.map((p) => p.count));

  const headerVariants: Variants = {
    hidden: { opacity: 1, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 1, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
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
        >
          <Heading
            kicker="NATIONWIDE FOOTPRINT"
            title="전국 운영 분포"
            italicWord="전국"
            subtitle={`수도권부터 호남·영남까지 ${total}개 단지를 직접 운영하고 있습니다.`}
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        {/* 1) 권역 카드 그리드 */}
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4"
          aria-label="권역별 운영 단지"
        >
          {REGION_ORDER.map((key) => {
            const stat = byRegion.get(key);
            const count = stat?.count ?? 0;
            const lh = stat?.lh ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            const meta = REGION_LABEL[key];
            const isHeadquarters = key === "호남권";
            return (
              <motion.li
                key={key}
                variants={itemVariants}
                className={
                  "relative overflow-hidden rounded-md border bg-white p-5 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)] " +
                  (isHeadquarters ? "border-accent-500" : "border-line")
                }
              >
                {/* 좌측 accent bar */}
                <span
                  aria-hidden="true"
                  className={
                    "absolute inset-y-0 left-0 w-[3px] " +
                    (isHeadquarters ? "bg-accent-500" : "bg-navy-700/30")
                  }
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                  {meta.english}
                </p>
                <p className="mt-1 font-display text-[16px] font-bold tracking-tight text-ink-strong">
                  {key}
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-[32px] font-extrabold leading-none text-navy-800">
                    {count}
                  </span>
                  <span className="font-mono-num text-[12px] font-semibold text-ink-faint">
                    개 단지
                  </span>
                </p>
                {/* 미니 막대 */}
                <div
                  className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line"
                  aria-hidden="true"
                >
                  <span
                    className={
                      "block h-full rounded-full " +
                      (isHeadquarters ? "bg-accent-500" : "bg-navy-700")
                    }
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      transition: shouldReduce
                        ? undefined
                        : "width 700ms var(--ease)",
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                  {lh > 0 ? `LH 발주 ${lh}건 포함` : "민간 운영"}
                </p>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* 2) 시도별 가로 막대 차트 */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
          >
            <p className="eyebrow">BY PROVINCE</p>
            <h3 className="mt-3 font-display text-[20px] font-bold tracking-tight text-ink-strong md:text-[24px]">
              시도별 운영 단지 수
            </h3>
            <p className="mt-3 text-[13px] text-ink-muted">
              막대 길이는 최다 시도 기준 상대 비교, 우측 숫자는 절대 단지 수입니다.
            </p>
            <ul className="mt-8 space-y-4">
              {byProvince.map((p, idx) => {
                const pct = (p.count / maxCount) * 100;
                return (
                  <motion.li
                    key={p.name}
                    variants={itemVariants}
                    className="space-y-1.5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[14px] font-bold text-ink-strong md:text-[15px]">
                        {p.name}
                      </span>
                      <span className="flex flex-shrink-0 items-baseline gap-2 whitespace-nowrap">
                        <span className="font-mono-num text-[15px] font-bold text-ink-strong">
                          {p.count}
                          <span className="ml-0.5 text-[11px] font-medium text-ink-faint">
                            개
                          </span>
                        </span>
                        {p.lh > 0 && (
                          <span className="font-mono-num text-[11px] font-semibold text-accent-deep">
                            ·LH {p.lh}
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      className="relative h-2 w-full overflow-hidden rounded-full bg-line"
                      role="progressbar"
                      aria-valuenow={p.count}
                      aria-valuemin={0}
                      aria-valuemax={maxCount}
                      aria-label={`${p.name} ${p.count}개 단지`}
                    >
                      <span
                        className={
                          "absolute inset-y-0 left-0 block rounded-full " +
                          (p.lh > 0 ? "bg-accent-500" : "bg-navy-700")
                        }
                        style={{
                          width: `${pct}%`,
                          transition: shouldReduce
                            ? undefined
                            : `width 700ms var(--ease) ${idx * 50}ms`,
                        }}
                      />
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {/* 3) 합계 카드 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
            className="rounded-md border border-line bg-gray-50 p-7 md:p-8"
          >
            <p className="eyebrow">NATIONWIDE TOTAL</p>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[48px] font-extrabold leading-none text-navy-800 md:text-[56px]">
                {total}
              </span>
              <span className="font-mono-num text-[16px] font-bold text-accent-ink">
                개 단지
              </span>
            </p>
            <p className="mt-2 text-[14px] text-ink-muted">
              전국 {byProvince.length}개 시도에서 직접 운영 중
            </p>

            <div className="mt-8 space-y-4 border-t border-line pt-6">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-strong">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-sm bg-accent-500"
                  />
                  LH 발주
                </span>
                <span className="font-mono-num text-[16px] font-bold text-ink-strong">
                  {totalLh}
                  <span className="ml-0.5 text-[12px] font-medium text-ink-faint">
                    개
                  </span>
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-strong">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-sm bg-navy-700"
                  />
                  민간 운영
                </span>
                <span className="font-mono-num text-[16px] font-bold text-ink-strong">
                  {total - totalLh}
                  <span className="ml-0.5 text-[12px] font-medium text-ink-faint">
                    개
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      <span id="cases-map-heading" className="sr-only">
        전국 운영 단지 분포
      </span>
    </section>
  );
}
