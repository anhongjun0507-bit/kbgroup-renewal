"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import type { BusinessArea } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  area: BusinessArea;
}

export function BusinessCTA({ area }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.15 },
    },
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
      aria-labelledby={`cta-${area.id}`}
      className="bg-ink py-24 text-white md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={parentVariants}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Kicker */}
          <motion.div variants={itemVariants} className="mb-10">
            <div
              aria-hidden="true"
              className="mx-auto mb-6 h-px w-12 bg-gold"
            />
            <div className="text-xs font-medium uppercase tracking-[0.35em] text-gold">
              GET IN TOUCH
            </div>
          </motion.div>

          {/* Main title */}
          <motion.h2
            id={`cta-${area.id}`}
            variants={itemVariants}
            className="font-serif text-3xl font-bold leading-[1.15] tracking-[-0.02em] md:text-4xl lg:text-5xl"
          >
            {area.name} 서비스{" "}
            <span className="italic text-gold">문의하기</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-xl text-base leading-[1.85] text-white/60"
          >
            전문 컨설턴트가 직접 상담해드립니다.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 border-b border-white pb-2 text-sm font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out hover:border-gold hover:text-gold"
            >
              서비스 문의
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              href="/business"
              className="text-sm tracking-wide text-white/60 transition-colors duration-300 ease-out hover:text-white"
            >
              다른 서비스 보기
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
