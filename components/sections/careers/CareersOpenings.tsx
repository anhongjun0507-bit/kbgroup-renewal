"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// 옵션 B — 검증된 채용 공고 데이터 미보유. "준비 중" 상태 명시.
// 추후 CMS 연동 또는 직접 등록 시 공고 카드 리스트로 교체.

export function CareersOpenings() {
  const shouldReduce = useReducedMotion() ?? false;
  const careersEmail = contact.careersEmail ?? contact.email;

  const parentVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.15 } },
  };

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
      aria-labelledby="careers-openings-heading"
      className="bg-beige py-32 md:py-40"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={parentVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={itemVariants}>
            <div
              aria-hidden="true"
              className="mx-auto mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              OPEN POSITIONS
            </p>
          </motion.div>

          <motion.h2
            id="careers-openings-heading"
            variants={itemVariants}
            className="mt-8 font-serif text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl lg:text-6xl"
          >
            현재 진행 중인 <span className="serif-em">채용</span>이
            <br />
            곧 안내됩니다
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-10 text-base leading-[1.85] text-ink-soft md:text-lg"
          >
            신규 채용 공고는 이곳에 게재될 예정입니다.
            <br />
            관심 있는 분야가 있으시면 이메일로 미리 연락 주세요.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-12">
            <a
              href={`mailto:${careersEmail}`}
              className="group inline-flex items-center gap-2 border-b border-ink pb-2 text-sm font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out hover:border-primary hover:text-primary"
            >
              이메일로 문의하기
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
