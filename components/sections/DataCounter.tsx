"use client";

import CountUp from "react-countup";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { counters } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  return (
    <section className="border-y border-line bg-white py-20 md:py-24">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
          }}
          className="mb-14 max-w-2xl md:mb-16"
        >
          <motion.p
            variants={item}
            className="text-[13px] font-semibold tracking-wide text-ink-muted"
          >
            BY THE NUMBERS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-3 text-[32px] font-bold tracking-tight text-ink-strong md:text-[44px]"
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
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line"
        >
          {counters.map((c) => (
            <motion.div
              key={c.key}
              variants={item}
              className="lg:px-10 first:lg:pl-0 last:lg:pr-0"
            >
              <div className="flex items-baseline gap-1">
                {shouldReduce ? (
                  <span className="text-[44px] font-bold tracking-tight text-ink-strong md:text-[56px]">
                    {c.value.toLocaleString()}
                  </span>
                ) : (
                  <CountUp
                    end={c.value}
                    duration={2}
                    separator=","
                    enableScrollSpy
                    scrollSpyOnce
                    className="text-[44px] font-bold tracking-tight text-ink-strong md:text-[56px]"
                  />
                )}
                {c.suffix && (
                  <span className="text-2xl font-bold text-ink-strong md:text-3xl">
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm font-semibold text-ink md:text-base">
                {c.label}
              </p>
              {c.isPlaceholder && (
                <p className="mt-1 text-[11px] text-ink-faint">* 추후 갱신</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
