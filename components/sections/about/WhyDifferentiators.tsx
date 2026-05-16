"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { differentiators } from "@/data/site-content";

/* Phase 4.E.4 — 다섯 가지 차이
   좌측 sticky 큰 번호(01~05) + 우측 스크롤 stacking (Linear "How it works" 스타일)
   데스크탑은 sticky 레이아웃, 모바일은 일반 리스트로 fallback */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function WhyDifferentiators() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="why-diff-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="OUR DIFFERENCE"
            title="케이비개발의 다섯 가지 차이"
            italicWord="다섯 가지 차이"
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
          {/* 좌측 sticky 큰 번호 (데스크탑만) */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <p className="eyebrow text-ink-faint">OUR DIFFERENCE</p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-[44px] font-bold leading-none text-ink-faint/30">01</span>
                <span className="text-ink-faint">—</span>
                <span className="font-display text-[44px] font-bold leading-none text-accent-500">{String(differentiators.length).padStart(2, "0")}</span>
              </div>
              <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-ink-muted">
                숫자 하나하나에 케이비개발이 11년간 쌓아온 운영 철학이 담겨 있습니다.
              </p>
            </div>
          </div>

          {/* 우측 stacking 카드 */}
          <ul className="space-y-4 lg:space-y-6">
            {differentiators.map((d) => (
              <motion.li
                key={d.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={itemVariants}
                className="group rounded-md border border-line bg-white p-8 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)] lg:p-10"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
                  <div className="flex-shrink-0 md:w-32">
                    <span
                      aria-hidden="true"
                      className="font-display text-[44px] font-extrabold leading-none text-accent-500 lg:text-[56px]"
                    >
                      {d.number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                      {d.englishName}
                    </p>
                    <h3 className="mt-3 font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]">
                      {d.koreanName}
                    </h3>
                    <p className="mt-4 text-[15px] leading-[1.75] text-ink-muted md:text-[16px]">
                      {d.description}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </Container>

      <span id="why-diff-heading" className="sr-only">
        다섯 가지 차이
      </span>
    </section>
  );
}
