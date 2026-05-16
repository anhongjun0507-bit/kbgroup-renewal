"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { partners, type Partner } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const CATEGORY_LABEL: Record<Partner["category"], string> = {
  client: "발주처",
  public: "공공기관",
  construction: "시공사",
};

/* Phase 2.11 — 인증/파트너 로고 strip
   자료(실로고)가 없으므로 텍스트 placeholder를 grayscale 톤으로 표현, hover 시 컬러 살아남 */
export function Partners() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT },
    },
  };

  return (
    <section className="section bg-gray-50">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-12 max-w-3xl md:mb-16"
        >
          <motion.p
            variants={item}
            className="eyebrow"
          >
            PARTNERS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 font-extrabold tracking-tight text-ink-strong"
          >
            함께 신뢰를 쌓아온 파트너
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.04 } },
          }}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-3 lg:grid-cols-4"
        >
          {partners.map((p) => (
            <motion.div
              key={p.name}
              variants={item}
              className="group flex h-32 flex-col justify-between bg-white p-6 grayscale transition-all duration-300 [transition-timing-function:var(--ease)] hover:grayscale-0 hover:bg-bg-soft"
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-ink-faint transition-colors group-hover:text-accent-500">
                {CATEGORY_LABEL[p.category]}
              </p>
              <p className="text-[15px] font-bold tracking-tight text-ink-muted transition-colors group-hover:text-ink-strong">
                {p.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
