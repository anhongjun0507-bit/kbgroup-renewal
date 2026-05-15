"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { company } from "@/data/site-content";

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SUBTITLE = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const TAGLINE = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const shouldReduce = useReducedMotion() ?? false;

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.12,
        delayChildren: shouldReduce ? 0 : 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.9, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-label="히어로"
      className="relative bg-white"
    >
      <Container>
        <div className="grid min-h-[calc(100svh-72px)] grid-cols-1 items-center gap-12 py-16 md:min-h-[calc(100svh-90px)] md:gap-16 md:py-20 lg:grid-cols-12 lg:py-24">
          {/* LEFT — 카피 */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="lg:col-span-7"
          >
            <motion.p
              variants={item}
              className="text-[13px] font-medium tracking-wide text-ink-muted"
            >
              (주)케이비개발 · SINCE {company.foundedYear}
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-8 text-[44px] font-bold leading-[1.06] tracking-[-0.04em] text-ink-strong md:text-[72px] lg:text-[88px]"
            >
              <span className="block">{SLOGAN_LINE_1}</span>
              <span className="block">{SLOGAN_LINE_2}</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-10 max-w-xl text-lg leading-[1.7] text-ink md:text-xl"
            >
              {SUBTITLE}
              <br className="hidden md:block" />
              {TAGLINE}
            </motion.p>

            <motion.div
              variants={item}
              className="mt-12 flex flex-wrap items-center gap-5"
            >
              <a
                href="/about"
                className="group inline-flex items-center gap-3 border-b border-ink-strong pb-2 text-[15px] font-medium text-ink-strong transition-colors duration-300 hover:border-primary hover:text-primary"
              >
                회사 소개 보기
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <a
                href="/business"
                className="text-[15px] font-medium text-ink-muted transition-colors duration-200 hover:text-ink-strong"
              >
                사업영역
              </a>
            </motion.div>
          </motion.div>

          {/* RIGHT — 비주얼 placeholder (단지/회사 대표 사진 추후 교체) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: shouldReduce ? 0 : 1.4,
              delay: shouldReduce ? 0 : 0.5,
              ease: EASE_OUT,
            }}
            className="relative lg:col-span-5"
          >
            <div className="relative aspect-[4/5] w-full bg-bg-soft">
              <span className="absolute inset-0 flex items-center justify-center text-xs text-ink-faint">
                Key Visual · 추후 교체
              </span>
              {/* KB 3색 좌측 라인 */}
              <div className="absolute left-0 top-0 flex h-full w-1">
                <span className="flex-1 bg-secondary" />
                <span className="flex-1 bg-accent" />
                <span className="flex-1 bg-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-faint">
            Scroll
          </span>
          <span
            aria-hidden="true"
            className="h-8 w-px bg-ink-faint"
          />
        </div>
      </div>
    </section>
  );
}
