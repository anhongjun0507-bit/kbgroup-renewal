"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { ceoMessage } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function CeoMessage() {
  const shouldReduce = useReducedMotion() ?? false;

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.08 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-labelledby="ceo-message-heading"
      className="bg-bg-soft py-24 md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="mx-auto max-w-3xl"
        >
          <h2 id="ceo-message-heading" className="sr-only">
            대표 인사말 전문
          </h2>

          <motion.p variants={item} className="eyebrow text-center">
            CEO LETTER
          </motion.p>
          <motion.h3
            variants={item}
            className="mt-4 text-center"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.25,
              color: "var(--color-ink-strong)",
            }}
          >
            대표 인사말 전문
          </motion.h3>
          <motion.div
            variants={item}
            aria-hidden="true"
            className="mx-auto mt-7 h-[2px] w-10 bg-primary"
          />

          <div className="mt-14 space-y-7">
            {ceoMessage.paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                variants={item}
                className="text-[16px] leading-[1.9] text-ink md:text-[17px]"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.div
            variants={item}
            className="mt-16 flex flex-col items-end"
          >
            <div aria-hidden="true" className="mb-5 h-px w-12 bg-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {ceoMessage.authorTitle}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-ink-strong">
              {ceoMessage.authorName}
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
