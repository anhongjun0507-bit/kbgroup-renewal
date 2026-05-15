"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { coreValues } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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
      className="bg-beige py-32 md:py-40"
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
            className="mb-20"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-16 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line/30"
        >
          {coreValues.map((value) => (
            <motion.div
              key={value.number}
              variants={itemVariants}
              className="px-6 text-center lg:px-12"
            >
              <p className="font-serif text-2xl italic text-primary">
                <span aria-hidden="true">{value.number}</span>{" "}
                {value.englishName}
              </p>
              <h3 className="mt-6 font-serif text-3xl font-bold tracking-[-0.01em] text-ink md:text-4xl">
                {value.koreanName}
              </h3>
              <p className="mx-auto mt-6 max-w-xs text-base leading-[1.85] text-ink-soft">
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
