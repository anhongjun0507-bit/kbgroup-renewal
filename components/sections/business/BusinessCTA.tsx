"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import type { BusinessArea } from "@/data/site-content";
import { contact } from "@/data/site-content";

/* Phase 4 — BusinessCTA 톤 정비 (navy-900 + accent-500 통일) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  area: BusinessArea;
}

export function BusinessCTA({ area }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

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
      data-surface="dark"
      aria-labelledby={`cta-${area.id}`}
      className="section relative isolate overflow-hidden bg-navy-900 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(50% 60% at 20% 30%, rgba(201,162,75,0.14) 0%, transparent 60%)",
            "radial-gradient(45% 55% at 80% 70%, rgba(30,44,86,0.7) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <Container className="relative">
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
              className="mx-auto mb-6 h-[3px] w-12 bg-accent-500"
            />
            <p className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
              GET IN TOUCH
            </p>
          </motion.div>

          <motion.h2
            id={`cta-${area.id}`}
            variants={itemVariants}
            className="mt-6 font-display font-extrabold leading-[1.15] tracking-tight"
            style={{
              color: "#ffffff",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {area.name} 서비스 <span className="text-accent-500">문의하기</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-base md:text-lg"
            style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.75 }}
          >
            전문 컨설턴트가 직접 상담해드립니다.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          >
            <Button
              as="link"
              href={`tel:${contact.phone}`}
              variant="accent"
              size="lg"
            >
              무료 상담 신청
              <span aria-hidden="true">→</span>
            </Button>
            <Button as="link" href="/business" variant="ghost" size="lg">
              다른 서비스 보기
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
