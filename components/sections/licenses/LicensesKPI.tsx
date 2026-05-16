"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { certifications, licenses } from "@/data/site-content";

/* Phase 6 F-1 — 3 KPI 대시보드 (navy-700 left-border 4px) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function latestAcquired(): string {
  const dates = licenses
    .map((l) => l.acquiredAt ?? "")
    .filter(Boolean)
    .sort();
  if (dates.length === 0) return "-";
  const last = dates[dates.length - 1];
  const year = last.split(/[.\-/]/)[0];
  return `${year}년`;
}

function uniqueIssuerCount(): number {
  return new Set(licenses.map((l) => l.issuer)).size;
}

export function LicensesKPI() {
  const shouldReduce = useReducedMotion() ?? false;

  const kpis = [
    {
      key: "licenses",
      label: "보유 면허",
      value: licenses.length,
      unit: "건",
      caption: "REGISTERED LICENSES",
    },
    {
      key: "categories",
      label: "발급 기관 수",
      value: uniqueIssuerCount(),
      unit: "개 기관",
      caption: "ISSUING AUTHORITIES",
    },
    {
      key: "cert",
      label: "기술 인증",
      value: certifications.length,
      unit: "종",
      caption: "CERTIFICATION TYPES",
    },
  ];

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
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
      aria-labelledby="licenses-kpi-heading"
      className="bg-white pb-0 pt-14 md:pt-20"
    >
      <Container>
        <p className="eyebrow">LICENSE DASHBOARD</p>
        <h2
          id="licenses-kpi-heading"
          className="mt-3 font-display text-[28px] font-bold tracking-tight text-ink-strong md:text-[32px]"
        >
          한눈에 보는 보유 자격
        </h2>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {kpis.map((kpi) => (
            <motion.li
              key={kpi.key}
              variants={itemVariants}
              className="relative rounded-md border border-line bg-white p-8 pl-9 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              {/* navy-700 left-border 4px */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-1 bg-navy-700"
              />
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {kpi.caption}
              </p>
              <p className="stat-cell mt-5 flex items-baseline gap-2">
                <span className="stat-number font-mono-num font-display text-[48px] font-extrabold leading-none text-navy-800 md:text-[56px]">
                  {typeof kpi.value === "number"
                    ? kpi.value.toLocaleString()
                    : kpi.value}
                </span>
                <span className="text-[16px] font-semibold text-accent-500">
                  {kpi.unit}
                </span>
              </p>
              <p className="mt-5 text-[15px] font-semibold text-ink-strong">
                {kpi.label}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <p className="mt-6 text-[12px] text-ink-faint">
          ※ 최신 갱신: {latestAcquired()} 기준
        </p>
      </Container>
    </section>
  );
}
