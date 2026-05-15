"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { partners, type Partner } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const CATEGORY_LABEL: Record<Partner["category"], string> = {
  client: "발주처",
  public: "공공기관",
  construction: "시공사",
};

export function Partners() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.4, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-bg-soft py-20 md:py-24 lg:py-28">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduce ? 0 : 0.08 },
            },
          }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center rounded-full bg-secondary-soft px-3.5 py-1.5 text-xs font-semibold text-secondary"
          >
            PARTNERS · 파트너사
          </motion.div>
          <motion.h2
            variants={item}
            className="mt-4 text-3xl font-bold tracking-tight text-ink-strong md:text-[40px]"
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
            visible: {
              transition: { staggerChildren: shouldReduce ? 0 : 0.05 },
            },
          }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {partners.map((p) => (
            <motion.div
              key={p.name}
              variants={item}
              className="flex h-full flex-col justify-between rounded-xl border border-line/60 bg-white p-5"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                  {CATEGORY_LABEL[p.category]}
                </p>
                <p className="mt-2 text-[15px] font-bold tracking-tight text-ink-strong">
                  {p.name}
                </p>
              </div>
              {p.placeholder && (
                <p className="mt-3 text-[10px] font-medium text-ink-faint">
                  * 표기 예정
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
