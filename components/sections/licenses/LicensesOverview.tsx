"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { certifications, licenses } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SECTION_TITLE = "분야별 전문성";
const SECTION_ITALIC = "전문성";
const SECTION_SUBTITLE =
  "법적 자격과 기술 인증, 두 축으로 케이비개발의 전문성을 증명합니다.";

type Card = {
  key: string;
  count: number;
  englishName: string;
  koreanName: string;
  description: string;
};

export function LicensesOverview() {
  const shouldReduce = useReducedMotion() ?? false;

  const cards: Card[] = [
    {
      key: "licenses",
      count: licenses.length,
      englishName: "LICENSES",
      koreanName: "인허가",
      description: "법적으로 등록된 사업 자격",
    },
    {
      key: "certifications",
      count: certifications.length,
      englishName: "CERTIFICATIONS",
      koreanName: "기술 인증",
      description: "전문 기술과 역량을 증명하는 자격",
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
      aria-labelledby="licenses-overview-heading"
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
            kicker="BY CATEGORY"
            title={SECTION_TITLE}
            italicWord={SECTION_ITALIC}
            subtitle={SECTION_SUBTITLE}
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
          className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"
        >
          {cards.map((card) => (
            <motion.div
              key={card.key}
              variants={itemVariants}
              className="border-t border-line pt-10"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-7xl font-medium italic leading-none tracking-[-0.03em] text-primary md:text-8xl">
                  {card.count}
                </span>
                <span
                  aria-hidden="true"
                  className="font-serif text-3xl italic text-primary md:text-4xl"
                >
                  +
                </span>
              </div>
              <h3 className="mt-8 font-serif text-2xl font-bold tracking-[-0.01em] text-ink md:text-3xl">
                {card.koreanName}
              </h3>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
                {card.englishName}
              </p>
              <p className="mt-6 max-w-md text-base leading-[1.85] text-ink-soft">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      <span id="licenses-overview-heading" className="sr-only">
        분야별 전문성
      </span>
    </section>
  );
}
