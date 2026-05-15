"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { Complex } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  complexes: Complex[];
}

export function BusinessRelatedCases({ complexes }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="related-cases-heading"
      className="bg-cream py-32 md:py-40"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mb-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <Heading
            kicker="RELATED CASES"
            title="함께한 현장들"
            italicWord="현장들"
            align="left"
            size="md"
            as="h2"
          />
          <Link
            href="/cases"
            className="group hidden items-center gap-2 self-end text-sm font-medium uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out hover:text-ink md:inline-flex"
          >
            View All Cases
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6 lg:gap-8">
          {complexes.map((complex, index) => (
            <RelatedCard
              key={complex.name}
              complex={complex}
              index={index}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </Container>

      <span id="related-cases-heading" className="sr-only">
        함께한 현장들
      </span>
    </section>
  );
}

function RelatedCard({
  complex,
  index,
  shouldReduce,
}: {
  complex: Complex;
  index: number;
  shouldReduce: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");
  const typeLabel = complex.type ? `${complex.type} 발주` : null;
  const meta = [complex.region, typeLabel].filter(Boolean).join(" · ");

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: shouldReduce ? 0 : 0.8,
        delay: shouldReduce ? 0 : index * 0.15,
        ease: EASE_OUT_EXPO,
      }}
      className="group"
    >
      <Link href="/cases" className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-beige to-line/40">
          <div
            className={
              shouldReduce
                ? "absolute inset-0"
                : "absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            }
          >
            <span className="absolute inset-0 flex items-center justify-center px-8 text-center font-serif text-base italic text-ink-muted md:text-lg">
              {complex.name}
            </span>
          </div>
          <span
            aria-hidden="true"
            className="absolute right-5 top-5 font-serif text-xl italic text-primary md:text-2xl"
          >
            {num}
          </span>
        </div>
        <div className="mt-6">
          <h3 className="font-serif text-lg font-bold leading-tight tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-primary md:text-xl">
            {complex.name}
          </h3>
          {meta && (
            <p className="mt-2 text-sm text-ink-soft">{meta}</p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
