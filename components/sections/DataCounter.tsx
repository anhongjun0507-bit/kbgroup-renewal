"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { counters } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  /** 단일 IntersectionObserver — 4셀이 동시에 카운트업 시작 (H-3 깜빡임 픽스) */
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-white py-24 md:py-32" ref={sectionRef}>
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
          <motion.p variants={item} className="eyebrow">
            BY THE NUMBERS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.18,
              color: "var(--color-ink-strong)",
            }}
          >
            숫자로 보는 <span className="text-primary">케이비개발</span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base leading-[1.85] text-ink-muted"
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
              <div
                aria-hidden="true"
                className="-ml-5 mb-5 h-[2px] w-10 bg-primary"
              />
              <div className="flex items-baseline gap-1">
                {shouldReduce ? (
                  <span
                    className="font-mono-num font-bold leading-none text-primary"
                    style={{
                      fontSize: "clamp(2.75rem, 5vw, 4rem)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {c.value.toLocaleString()}
                  </span>
                ) : inView ? (
                  <CountUp
                    end={c.value}
                    duration={2}
                    separator=","
                    easingFn={(t, b, c, d) => {
                      const tn = t / d - 1;
                      return c * (tn * tn * tn + 1) + b;
                    }}
                    className="font-mono-num font-bold leading-none text-primary"
                    style={{
                      fontSize: "clamp(2.75rem, 5vw, 4rem)",
                      letterSpacing: "-0.03em",
                    }}
                  />
                ) : (
                  <span
                    className="font-mono-num font-bold leading-none text-primary"
                    style={{
                      fontSize: "clamp(2.75rem, 5vw, 4rem)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    0
                  </span>
                )}
                {c.suffix && (
                  <span
                    className="font-mono-num font-bold text-ink-faint"
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
