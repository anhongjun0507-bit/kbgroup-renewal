"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { ceoMessage } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// kb-dvp.com 본문 paragraph 5 결구 부분 발췌. 원본 의미·표현 그대로 유지.
const QUOTE_LINE_1 = "공정하고 투명한 관리가 되도록";
const QUOTE_LINE_2 = "최선을 다하겠습니다";

export function CeoPortrait() {
  const shouldReduce = useReducedMotion() ?? false;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="ceo-portrait-heading"
      className="bg-cream py-24 md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16"
        >
          {/* Left — portrait placeholder */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <div className="relative aspect-[3/4] bg-beige">
              <span className="absolute inset-0 flex items-center justify-center text-center font-serif text-base italic text-ink-muted">
                CEO Portrait · 추후 교체
              </span>
              <span className="absolute right-4 top-4 bg-cream px-3 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink">
                {ceoMessage.authorTitle}
              </span>
            </div>
          </motion.div>

          {/* Right — quote + signature */}
          <motion.div
            variants={itemVariants}
            className="relative flex flex-col justify-center lg:col-span-7"
          >
            <span
              aria-hidden="true"
              className="absolute -left-2 -top-6 font-serif text-7xl text-gold/30 md:text-8xl"
            >
              &ldquo;
            </span>
            <blockquote
              id="ceo-portrait-heading"
              className="relative font-serif text-3xl font-bold italic leading-[1.3] tracking-[-0.02em] text-ink md:text-4xl lg:text-5xl"
            >
              <span className="block">{QUOTE_LINE_1}</span>
              <span className="block">{QUOTE_LINE_2}</span>
            </blockquote>

            <div className="mt-12 flex items-center gap-6">
              <div aria-hidden="true" className="h-px w-16 bg-gold" />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                  대표이사
                </p>
                <p className="mt-1 font-serif text-xl font-bold text-ink md:text-2xl">
                  {ceoMessage.authorName}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
