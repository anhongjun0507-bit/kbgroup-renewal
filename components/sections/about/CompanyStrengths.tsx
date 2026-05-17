"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { companyStrengths } from "@/data/site-content";

/* Phase 7 — PDF p22 회사 강점 5가지 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function CompanyStrengths() {
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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="company-strengths-heading"
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
            kicker="COMPANY STRENGTHS"
            title="케이비개발의 다섯 가지 강점"
            italicWord="강점"
            subtitle="10년의 운영으로 검증된 다섯 가지 차별 경쟁력입니다."
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-5"
        >
          {companyStrengths.map((s) => (
            <motion.li
              key={s.number}
              variants={itemVariants}
              className="group relative rounded-md border border-line bg-white p-7 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
            >
              <span
                aria-hidden="true"
                className="number-display block text-[32px] font-extrabold text-accent-ink"
              >
                {s.number}
              </span>
              <h3 className="mt-4 font-display text-[18px] font-bold tracking-tight text-ink-strong md:text-[20px]">
                {s.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.75] text-ink-muted">
                {s.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
