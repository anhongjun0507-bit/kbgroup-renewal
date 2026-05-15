"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { ceoMessage } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function CeoMessage() {
  const shouldReduce = useReducedMotion() ?? false;

  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="ceo-message-heading"
      className="bg-beige py-32 md:py-40"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={parentVariants}
          className="mx-auto max-w-3xl"
        >
          <h2 id="ceo-message-heading" className="sr-only">
            대표 인사말 전문
          </h2>

          <div className="space-y-8">
            {ceoMessage.paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                variants={itemVariants}
                className="font-serif text-lg leading-[2] text-ink md:text-xl"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-col items-end"
          >
            <div
              aria-hidden="true"
              className="mb-6 h-px w-16 bg-gold"
            />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              {ceoMessage.authorTitle}
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">
              {ceoMessage.authorName}
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
