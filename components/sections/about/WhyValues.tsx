"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { coreValues } from "@/data/site-content";

/* Phase 4.E.3 — 세 가지 가치
   3컬럼 카드 + 큰 라인 아이콘 + hover 좌측 라인 24 → 64 expand */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* Trust / Expertise / Responsibility — 라인 아이콘 */
const VALUE_ICONS: Record<string, React.ReactNode> = {
  Trust: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 8L46 14V28C46 38 38 46 28 50C18 46 10 38 10 28V14L28 8Z" />
      <path d="M20 28L26 34L37 22" />
    </svg>
  ),
  Expertise: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 6L34 22L50 22L37 32L42 48L28 38L14 48L19 32L6 22L22 22Z" />
      <circle cx="28" cy="28" r="3" />
    </svg>
  ),
  Responsibility: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 46V18L28 8L46 18V46" />
      <path d="M10 46H46" />
      <path d="M20 46V28H36V46" />
      <path d="M28 36V40" />
    </svg>
  ),
};

export function WhyValues() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.15 } },
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
      aria-labelledby="why-values-heading"
      className="section bg-gray-50"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="CORE VALUES"
            title="세 가지 가치"
            italicWord="가치"
            align="center"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          {coreValues.map((value) => (
            <motion.div
              key={value.number}
              variants={itemVariants}
              className="group relative flex h-full flex-col rounded-md border border-line bg-white p-8 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)] md:p-10"
            >
              {/* 좌측 accent bar — hover 시 24 → 64 expand (세로 라인) */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-8 h-6 w-[3px] bg-accent-500 transition-[height] duration-300 [transition-timing-function:var(--ease)] group-hover:h-16 md:top-10"
              />

              <p className="ml-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {value.number} · {value.englishName}
              </p>

              {/* Phase 6 C-2 — 원형 배지 (accent-100 배경 + accent-500 아이콘) */}
              <div
                className="mt-6 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--color-accent-100)" }}
              >
                <div
                  className="h-7 w-7 text-accent-500 transition-colors duration-200 group-hover:text-accent-600"
                  aria-hidden="true"
                >
                  {VALUE_ICONS[value.englishName] ?? null}
                </div>
              </div>

              <h3 className="mt-6 font-display text-[28px] font-bold tracking-tight text-ink-strong">
                {value.koreanName}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-muted">
                {value.tagline}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      <span id="why-values-heading" className="sr-only">
        세 가지 가치
      </span>
    </section>
  );
}
