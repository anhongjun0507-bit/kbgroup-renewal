"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { company } from "@/data/site-content";

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

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
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-label="히어로"
      className="relative bg-white pb-24 pt-28 md:pb-32 md:pt-36 lg:pb-40 lg:pt-44"
    >
      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.div
            variants={item}
            className="text-[13px] font-semibold tracking-wide text-ink-muted"
          >
            (주)케이비개발 · SINCE {company.foundedYear}
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 text-[44px] font-bold leading-[1.04] tracking-[-0.035em] text-ink-strong md:text-[68px] lg:text-[88px]"
          >
            <span className="block">{SLOGAN_LINE_1}</span>
            <span className="block">{SLOGAN_LINE_2}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-2xl text-lg leading-[1.7] text-ink md:text-xl"
          >
            {SUBTITLE_LINE_1}
            <br className="hidden md:block" />
            {SUBTITLE_LINE_2}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center gap-3"
          >
            <Button as="link" href="/about" variant="primary" size="lg">
              회사 소개
              <span aria-hidden="true">→</span>
            </Button>
            <Button as="link" href="/business" variant="outline" size="lg">
              사업영역 보기
            </Button>
          </motion.div>

          {/* KB 3색 액센트 — 매우 작게 */}
          <motion.div
            variants={item}
            className="mt-16 flex items-center gap-2"
            aria-hidden="true"
          >
            <span className="h-1 w-8 rounded-full bg-secondary" />
            <span className="h-1 w-8 rounded-full bg-accent" />
            <span className="h-1 w-8 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
