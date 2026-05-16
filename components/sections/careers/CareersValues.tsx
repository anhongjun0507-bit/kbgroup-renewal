"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";

/* Phase 5.I.2 — 인재상 hover 시 좌측 액센트 바 + 아이콘 컬러 채움 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type TalentValue = {
  number: string;
  englishName: string;
  koreanName: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
};

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TALENT_VALUES: TalentValue[] = [
  {
    number: "01",
    englishName: "Responsibility",
    koreanName: "책임감",
    tagline: "맡은 일을 끝까지 책임지는 사람",
    description: "시설관리는 일상이 흐르는 공간을 책임지는 일입니다.",
    icon: (
      <svg viewBox="0 0 48 48" {...STROKE}>
        <path d="M24 8L40 14V26C40 34 33 40 24 42C15 40 8 34 8 26V14L24 8Z" />
        <path d="M16 24L22 30L33 19" />
      </svg>
    ),
  },
  {
    number: "02",
    englishName: "Expertise",
    koreanName: "전문성",
    tagline: "끊임없이 배우고 성장하는 사람",
    description: "검증된 자격과 경험으로 신뢰를 만들어갑니다.",
    icon: (
      <svg viewBox="0 0 48 48" {...STROKE}>
        <path d="M24 6L30 20L44 20L33 28L37 42L24 34L11 42L15 28L4 20L18 20Z" />
        <circle cx="24" cy="24" r="3" />
      </svg>
    ),
  },
  {
    number: "03",
    englishName: "Collaboration",
    koreanName: "협업",
    tagline: "동료와 함께 더 나은 결과를 만드는 사람",
    description: "공간의 관리는 한 사람의 일이 아닌 팀의 일입니다.",
    icon: (
      <svg viewBox="0 0 48 48" {...STROKE}>
        <circle cx="16" cy="16" r="5" />
        <circle cx="32" cy="16" r="5" />
        <path d="M6 38c0-6 4.5-10 10-10s10 4 10 10" />
        <path d="M22 38c0-6 4.5-10 10-10s10 4 10 10" />
      </svg>
    ),
  },
];

export function CareersValues() {
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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.12 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="careers-values-heading"
      className="section bg-gray-50"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="OUR PEOPLE"
            title="찾는 인재상"
            italicWord="인재상"
            subtitle="케이비개발이 함께하고 싶은 사람의 모습입니다."
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {TALENT_VALUES.map((value) => (
            <motion.div
              key={value.number}
              variants={itemVariants}
              className="group relative flex h-full flex-col rounded-md border border-line bg-white p-8 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)] md:p-10"
            >
              {/* 좌측 액센트 세로 바 — hover 시 24→64 expand */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-8 h-6 w-[3px] bg-accent-500 transition-[height] duration-300 [transition-timing-function:var(--ease)] group-hover:h-16 md:top-10"
              />

              <p className="ml-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {value.number} · {value.englishName}
              </p>

              {/* 아이콘 — hover 시 ink → accent 컬러 채움 */}
              <div className="mt-6 h-12 w-12 text-navy-800 transition-colors duration-300 group-hover:text-accent-500">
                {value.icon}
              </div>

              <h3 className="mt-6 font-display text-[26px] font-bold tracking-tight text-ink-strong md:text-[28px]">
                {value.koreanName}
              </h3>
              <p className="mt-4 text-[15px] font-semibold text-ink-strong">
                {value.tagline}
              </p>
              <p className="mt-3 text-[14px] leading-[1.75] text-ink-muted">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      <span id="careers-values-heading" className="sr-only">찾는 인재상</span>
    </section>
  );
}
