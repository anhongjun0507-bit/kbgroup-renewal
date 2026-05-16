"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";

/* Phase 5.I.4 — 사내 복지 4×2 라인 아이콘 그리드 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type WelfareItem = {
  number: string;
  english: string;
  korean: string;
  description: string;
  icon: React.ReactNode;
};

const WELFARE_ITEMS: WelfareItem[] = [
  {
    number: "01",
    english: "SOCIAL INSURANCE",
    korean: "4대 보험",
    description: "법정 4대 보험 완비",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <path d="M20 6L32 11V21C32 28 26 33 20 35C14 33 8 28 8 21V11L20 6Z" />
        <path d="M14 20L18 24L26 16" />
      </svg>
    ),
  },
  {
    number: "02",
    english: "PAID LEAVE",
    korean: "연차·휴가",
    description: "근로기준법에 따른 연차 휴가",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <rect x="6" y="8" width="28" height="26" rx="2" />
        <path d="M6 14H34" />
        <path d="M13 6V12M27 6V12" />
        <circle cx="14" cy="22" r="2" fill="currentColor" />
        <circle cx="20" cy="22" r="2" />
        <circle cx="26" cy="22" r="2" />
      </svg>
    ),
  },
  {
    number: "03",
    english: "HOLIDAY BONUS",
    korean: "명절 상여",
    description: "설·추석 명절 상여 지급",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <rect x="6" y="14" width="28" height="20" />
        <path d="M14 14V10C14 8 16 6 20 6S26 8 26 10V14" />
        <path d="M16 22L20 26L28 18" />
      </svg>
    ),
  },
  {
    number: "04",
    english: "TRAINING",
    korean: "교육 지원",
    description: "직무 관련 자격증 취득 지원",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <path d="M4 14L20 8L36 14L20 20L4 14Z" />
        <path d="M10 17V25C10 25 14 28 20 28S30 25 30 25V17" />
        <path d="M36 14V22" />
      </svg>
    ),
  },
  {
    number: "05",
    english: "HEALTH CHECKUP",
    korean: "건강검진",
    description: "정기 건강검진 제공",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <path d="M20 33C20 33 8 25 8 16C8 11 12 8 16 8C18 8 19 9 20 11C21 9 22 8 24 8C28 8 32 11 32 16C32 25 20 33 20 33Z" />
        <path d="M14 20H17L19 16L21 24L23 20H26" />
      </svg>
    ),
  },
  {
    number: "06",
    english: "FAMILY EVENTS",
    korean: "경조사 지원",
    description: "임직원 경조사 지원금",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <circle cx="20" cy="14" r="6" />
        <path d="M8 34c0-6 5-10 12-10s12 4 12 10" />
        <path d="M28 8L31 11L37 5" />
      </svg>
    ),
  },
  {
    number: "07",
    english: "MEAL SUPPORT",
    korean: "식대 지원",
    description: "근무지별 식대 또는 식사 제공",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <path d="M8 14H22C26 14 30 17 30 22V22C30 27 26 30 22 30H8V14Z" />
        <path d="M30 17H32C34 17 36 19 36 22S34 27 32 27H30" />
        <path d="M12 18V26" />
      </svg>
    ),
  },
  {
    number: "08",
    english: "LONG-TERM SERVICE",
    korean: "장기 근속 포상",
    description: "근속 연수별 포상 제도",
    icon: (
      <svg viewBox="0 0 40 40" {...STROKE}>
        <circle cx="20" cy="16" r="8" />
        <path d="M14 22L11 34L20 30L29 34L26 22" />
        <path d="M17 16L19 18L23 14" />
      </svg>
    ),
  },
];

const HEDGE_NOTE =
  "* 상세 복리후생 항목과 조건은 회사 정책 및 직무에 따라 안내됩니다.";

export function CareersWelfare() {
  const shouldReduce = useReducedMotion() ?? false;

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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="careers-welfare-heading"
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
            kicker="BENEFITS"
            title="함께 만드는 근무 환경"
            italicWord="근무 환경"
            subtitle="성실하게 일하는 동료를 위한 케이비개발의 약속입니다."
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        {/* 4×2 그리드 */}
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={listVariants}
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {WELFARE_ITEMS.map((item) => (
            <motion.li
              key={item.number}
              variants={itemVariants}
              className="group rounded-md border border-line bg-white p-6 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
            >
              <div className="h-9 w-9 text-navy-800 transition-colors duration-300 group-hover:text-accent-500">
                {item.icon}
              </div>
              <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {item.english}
              </p>
              <h3 className="mt-2 font-display text-[17px] font-bold tracking-tight text-ink-strong md:text-[18px]">
                {item.korean}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <p className="mt-10 text-[12px] italic text-ink-faint">{HEDGE_NOTE}</p>
      </Container>

      <span id="careers-welfare-heading" className="sr-only">함께 만드는 근무 환경</span>
    </section>
  );
}
