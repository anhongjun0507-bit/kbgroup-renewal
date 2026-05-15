"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// PLACEHOLDER — KB GROUP의 실제 복리후생 정책 미확인.
// 4대보험·연차·건강검진은 법적 의무 (안전). 나머지는 한국 일반 B2B 표준 표현.
// 하단 hedge note로 구체적 사항은 회사 정책 의존임을 명시.
type WelfareItem = {
  number: string;
  english: string;
  korean: string;
  description: string;
};

const WELFARE_ITEMS: WelfareItem[] = [
  {
    number: "01",
    english: "SOCIAL INSURANCE",
    korean: "4대 보험",
    description: "법정 4대 보험 완비",
  },
  {
    number: "02",
    english: "PAID LEAVE",
    korean: "연차·휴가",
    description: "근로기준법에 따른 연차 휴가",
  },
  {
    number: "03",
    english: "HOLIDAY BONUS",
    korean: "명절 상여",
    description: "설·추석 명절 상여 지급",
  },
  {
    number: "04",
    english: "TRAINING",
    korean: "교육 지원",
    description: "직무 관련 자격증 취득 지원",
  },
  {
    number: "05",
    english: "HEALTH CHECKUP",
    korean: "건강검진",
    description: "정기 건강검진 제공",
  },
  {
    number: "06",
    english: "FAMILY EVENTS",
    korean: "경조사 지원",
    description: "임직원 경조사 지원금",
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
      aria-labelledby="careers-welfare-heading"
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
            kicker="BENEFITS"
            title="함께 만드는 근무 환경"
            italicWord="근무 환경"
            subtitle="성실하게 일하는 동료를 위한 케이비개발의 약속입니다."
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {WELFARE_ITEMS.map((item) => (
            <motion.li
              key={item.number}
              variants={itemVariants}
              className="group border-t border-line pt-6 transition-colors duration-500 ease-out hover:border-primary"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">
                {item.english}
              </p>
              <h3 className="mt-3 font-serif text-xl font-bold leading-tight tracking-[-0.01em] text-ink md:text-2xl">
                {item.korean}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft md:text-base">
                {item.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <p className="mt-16 text-xs italic text-ink-muted">{HEDGE_NOTE}</p>
      </Container>

      <span id="careers-welfare-heading" className="sr-only">
        함께 만드는 근무 환경
      </span>
    </section>
  );
}
