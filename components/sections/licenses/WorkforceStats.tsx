"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import CountUp from "react-countup";
import { Container } from "@/components/ui";
import {
  certifications,
  licenses,
  totalCertHolders,
  yearsOfOperation,
} from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Stat = {
  key: string;
  value: number;
  suffix: string;
  label: string;
  caption: string;
};

export function WorkforceStats() {
  const shouldReduce = useReducedMotion() ?? false;
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.3 });

  const stats: Stat[] = [
    {
      key: "workforce",
      value: totalCertHolders,
      suffix: "+",
      label: "자격증 보유 인력",
      caption: "CERTIFIED PROFESSIONALS",
    },
    {
      key: "licenses",
      value: licenses.length,
      suffix: "+",
      label: "보유 인허가",
      caption: "REGISTERED LICENSES",
    },
    {
      key: "certifications",
      value: certifications.length,
      suffix: "+",
      label: "기술 자격증",
      caption: "CERTIFICATION TYPES",
    },
    {
      key: "years",
      value: yearsOfOperation,
      suffix: "+",
      label: "년의 운영 경험",
      caption: "OPERATION HISTORY",
    },
  ];

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
      aria-labelledby="workforce-stats-heading"
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
            WORKFORCE &amp; EXPERTISE
          </p>
          <h2
            id="workforce-stats-heading"
            className="mt-6 font-serif text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-white md:text-4xl lg:text-5xl"
          >
            {totalCertHolders.toLocaleString("en-US")}명의{" "}
            <span className="italic text-gold">전문 인력</span>이
            <br />
            함께합니다
          </h2>
        </motion.div>

        <div
          ref={gridRef}
          className="mx-auto grid max-w-6xl grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10"
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
