"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import CountUp from "react-countup";
import { Container } from "@/components/ui";
import type { ContentComplex } from "@/lib/content/types";

/* Phase 5.G.1 — 다크 배경 통계 (회색 잔존 fix: useInView 대신 IntersectionObserver threshold 0.1)

   PLAN B / DAY 3 — data/site-content 직접 import 제거. 서버 페이지가 lib/content
   어댑터로 읽어 프롭으로 주입한다. */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Stat = {
  key: string;
  value: number;
  suffix: string;
  label: string;
  caption: string;
};

/** site_settings.stats 중 이 섹션이 쓰는 마케팅 표기값만 (E-7). */
export type CasesStatsValues = {
  activeComplexesDisplay: number;
  lhProjectsDisplay: number;
};

export function CasesStats({
  complexes,
  stats,
}: {
  /** is_active = true 단지. 운영 시도 수 계산에만 쓴다. */
  complexes: ContentComplex[];
  stats: CasesStatsValues;
}) {
  const shouldReduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const cards = useMemo<Stat[]>(() => {
    /* Phase 14-O — 운영 단지·LH 발주는 마케팅 표기(200+ / 15+) 사용. */
    const totalSites = stats.activeComplexesDisplay;
    const distinctRegions = new Set(
      complexes.map((c) => c.region.split(" ")[0]),
    ).size;
    return [
      { key: "sites", value: totalSites, suffix: "+", label: "운영 단지", caption: "SITES OPERATED" },
      { key: "regions", value: distinctRegions, suffix: "+", label: "운영 시도", caption: "REGIONS COVERED" },
      { key: "lh", value: stats.lhProjectsDisplay, suffix: "+", label: "LH 발주", caption: "LH PROJECTS" },
    ];
  }, [complexes, stats]);

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
      ref={sectionRef}
      data-surface="dark"
      aria-labelledby="cases-stats-heading"
      className="section relative isolate overflow-hidden bg-navy-900 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(45% 50% at 25% 30%, rgba(201,162,75,0.12) 0%, transparent 60%)",
            "radial-gradient(40% 45% at 80% 70%, rgba(30,44,86,0.7) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          className="mb-16 text-center"
        >
          <div aria-hidden="true" className="mx-auto mb-6 h-[3px] w-12 bg-accent-500" />
          <p className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
            NATIONWIDE PORTFOLIO
          </p>
          <h2
            id="cases-stats-heading"
            className="mt-6 font-display font-extrabold leading-[1.15] tracking-tight"
            style={{ color: "#ffffff", fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            전국 <span className="text-accent-500">{stats.activeComplexesDisplay}+</span>개 단지에서 신뢰를 쌓고 있습니다
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {cards.map((stat, idx) => (
            <StatCard
              key={stat.key}
              stat={stat}
              index={idx}
              inView={inView}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function StatCard({
  stat,
  index,
  inView,
  shouldReduce,
}: {
  stat: Stat;
  index: number;
  inView: boolean;
  shouldReduce: boolean;
}) {
  const { value, suffix, label, caption } = stat;
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.1,
        ease: EASE_OUT_EXPO,
      }}
      className="rounded-md border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]"
    >
      <p className="stat-cell flex items-baseline justify-center gap-1">
        <span
          className="stat-number font-mono-num font-display text-[56px] font-extrabold leading-none text-white md:text-[72px]"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          {shouldReduce ? (
            value.toLocaleString("en-US")
          ) : inView ? (
            <CountUp
              /* Phase 14-B B-3 — 시작 진폭 70%→90%로 상향, duration 단축.
                 70% 시작은 사용자가 22,400→32,000 깜빡임으로 인지함 */
              start={Math.round(value * 0.96)}
              end={value}
              duration={Math.max(0.3, 0.3 + Math.log10(Math.max(1, value)) * 0.1)}
              delay={index * 0.05}
              separator=","
            />
          ) : (
            /* Phase 11 P0-C — fallback도 최종값 (0 대신) */
            value.toLocaleString("en-US")
          )}
        </span>
        {suffix && (
          <span className="stat-suffix font-mono-num text-[22px] font-bold text-accent-500 md:text-[26px]">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-6 text-[16px] font-semibold text-white">{label}</p>
      {/* Phase 11 P2-D — caption 자간/색 eyebrow 토큰과 통일 */}
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-300">
        {caption}
      </p>
    </motion.div>
  );
}
