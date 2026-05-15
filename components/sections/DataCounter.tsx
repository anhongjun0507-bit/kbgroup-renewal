"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import CountUp from "react-countup";
import { Container, Heading } from "@/components/ui";
import { counters, type Counter } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SECTION_TITLE = "축적된 신뢰의 기록";
const SECTION_ITALIC = "기록";
const SECTION_SUBTITLE = "2014년 설립 이래 케이비개발이 축적해온 성과입니다.";
const FOOTNOTE = "* 표시 수치는 2026년 5월 기준입니다.";

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.3 });

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0 : 0.8,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <section
      aria-labelledby="counter-heading"
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
            kicker="BY THE NUMBERS"
            title={SECTION_TITLE}
            italicWord={SECTION_ITALIC}
            subtitle={SECTION_SUBTITLE}
            align="center"
            size="md"
            as="h2"
            className="mb-24"
          />
        </motion.div>

        <div
          ref={gridRef}
          className="mx-auto grid max-w-6xl grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line/30"
        >
          {counters.map((counter, index) => (
            <CounterColumn
              key={counter.key}
              counter={counter}
              index={index}
              inView={inView}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className="mx-auto mb-8 h-px w-12 bg-gold" aria-hidden="true" />
          <p className="text-xs text-ink-muted">{FOOTNOTE}</p>
        </div>
      </Container>

      {/* aria-labelledby 타겟용 — Heading 컴포넌트가 자체적으로 id를 잡지 않으므로 */}
      <span id="counter-heading" className="sr-only">
        {SECTION_TITLE}
      </span>
    </section>
  );
}

function CounterColumn({
  counter,
  index,
  inView,
  shouldReduce,
}: {
  counter: Counter;
  index: number;
  inView: boolean;
  shouldReduce: boolean;
}) {
  const { value, suffix, label, caption } = counter;
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.15,
        ease: EASE_OUT_EXPO,
      }}
      whileHover={
        shouldReduce
          ? undefined
          : { y: -4, transition: { duration: 0.5, ease: "easeOut" } }
      }
      className="px-8 text-center"
    >
      <div className="flex items-start justify-center font-serif font-bold leading-none tracking-[-0.03em] text-ink">
        <span className="text-6xl md:text-7xl lg:text-[88px]">
          {shouldReduce ? (
            value.toLocaleString("en-US")
          ) : inView ? (
            <CountUp
              end={value}
              duration={2.5}
              delay={index * 0.15}
              separator=","
            />
          ) : (
            "0"
          )}
        </span>
        {suffix && (
          <span
            aria-hidden="true"
            className="-translate-y-2 ml-1 inline-block text-4xl text-primary"
          >
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-6 text-base font-medium leading-relaxed text-ink">
        {label}
      </div>
      <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-muted">
        {caption}
      </div>
    </motion.div>
  );
}
