"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { differentiators } from "@/data/site-content";

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

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
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
      className="bg-cream py-32 md:py-40"
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

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={listVariants}
          className="border-b border-line"
        >
          {differentiators.map((d) => (
            <motion.li
              key={d.number}
              variants={itemVariants}
              className="border-t border-line py-12 lg:py-16"
            >
              <div className="grid grid-cols-12 items-start gap-6 lg:gap-12">
                <div className="col-span-2 lg:col-span-1">
                  <span
                    aria-hidden="true"
                    className="block font-serif text-3xl italic leading-none text-primary lg:text-4xl"
                  >
                    {d.number}
                  </span>
                </div>
                <div className="col-span-10 lg:col-span-7">
                  <h3 className="font-serif text-2xl font-bold leading-tight tracking-[-0.01em] text-ink md:text-3xl">
                    {d.koreanName}
                  </h3>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
                    {d.englishName}
                  </p>
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <p className="text-base leading-[1.85] text-ink-soft">
                    {d.description}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </Container>

      <span id="why-diff-heading" className="sr-only">
        다섯 가지 차이
      </span>
    </section>
  );
}
