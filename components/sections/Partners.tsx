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
    <section className="bg-bg-soft py-24 md:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-14 max-w-3xl md:mb-16"
        >
          <motion.p
            variants={item}
            className="font-display text-[18px] italic leading-none text-accent md:text-[20px]"
          >
            Our Clients
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 text-[32px] font-bold tracking-[-0.022em] text-ink-strong md:text-[44px]"
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
          className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4"
        >
          {partners.map((p) => (
            <motion.div
              key={p.name}
              variants={item}
              className="group flex h-32 flex-col justify-between bg-white p-6 transition-colors duration-300 hover:bg-bg-soft"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted transition-colors group-hover:text-accent">
                {CATEGORY_LABEL[p.category]}
              </p>
              <p className="text-[15px] font-bold tracking-[-0.02em] text-ink-strong">
                {p.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
