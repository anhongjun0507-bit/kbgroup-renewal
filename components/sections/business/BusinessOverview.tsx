"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import type { BusinessArea } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  area: BusinessArea;
}

export function BusinessOverview({ area }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  const blockVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.12,
      },
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
      aria-labelledby={`overview-${area.id}`}
      className="bg-beige py-32 md:py-40"
    >
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Left — kicker + title + summary */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={blockVariants}
            className="lg:col-span-5"
          >
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <div className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              WHY US
            </div>
            <h2
              id={`overview-${area.id}`}
              className="mt-6 font-serif text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-ink md:text-4xl lg:text-5xl"
            >
              {area.name}의 새로운 <span className="serif-em">기준</span>
            </h2>
            <p className="mt-8 text-base leading-[1.85] text-ink-soft md:text-lg">
              {area.summary}
            </p>
          </motion.div>

          {/* Right — 3 reasons */}
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="lg:col-span-7"
          >
            {area.reasons.map((reason, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.li
                  key={reason.title}
                  variants={itemVariants}
                  className="grid grid-cols-12 items-start gap-6 border-t border-line py-8 last:border-b"
                >
                  <span
                    aria-hidden="true"
                    className="col-span-2 font-serif text-3xl italic leading-none text-primary md:col-span-1"
                  >
                    {num}
                  </span>
                  <div className="col-span-10 md:col-span-11">
                    <h3 className="font-serif text-xl font-bold leading-tight tracking-[-0.01em] text-ink md:text-2xl">
                      {reason.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
                      {reason.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
