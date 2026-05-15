"use client";

import { Fragment } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { processSteps, type ProcessStep } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function BusinessProcess() {
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
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.15 },
    },
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  const arrowVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduce ? 0 : 0.6,
        delay: shouldReduce ? 0 : 0.3,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <section
      aria-labelledby="process-heading"
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
            kicker="OUR PROCESS"
            title="체계적인 진행 과정"
            italicWord="진행 과정"
            align="center"
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
          className="flex flex-col items-stretch gap-12 md:flex-row md:items-start md:gap-4 lg:gap-8"
        >
          {processSteps.map((step, i) => (
            <Fragment key={step.key}>
              <Step step={step} variants={stepVariants} />
              {i < processSteps.length - 1 && (
                <motion.div
                  aria-hidden="true"
                  variants={arrowVariants}
                  className="hidden self-center pt-12 md:flex"
                >
                  <span className="text-2xl text-ink-muted">→</span>
                </motion.div>
              )}
            </Fragment>
          ))}
        </motion.div>
      </Container>

      <span id="process-heading" className="sr-only">
        체계적인 진행 과정
      </span>
    </section>
  );
}

function Step({ step, variants }: { step: ProcessStep; variants: Variants }) {
  return (
    <motion.div variants={variants} className="flex-1 text-center md:text-left">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-ink-muted">
        STEP
      </p>
      <p
        aria-hidden="true"
        className="mt-2 font-serif text-5xl font-bold italic leading-none text-primary md:text-6xl"
      >
        {step.numberLabel}
      </p>
      <h3 className="mt-6 font-serif text-xl font-bold leading-tight tracking-[-0.01em] text-ink md:text-2xl">
        {step.name}
      </h3>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">
        {step.englishName}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {step.description}
      </p>
    </motion.div>
  );
}
