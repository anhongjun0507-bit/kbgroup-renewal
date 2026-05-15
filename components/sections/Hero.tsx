"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { company } from "@/data/site-content";

// 추후 props로 분리 예정 — 현재는 컴포넌트 내부 상수.
const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";
const QUOTE = "공간을 책임진다는 것";
const QUOTE_LABEL = "— 케이비개발의 약속";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const shouldReduce = useReducedMotion() ?? false;

  const kicker = company.foundedYear
    ? `TRUSTED FACILITY PARTNER · SINCE ${company.foundedYear}`
    : "TRUSTED FACILITY PARTNER";

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.15,
        delayChildren: shouldReduce ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0 : 0.8,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduce ? 0 : 1.4,
        delay: shouldReduce ? 0 : 0.4,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <section
      aria-label="히어로"
      className="relative flex items-center overflow-hidden bg-cream"
      style={{ minHeight: "max(calc(100svh - 5rem), 720px)" }}
    >
      <Container className="relative w-full py-20 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[3fr_2fr] md:gap-12 lg:grid-cols-2 lg:gap-20">
          {/* LEFT — copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Kicker */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="mb-6 h-px w-12 bg-primary" />
              <div className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
                {kicker}
              </div>
            </motion.div>

            {/* Slogan */}
            <motion.h1
              variants={itemVariants}
              className="font-serif text-6xl font-bold leading-[0.95] tracking-[-0.03em] text-ink md:text-7xl lg:text-8xl xl:text-[120px]"
            >
              <span className="block">{SLOGAN_LINE_1}</span>
              <span className="serif-em block">{SLOGAN_LINE_2}</span>
            </motion.h1>

            {/* Gold divider */}
            <motion.div
              variants={itemVariants}
              className="mb-8 mt-10 h-px w-16 bg-gold"
              aria-hidden="true"
            />

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mb-12 max-w-md text-base leading-[1.85] text-ink-soft md:text-lg"
            >
              {SUBTITLE_LINE_1}
              <br />
              {SUBTITLE_LINE_2}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-8"
            >
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 border-b border-ink pb-2 text-sm font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out hover:border-primary hover:text-primary"
              >
                서비스 문의
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                href="/about/why"
                className="text-sm tracking-wide text-ink-soft transition-colors duration-300 ease-out hover:text-ink"
              >
                회사 소개
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT — image placeholder + floating quote */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            className="relative"
          >
            <div className="group/quote relative aspect-[3/4] overflow-hidden bg-beige">
              <span className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-ink-muted">
                Image · 추후 교체
              </span>
              <div className="absolute bottom-6 right-6 max-w-[85%] text-right opacity-90 transition-opacity duration-500 ease-out group-hover/quote:opacity-100">
                <p className="font-serif text-2xl italic leading-tight text-ink md:text-3xl">
                  &ldquo;{QUOTE}&rdquo;
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-ink-soft">
                  {QUOTE_LABEL}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator (desktop only) */}
      <motion.div
        className="absolute bottom-12 left-6 hidden flex-col items-start gap-3 sm:left-8 lg:left-12 lg:flex"
        initial={{ opacity: 0 }}
        animate={
          shouldReduce ? { opacity: 1 } : { opacity: 1, y: [0, 8, 0] }
        }
        transition={
          shouldReduce
            ? { opacity: { delay: 1.2, duration: 1 } }
            : {
                opacity: { delay: 1.2, duration: 1 },
                y: {
                  delay: 1.2,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
        aria-hidden="true"
      >
        <span className="block h-12 w-px bg-ink-soft/40" />
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-ink-soft">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
