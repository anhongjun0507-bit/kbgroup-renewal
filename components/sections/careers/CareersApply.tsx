"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import type { SettingValue } from "@/lib/content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// PLACEHOLDER — 일반화된 3단계 표현. KB GROUP 실제 채용 프로세스 미확인.
type ApplyStep = {
  number: string;
  title: string;
  description: string;
};

const STEPS: ApplyStep[] = [
  {
    number: "01",
    title: "채용 공고 확인",
    description:
      "이 페이지의 공고 안내 또는 이메일 문의로 채용 정보를 확인합니다.",
  },
  {
    number: "02",
    title: "이메일로 이력서 송부",
    description: "지원하실 직무명과 함께 이력서를 채용 이메일로 보내주세요.",
  },
  {
    number: "03",
    title: "서류 검토 후 개별 연락",
    description: "검토 후 면접 일정은 개별 연락드립니다.",
  },
];

/** 연락처 (어댑터 주입). 채용 이메일·대표 전화를 사용한다. */
interface Props {
  contact: SettingValue<"contact">;
}

export function CareersApply({ contact }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const careersEmail = contact.careersEmail ?? contact.email;

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.15 } },
  };

  const blockVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="careers-apply-heading"
      className="bg-cream py-24 md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20"
        >
          {/* Left — How to apply */}
          <motion.div variants={blockVariants}>
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              HOW TO APPLY
            </p>
            <h2
              id="careers-apply-heading"
              className="mt-6 font-serif text-2xl font-bold leading-[1.3] tracking-[-0.02em] text-ink md:text-3xl lg:text-4xl"
            >
              <span className="serif-em">지원</span> 방법
            </h2>

            {/* Phase 14-N (2026-05-21) — 모바일 세로 stack / 데스크탑(lg) 가로 3컬럼 */}
            <ol className="mt-12 grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
              {STEPS.map((step, idx) => (
                <li
                  key={step.number}
                  className={
                    /* 모바일: 항목 사이 border-t, 마지막에 border-b */
                    /* 데스크탑(lg): 각 컬럼이 카드형이 되도록 상단 line + 아이템 padding 통일 */
                    "border-t border-line py-8 lg:border-b-0 " +
                    (idx === STEPS.length - 1 ? "border-b lg:border-b-0" : "")
                  }
                >
                  <span
                    aria-hidden="true"
                    className="block font-serif text-2xl italic leading-none text-primary md:text-3xl"
                  >
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold leading-tight tracking-[-0.01em] text-ink md:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft md:text-base">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Right — Contact */}
          <motion.div variants={blockVariants}>
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              CONTACT
            </p>
            <h2 className="mt-6 font-serif text-2xl font-bold leading-[1.3] tracking-[-0.02em] text-ink md:text-3xl lg:text-4xl">
              <span className="serif-em">문의</span> 안내
            </h2>

            <ul className="mt-12">
              <li className="grid grid-cols-12 items-baseline gap-4 border-t border-line py-5">
                <span className="col-span-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted sm:col-span-2">
                  EMAIL
                </span>
                <a
                  href={`mailto:${careersEmail}`}
                  className="col-span-9 break-all text-base text-ink transition-colors duration-200 hover:text-primary sm:col-span-10"
                >
                  {careersEmail}
                </a>
              </li>
              <li className="grid grid-cols-12 items-baseline gap-4 border-t border-line border-b py-5">
                <span className="col-span-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted sm:col-span-2">
                  TEL
                </span>
                <a
                  href={`tel:${contact.phone}`}
                  className="col-span-9 text-base text-ink transition-colors duration-200 hover:text-primary sm:col-span-10"
                >
                  {contact.phone}
                </a>
              </li>
            </ul>

            <div className="mt-12">
              <a
                href={`mailto:${careersEmail}`}
                className="group inline-flex items-center gap-2 border-b border-ink pb-2 text-sm font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out hover:border-primary hover:text-primary"
              >
                이메일 보내기
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
