"use client";

import { useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import CountUp from "react-countup";
import { Container } from "@/components/ui";
import { complexes } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Stat = {
  key: string;
  value: number;
  suffix: string;
  label: string;
  caption: string;
};

export function CasesStats() {
  const shouldReduce = useReducedMotion() ?? false;
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.3 });

  const stats = useMemo<Stat[]>(() => {
    const totalSites = complexes.length;
    const distinctRegions = new Set(
      complexes.map((c) => c.region.split(" ")[0]),
    ).size;
    const lhCount = complexes.filter((c) =>
      c.name.startsWith("LH"),
    ).length;
    return [
      {
        key: "sites",
        value: totalSites,
        suffix: "+",
        label: "운영 단지",
        caption: "SITES OPERATED",
      },
      {
        key: "regions",
        value: distinctRegions,
        suffix: "+",
        label: "운영 시도",
        caption: "REGIONS COVERED",
      },
      {
        key: "lh",
        value: lhCount,
        suffix: "+",
        label: "LH 발주",
        caption: "LH PROJECTS",
      },
    ];
  }, []);

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="cases-stats-heading"
      className="bg-ink py-24 text-white md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mb-16 text-center"
        >
          <div aria-hidden="true" className="mx-auto mb-6 h-px w-12 bg-gold" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold">
            NATIONWIDE PORTFOLIO
          </p>
          <h2
            id="cases-stats-heading"
            className="mt-6 font-serif text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-white md:text-4xl lg:text-5xl"
          >
            전국 <span className="italic text-gold">{complexes.length}개</span>{" "}
            단지에서
            <br />
            신뢰를 쌓고 있습니다
          </h2>
        </motion.div>

        <div
          ref={gridRef}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/10"
        >
          {stats.map((stat, index) => (
            <StatColumn
              key={stat.key}
              stat={stat}
              index={index}
              inView={inView}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function StatColumn({
  stat,
  index,
  inView,
  shouldReduce,
}: {
  stat: Stat;
  index: number;
  inView: boolean;
  shouldReduce: boolean;
}) {
  const { value, suffix, label, caption } = stat;
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.15,
        ease: EASE_OUT_EXPO,
      }}
      className="px-6 text-center"
    >
      <div className="flex items-start justify-center font-serif font-bold leading-none tracking-[-0.03em] text-white">
        <span className="text-5xl md:text-6xl lg:text-[80px]">
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
            className="-translate-y-2 ml-1 inline-block text-3xl text-gold md:text-4xl"
          >
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-6 text-base font-medium text-white">{label}</div>
      <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
        {caption}
      </div>
    </motion.div>
  );
}
