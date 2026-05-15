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
            className="font-display text-[18px] italic leading-none text-accent md:text-[20px]"
          >
            By the Numbers
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 text-[32px] font-bold tracking-[-0.022em] text-ink-strong md:text-[44px]"
          >
            숫자로 보는 케이비개발
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base leading-relaxed text-ink"
          >
            2014년 설립 이래 축적해온 운영 성과입니다.
          </motion.p>
        </motion.div>

        <motion.div
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
              {/* 빨강 가는 라인 — NAI 통계 박스 패턴 */}
              <div
                aria-hidden="true"
                className="-ml-5 mb-5 h-[2px] w-10 bg-accent"
              />
              <p className="font-display text-[11px] italic tracking-widest text-accent">
                {c.caption}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                {shouldReduce ? (
                  <span className="text-[56px] font-bold leading-none tracking-[-0.03em] text-accent md:text-[64px]">
                    {c.value.toLocaleString()}
                  </span>
                ) : (
                  <CountUp
                    end={c.value}
                    duration={1.8}
                    separator=","
                    easingFn={(t, b, c, d) => {
                      const tn = t / d - 1;
                      return c * (tn * tn * tn + 1) + b;
                    }}
                    enableScrollSpy
                    scrollSpyOnce
                    className="text-[56px] font-bold leading-none tracking-[-0.03em] text-accent md:text-[64px]"
                  />
                )}
                {c.suffix && (
                  <span className="text-3xl font-bold text-accent/60 md:text-4xl">
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
