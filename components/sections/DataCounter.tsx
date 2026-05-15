"use client";

import CountUp from "react-countup";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { counters } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section className="border-y border-line bg-white py-24 md:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-16 max-w-3xl md:mb-20"
        >
          <motion.p
            variants={item}
            className="text-[13px] font-medium tracking-wide text-ink-muted"
          >
            BY THE NUMBERS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 text-[32px] font-bold tracking-[-0.03em] text-ink-strong md:text-[48px]"
          >
            숫자로 보는 케이비개발
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
          }}
          className="grid grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line"
        >
          {counters.map((c) => (
            <motion.div
              key={c.key}
              variants={item}
              className="lg:px-12 first:lg:pl-0 last:lg:pr-0"
            >
              <div className="flex items-baseline gap-1">
                {shouldReduce ? (
                  <span className="text-[52px] font-bold tracking-[-0.04em] text-ink-strong md:text-[64px]">
                    {c.value.toLocaleString()}
                  </span>
                ) : (
                  <CountUp
                    end={c.value}
                    duration={2.5}
                    separator=","
                    enableScrollSpy
                    scrollSpyOnce
                    className="text-[52px] font-bold tracking-[-0.04em] text-ink-strong md:text-[64px]"
                  />
                )}
                {c.suffix && (
                  <span className="text-3xl font-bold text-ink-strong md:text-4xl">
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="mt-5 text-base font-medium text-ink-strong">
                {c.label}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {c.caption}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
