"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { relatedCompanies } from "@/data/site-content";

/* Phase 7 — PDF p43~44 계열사 4사 (로고 포함)
   Phase 14-M (2026-05-20) — 6개로 확장 (㈜금태건설·㈜더케이금융대부 신규). lg:grid-cols-3 (3×2). */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function RelatedCompaniesGrid() {
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
      aria-labelledby="related-companies-heading"
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
            kicker="GROUP COMPANIES"
            title="함께 운영하는 계열사"
            italicWord="계열사"
            subtitle="㈜기담종합건설을 모회사로 한 그룹 시너지로 더 넓은 서비스를 제공합니다."
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
          className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          {relatedCompanies.map((c) => (
            <motion.li
              key={c.name}
              variants={itemVariants}
              className="group flex flex-col rounded-md border border-line bg-white p-7 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex h-20 items-center">
                {c.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.logo}
                    alt={`${c.name} 로고`}
                    className="block max-h-16 w-auto object-contain object-left grayscale transition-all duration-300 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="font-display text-[24px] font-bold text-navy-800">
                    {c.name}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-[16px] font-bold tracking-tight text-ink-strong md:text-[17px]">
                {c.name}
              </h3>
              <p className="mt-3 text-[13px] leading-[1.7] text-ink-muted">
                {c.note}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
