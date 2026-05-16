"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { BusinessArea } from "@/data/site-content";

/* Phase 4.F.3 — 하위 서비스 그리드 + 작업 갤러리 4장 placeholder
   실사진 자료 없어서 듀오톤 placeholder + 라벨 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const GALLERY_LABELS = [
  "현장 점검",
  "정기 관리",
  "전문 장비 운용",
  "안전 교육",
  "고객 응대",
  "결과 보고",
];

interface Props {
  area: BusinessArea;
}

export function BusinessSubServices({ area }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const { subBusinesses } = area;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby={`sub-${area.id}`}
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="SERVICES IN DETAIL"
            title="구체적인 서비스"
            italicWord="서비스"
            subtitle={area.summary}
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        {/* 작업 갤러리 — 4장 placeholder */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="mb-16 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6"
        >
          {GALLERY_LABELS.map((label, idx) => (
            <motion.figure
              key={label}
              variants={itemVariants}
              className="group relative aspect-[4/5] overflow-hidden rounded-md bg-navy-900"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]"
                style={{
                  background: [
                    "linear-gradient(135deg, #0E1F3A 0%, #16315C 50%, #0B1A33 100%)",
                    "radial-gradient(60% 60% at 30% 30%, rgba(201,162,75,0.18) 0%, transparent 70%)",
                  ].join(", "),
                  
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                  GALLERY {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 font-display text-[18px] font-bold text-white">
                  {label}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent-500 transition-transform duration-500 group-hover:scale-y-100"
              />
            </motion.figure>
          ))}
        </motion.div>

        {/* 하위 사업 리스트 */}
        {subBusinesses.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {subBusinesses.map((name, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.li
                  key={name}
                  variants={itemVariants}
                  className="group flex items-start gap-4 rounded-md border border-line bg-white p-5 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 font-mono-num text-[22px] font-bold text-accent-500"
                  >
                    {num}
                  </span>
                  <h3 className="font-display text-[16px] font-bold leading-tight tracking-tight text-ink-strong md:text-[17px]">
                    {name}
                  </h3>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </Container>

      <span id={`sub-${area.id}`} className="sr-only">
        구체적인 서비스
      </span>
    </section>
  );
}
