"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import CountUp from "react-countup";
import { Container } from "@/components/ui";
import type { Counter, SettingValue } from "@/lib/content";

/* Phase 13 — WhyNumbers 전면 갱신
   기존 v9 톤(font-serif + leading-none + ink 배경)이 P0-C/P0-G 처방 누락.
   숫자 80px 글자가 ascender/descender 클리핑 + 0 노출 + items-start 어색 정렬.
   DataCounter/WorkforceStats/CasesStats 톤으로 통일 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** 카운터는 app/about/page.tsx 가 콘텐츠 어댑터에서 읽어 주입한다 (PLAN B / DAY 4). */
export function WhyNumbers({ counters }: { counters: SettingValue<"counters"> }) {
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
      { threshold: 0.1, rootMargin: "-10% 0px" },
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
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
      aria-labelledby="why-numbers-heading"
      className="section relative isolate overflow-hidden bg-navy-900 text-white"
    >
      {/* mesh radial */}
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
            BY THE NUMBERS
          </p>
          <h2
            id="why-numbers-heading"
            className="mt-6 font-display font-extrabold leading-[1.15] tracking-tight"
            style={{ color: "#ffffff", fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            <span className="text-accent-500">숫자</span>가 증명합니다
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {counters.map((counter, idx) => (
            <NumberCard
              key={counter.key}
              counter={counter}
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

function NumberCard({
  counter,
  index,
  inView,
  shouldReduce,
}: {
  counter: Counter;
  index: number;
  inView: boolean;
  shouldReduce: boolean;
}) {
  /* Phase 14-N — displayValue/displaySuffix가 있으면 그것 우선 (마케팅 표기와 실제 length 분리) */
  const shown = counter.displayValue ?? counter.value;
  const shownSuffix = counter.displaySuffix ?? counter.suffix;
  const { label, caption } = counter;
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.1,
        ease: EASE_OUT_EXPO,
      }}
      className="rounded-md border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]"
    >
      <p className="stat-cell flex items-baseline gap-1">
        <span
          className="stat-number font-mono-num font-display text-[44px] font-extrabold text-white md:text-[56px] lg:text-[64px]"
          style={{ letterSpacing: "var(--tracking-tight)" }}
        >
          {shouldReduce ? (
            shown.toLocaleString("en-US")
          ) : inView ? (
            <CountUp
              start={Math.round(shown * 0.7)}
              end={shown}
              duration={Math.max(0.6, 0.6 + Math.log10(Math.max(1, shown)) * 0.25)}
              delay={index * 0.1}
              separator=","
            />
          ) : (
            shown.toLocaleString("en-US")
          )}
        </span>
        {shownSuffix && (
          <span className="stat-suffix font-mono-num text-[20px] font-bold text-accent-500 md:text-[22px]">
            {shownSuffix}
          </span>
        )}
      </p>
      <p className="mt-6 text-[15px] font-semibold text-white">{label}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-300">
        {caption}
      </p>
    </motion.div>
  );
}
