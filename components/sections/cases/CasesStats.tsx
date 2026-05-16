"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import CountUp from "react-countup";
import { Container } from "@/components/ui";
import { complexes } from "@/data/site-content";

/* Phase 5.G.1 — 다크 배경 통계 (회색 잔존 fix: useInView 대신 IntersectionObserver threshold 0.1) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Stat = {
  key: string;
  value: number;
  suffix: string;
  label: string;
  caption: string;
};

export function CasesStats() {
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

  const stats = useMemo<Stat[]>(() => {
    const totalSites = complexes.length;
    const distinctRegions = new Set(
      complexes.map((c) => c.region.split(" ")[0]),
    ).size;
    const lhCount = complexes.filter((c) => c.name.startsWith("LH")).length;
    return [
      { key: "sites", value: totalSites, suffix: "+", label: "운영 단지", caption: "SITES OPERATED" },
      { key: "regions", value: distinctRegions, suffix: "+", label: "운영 시도", caption: "REGIONS COVERED" },
      { key: "lh", value: lhCount, suffix: "+", label: "LH 발주", caption: "LH PROJECTS" },
    ];
  }, []);

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
            전국 <span className="text-accent-500">{complexes.length}개</span> 단지에서 신뢰를 쌓고 있습니다
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {stats.map((stat, idx) => (
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
              end={value}
              duration={Math.max(0.6, 0.6 + Math.log10(Math.max(1, value)) * 0.25)}
              delay={index * 0.1}
              separator=","
            />
          ) : (
            "0"
          )}
        </span>
        {suffix && (
          <span className="stat-suffix font-mono-num text-[22px] font-bold text-accent-500 md:text-[26px]">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-6 text-[16px] font-semibold text-white">{label}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
        {caption}
      </p>
    </motion.div>
  );
}
