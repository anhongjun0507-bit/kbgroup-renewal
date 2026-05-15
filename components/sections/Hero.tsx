"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { company, yearsOfOperation } from "@/data/site-content";

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";
const QUOTE_LINE_1 = "공간을 책임진다는 약속,";
const QUOTE_LINE_2 = "지금까지 그리고 앞으로도.";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const shouldReduce = useReducedMotion() ?? false;

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.08,
        delayChildren: shouldReduce ? 0 : 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-label="히어로"
      className="relative overflow-hidden bg-gradient-to-br from-bg-soft via-white to-primary-soft/40 pb-20 pt-24 md:pb-28 md:pt-32 lg:pb-36 lg:pt-36"
    >
      {/* 배경 도형 — KB 3색 라인 (장식) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-secondary/[0.04] blur-3xl"
      />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* LEFT — 카피 + CTA */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              SINCE {company.foundedYear} · 종합 시설관리 파트너
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-ink-strong md:text-[60px] lg:text-[76px]"
            >
              <span className="block">{SLOGAN_LINE_1}</span>
              <span className="block text-primary">{SLOGAN_LINE_2}</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-md text-base leading-relaxed text-ink md:text-lg"
            >
              {SUBTITLE_LINE_1}
              <br />
              {SUBTITLE_LINE_2}
            </motion.p>

            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Button as="link" href="/about" variant="primary" size="lg">
                회사 소개
                <span aria-hidden="true">→</span>
              </Button>
              <Button as="link" href="/business" variant="outline" size="lg">
                사업영역 보기
              </Button>
            </motion.div>
          </motion.div>

          {/* RIGHT — 인용구 + KB 3색 + 핵심 지표 카드 */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduce ? 0 : 0.8,
              delay: shouldReduce ? 0 : 0.3,
              ease: EASE_OUT,
            }}
            className="relative"
          >
            <div className="rounded-3xl border border-line/60 bg-white p-8 shadow-md lg:p-10">
              {/* 인용 */}
              <p className="text-[22px] font-bold leading-[1.4] tracking-[-0.02em] text-ink-strong md:text-[26px]">
                {QUOTE_LINE_1}
                <br />
                {QUOTE_LINE_2}
              </p>
              <p className="mt-4 text-sm font-medium text-ink-muted">
                — 케이비개발의 약속
              </p>

              {/* KB 3색 라인 액센트 */}
              <div className="mt-10 flex items-center gap-3" aria-hidden="true">
                <span className="h-1.5 w-12 rounded-full bg-secondary" />
                <span className="h-1.5 w-12 rounded-full bg-accent" />
                <span className="h-1.5 w-12 rounded-full bg-primary" />
              </div>

              {/* 핵심 지표 */}
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-line/70 pt-8">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-ink-strong md:text-4xl">
                    {yearsOfOperation}
                    <span className="ml-1 text-xl text-ink">년</span>
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Years of Experience
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-ink-strong md:text-4xl">
                    11
                    <span className="ml-1 text-xl text-ink">+</span>
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Licenses & Certs
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
