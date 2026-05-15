"use client";

import CountUp from "react-countup";
import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/ui";
import { counters } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.6 });

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-white py-24 md:py-32">
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
            className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-muted"
          >
            BY THE NUMBERS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 font-extrabold tracking-[-0.025em] text-ink-strong"
            style={{ fontSize: "clamp(2rem, 3.6vw, 2.75rem)" }}
          >
            숫자로 보는 케이비개발
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted"
          >
            2014년 설립 이래 축적해온 운영 성과입니다.
          </motion.p>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
          }}
          className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4 md:gap-x-10"
        >
          {counters.map((c) => (
            <motion.div key={c.key} variants={item} className="pl-5">
              <div
                aria-hidden="true"
                className="-ml-5 mb-5 h-[2px] w-10 bg-primary"
              />
              <div className="tabular flex items-baseline gap-1">
                {shouldReduce || !inView ? (
                  <span
                    className="font-extrabold leading-none tracking-[-0.03em] text-primary"
                    style={{ fontSize: "clamp(2.75rem, 5vw, 4rem)" }}
                  >
                    {shouldReduce ? c.value.toLocaleString() : "0"}
                  </span>
                ) : (
                  <CountUp
                    end={c.value}
                    duration={2}
                    separator=","
                    easingFn={(t, b, c, d) => {
                      const tn = t / d - 1;
                      return c * (tn * tn * tn + 1) + b;
                    }}
                    className="font-extrabold leading-none tracking-[-0.03em] text-primary"
                    style={{ fontSize: "clamp(2.75rem, 5vw, 4rem)" }}
                  />
                )}
                {c.suffix && (
                  <span
                    className="font-bold text-ink-faint"
                    style={{ fontSize: "clamp(1.5rem, 2vw, 1.75rem)" }}
                  >
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="mt-5 text-[15px] font-semibold text-ink-strong">
                {c.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
