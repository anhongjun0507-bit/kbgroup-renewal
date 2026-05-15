"use client";

import CountUp from "react-countup";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { counters } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-white py-20 md:py-24 lg:py-28">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: shouldReduce ? 0 : 0.08,
              },
            },
          }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center rounded-full bg-secondary-soft px-3.5 py-1.5 text-xs font-semibold text-secondary"
          >
            BY THE NUMBERS
          </motion.div>
          <motion.h2
            variants={item}
            className="mt-4 text-3xl font-bold tracking-tight text-ink-strong md:text-[40px]"
          >
            숫자로 보는 케이비개발
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-4 text-base text-ink md:text-lg"
          >
            2014년 설립 이래 쌓아온 신뢰의 기록입니다.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduce ? 0 : 0.1 },
            },
          }}
          className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"
        >
          {counters.map((c) => (
            <motion.div
              key={c.key}
              variants={item}
              className="group rounded-2xl bg-bg-soft p-6 transition-colors duration-300 hover:bg-primary-soft md:p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
                {c.caption}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                {shouldReduce ? (
                  <span className="text-[40px] font-bold tracking-tight text-ink-strong md:text-5xl">
                    {c.value.toLocaleString()}
                  </span>
                ) : (
                  <CountUp
                    end={c.value}
                    duration={2}
                    separator=","
                    enableScrollSpy
                    scrollSpyOnce
                    className="text-[40px] font-bold tracking-tight text-ink-strong md:text-5xl"
                  />
                )}
                {c.suffix && (
                  <span className="text-2xl font-bold text-ink-strong md:text-3xl">
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-strong md:text-base">
                {c.label}
              </p>
              {c.isPlaceholder && (
                <p className="mt-1 text-[10px] font-medium text-ink-faint">
                  * 추후 실측치 반영 예정
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
