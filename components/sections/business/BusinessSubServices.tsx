"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { BusinessArea } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  area: BusinessArea;
}

export function BusinessSubServices({ area }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const { subBusinesses } = area;

  if (subBusinesses.length === 0) return null;

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
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.12 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby={`sub-${area.id}`}
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
            kicker="SERVICES IN DETAIL"
            title="구체적인 서비스"
            italicWord="서비스"
            subtitle={area.summary}
            align="left"
            size="md"
            as="h2"
            className="mb-20"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {subBusinesses.map((name, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <motion.li
                key={name}
                variants={itemVariants}
                className="group border-t border-line pt-6 transition-colors duration-500 ease-out hover:border-primary"
              >
                <span
                  aria-hidden="true"
                  className="block font-serif text-2xl italic leading-none text-primary"
                >
                  {num}
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold leading-tight tracking-[-0.01em] text-ink md:text-2xl">
                  {name}
                </h3>
              </motion.li>
            );
          })}
        </motion.ul>
      </Container>

      <span id={`sub-${area.id}`} className="sr-only">
        구체적인 서비스
      </span>
    </section>
  );
}
