"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { company, contact } from "@/data/site-content";

/* Phase 8 — 본사 외관 풀블리드 (PDF p4·p7·p22) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const FACTS = [
  { label: "본사 소재지", value: contact.address.split(",")[0] },
  { label: "운영 시작", value: `${company.foundedYear}년` },
  { label: "자본금", value: company.capital },
];

export function CompanyOffice() {
  const shouldReduce = useReducedMotion() ?? false;

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      data-surface="dark"
      aria-labelledby="company-office-heading"
      className="relative isolate overflow-hidden bg-navy-900"
    >
      {/* 풀블리드 사옥 사진 */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/company/p04_05.jpeg"
          alt="(주)케이비개발 본사 외관"
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,26,51,0.85) 0%, rgba(11,26,51,0.55) 50%, rgba(11,26,51,0.85) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 20% 30%, rgba(201,162,75,0.18) 0%, transparent 60%)",
          }}
        />
      </div>

      <Container className="relative">
        <div className="py-24 md:py-32 lg:py-40">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
            className="max-w-3xl"
          >
            <p
              className="eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              HEADQUARTERS
            </p>
            <h2
              id="company-office-heading"
              className="mt-5 font-display font-extrabold leading-[1.15] tracking-tight"
              style={{
                color: "#ffffff",
                fontSize: "clamp(2rem, 4.2vw, 3.25rem)",
              }}
            >
              한 도시의 일상을, <br className="hidden md:inline" />
              한 회사가 책임집니다
            </h2>
            <p
              className="mt-6 max-w-xl text-[16px] md:text-[17px]"
              style={{
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.75,
              }}
            >
              {company.intro}
            </p>
          </motion.div>

          <motion.dl
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
            className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-white/12 bg-white/5 backdrop-blur-md sm:grid-cols-3"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            {FACTS.map((f) => (
              <div key={f.label} className="p-6 sm:p-8">
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                  {f.label}
                </dt>
                <dd className="mt-3 font-display text-[20px] font-bold tracking-tight text-white md:text-[24px]">
                  {f.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </Container>
    </section>
  );
}
