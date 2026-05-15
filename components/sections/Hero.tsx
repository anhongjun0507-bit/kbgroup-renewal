"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { company, yearsOfOperation } from "@/data/site-content";

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SUBTITLE = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const TAGLINE = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Hero footer strip — 핵심 한 줄 */
const HIGHLIGHTS = [
  { value: "12,000+", label: "관리 세대수" },
  { value: "85+", label: "운영 단지" },
  { value: `${yearsOfOperation}년`, label: "운영 경험" },
  { value: "11종", label: "인허가 보유" },
];

export function Hero() {
  const shouldReduce = useReducedMotion() ?? false;

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.1,
        delayChildren: shouldReduce ? 0 : 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-label="히어로"
      className="relative bg-white pt-20 pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-24"
    >
      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-5xl"
        >
          <motion.p
            variants={item}
            className="text-[13px] font-medium tracking-wide text-ink"
          >
            (주)케이비개발 · SINCE {company.foundedYear}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-8 font-bold leading-[1.04] tracking-[-0.04em] text-ink-strong"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
          >
            <span className="block">{SLOGAN_LINE_1}</span>
            <span className="block">
              {SLOGAN_LINE_2.slice(0, 3)}
              <span className="text-primary">{SLOGAN_LINE_2.slice(3)}</span>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-10 max-w-xl text-base leading-[1.7] text-ink md:text-lg"
          >
            {SUBTITLE}
            <br className="hidden md:block" />
            {TAGLINE}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center gap-6 md:gap-8"
          >
            <a
              href="/about"
              className="group inline-flex items-center gap-3 border-b border-ink-strong pb-2 text-[15px] font-medium text-ink-strong transition-colors duration-300 hover:border-primary hover:text-primary"
            >
              회사 소개 보기
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </a>
            <a
              href="/business"
              className="text-[15px] font-medium text-ink transition-colors duration-200 hover:text-ink-strong"
            >
              사업영역 보기
            </a>
          </motion.div>
        </motion.div>

        {/* Hero footer strip — 핵심 한 줄 */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduce ? 0 : 0.8,
            delay: shouldReduce ? 0 : 0.5,
            ease: EASE_OUT,
          }}
          className="mt-20 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-10 md:mt-24 md:grid-cols-4 md:gap-x-8 md:pt-12 lg:mt-28"
        >
          {HIGHLIGHTS.map((h) => (
            <div key={h.label}>
              <p className="text-[28px] font-bold tracking-[-0.03em] text-ink-strong md:text-[32px]">
                {h.value}
              </p>
              <p className="mt-1 text-xs font-medium text-ink md:text-sm">
                {h.label}
              </p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
