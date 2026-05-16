"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import CountUp from "react-countup";
import { Container } from "@/components/ui";
import {
  certifications,
  licenses,
  totalCertHolders,
  yearsOfOperation,
} from "@/data/site-content";

/* Phase 4.H.1, 4.H.2 — 인력·인증 통계 대시보드
   - 4컬럼 → 2 row 카드 그리드 + 좌측 라인 아이콘
   - 모바일 회색 잔존 버그 fix: useInView amount 0.3 → 0.1 + 단일 IntersectionObserver */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Stat = {
  key: string;
  value: number;
  suffix: string;
  label: string;
  caption: string;
  icon: React.ReactNode;
};

const ICON_BASE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WorkforceStats() {
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

  const stats: Stat[] = [
    {
      key: "workforce",
      value: totalCertHolders,
      suffix: "명+",
      label: "자격증 보유 인력",
      caption: "CERTIFIED PROFESSIONALS",
      icon: (
        <svg viewBox="0 0 40 40" {...ICON_BASE}>
          <circle cx="20" cy="14" r="6" />
          <path d="M8 34c0-7 5-12 12-12s12 5 12 12" />
        </svg>
      ),
    },
    {
      key: "licenses",
      value: licenses.length,
      suffix: "+",
      label: "보유 인허가",
      caption: "REGISTERED LICENSES",
      icon: (
        <svg viewBox="0 0 40 40" {...ICON_BASE}>
          <rect x="8" y="6" width="24" height="28" rx="2" />
          <path d="M14 14H26M14 20H26M14 26H22" />
        </svg>
      ),
    },
    {
      key: "certifications",
      value: certifications.length,
      suffix: "+",
      label: "기술 자격증",
      caption: "CERTIFICATION TYPES",
      icon: (
        <svg viewBox="0 0 40 40" {...ICON_BASE}>
          <path d="M20 4L25 9L31 9L31 15L36 20L31 25L31 31L25 31L20 36L15 31L9 31L9 25L4 20L9 15L9 9L15 9Z" />
          <path d="M14 20L18 24L26 16" />
        </svg>
      ),
    },
    {
      key: "years",
      value: yearsOfOperation,
      suffix: "년+",
      label: "운영 경험",
      caption: "OPERATION HISTORY",
      icon: (
        <svg viewBox="0 0 40 40" {...ICON_BASE}>
          <circle cx="20" cy="20" r="14" />
          <path d="M20 12V20L25 25" />
        </svg>
      ),
    },
  ];

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
      aria-labelledby="workforce-stats-heading"
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
          <div
            aria-hidden="true"
            className="mx-auto mb-6 h-[3px] w-12 bg-accent-500"
          />
          <p
            className="eyebrow"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            WORKFORCE &amp; EXPERTISE
          </p>
          <h2
            id="workforce-stats-heading"
            className="mt-6 font-display font-extrabold leading-[1.15] tracking-tight"
            style={{
              color: "#ffffff",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {totalCertHolders.toLocaleString("en-US")}명의{" "}
            <span className="text-accent-500">전문 인력</span>이 함께합니다
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
  const { value, suffix, label, caption, icon } = stat;
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.1,
        ease: EASE_OUT_EXPO,
      }}
      className="group rounded-md border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]"
    >
      <div className="h-9 w-9 text-white/90">{icon}</div>
      <div
        aria-hidden="true"
        className="mt-5 h-[3px] w-6 bg-accent-500 transition-[width] duration-300 [transition-timing-function:var(--ease)] group-hover:w-12"
      />
      <p className="stat-cell mt-5 flex items-baseline gap-1">
        <span
          className="stat-number font-mono-num font-display text-[44px] font-extrabold leading-none text-white md:text-[56px]"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          {shouldReduce ? (
            value.toLocaleString("en-US")
          ) : inView ? (
            <CountUp
              /* Phase 11 P0-C — 70% 진폭에서 시작 (0 노출 방지) */
              start={Math.round(value * 0.7)}
              end={value}
              duration={Math.max(0.6, 0.6 + Math.log10(Math.max(1, value)) * 0.25)}
              delay={index * 0.1}
              separator=","
            />
          ) : (
            /* Phase 11 P0-C — fallback도 최종값 (0 대신) */
            value.toLocaleString("en-US")
          )}
        </span>
        {suffix && (
          <span className="stat-suffix font-mono-num text-[18px] font-bold text-accent-500 md:text-[20px]">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-6 text-[15px] font-semibold text-white">{label}</p>
      {/* Phase 11 P2-D — caption 자간/색 eyebrow 토큰과 통일 (다크 위 accent-300) */}
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-300">
        {caption}
      </p>
    </motion.div>
  );
}
