"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// PLACEHOLDER — 실제 인재상 데이터 미보유. 안전한 일반화 카피.
// 추후 클라이언트 자료 받으면 data/site-content.ts로 이동 + 컴포넌트는 import로 교체.
type TalentValue = {
  number: string;
  englishName: string;
  koreanName: string;
  tagline: string;
  description: string;
};

const TALENT_VALUES: TalentValue[] = [
  {
    number: "01",
    englishName: "Responsibility",
    koreanName: "책임감",
    tagline: "맡은 일을 끝까지 책임지는 사람",
    description: "시설관리는 일상이 흐르는 공간을 책임지는 일입니다.",
  },
  {
    number: "02",
    englishName: "Expertise",
    koreanName: "전문성",
    tagline: "끊임없이 배우고 성장하는 사람",
    description: "검증된 자격과 경험으로 신뢰를 만들어갑니다.",
  },
  {
    number: "03",
    englishName: "Collaboration",
    koreanName: "협업",
    tagline: "동료와 함께 더 나은 결과를 만드는 사람",
    description: "공간의 관리는 한 사람의 일이 아닌 팀의 일입니다.",
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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="careers-values-heading"
      className="bg-beige py-32 md:py-40"
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
            className="mb-20"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-16 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line/30"
        >
          {TALENT_VALUES.map((value) => (
            <motion.div
              key={value.number}
              variants={itemVariants}
              className="px-6 lg:px-12"
            >
              <p className="font-serif text-2xl italic text-primary">
                <span aria-hidden="true">{value.number}</span>{" "}
                {value.englishName}
              </p>
              <h3 className="mt-6 font-serif text-3xl font-bold tracking-[-0.01em] text-ink md:text-4xl">
                {value.koreanName}
              </h3>
              <p className="mt-6 font-serif text-base leading-[1.6] text-ink md:text-lg">
                {value.tagline}
              </p>
              <p className="mt-3 text-sm leading-[1.85] text-ink-soft">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      <span id="careers-values-heading" className="sr-only">
        찾는 인재상
      </span>
    </section>
  );
}
