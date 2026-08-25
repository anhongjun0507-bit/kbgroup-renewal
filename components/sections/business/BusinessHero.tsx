"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import type { BusinessArea } from "@/lib/content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  area: BusinessArea;
  index: number;
}

export function BusinessHero({ area, index }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const num = String(index + 1).padStart(2, "0");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.15,
        delayChildren: shouldReduce ? 0 : 0.1,
      },
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
      aria-labelledby="business-hero-title"
      className="bg-cream pb-24 pt-32 md:pb-32 md:pt-40"
    >
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-12">
          <ol className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-primary"
              >
                HOME
              </Link>
            </li>
            <li aria-hidden="true" className="text-ink-muted/60">
              /
            </li>
            <li>
              <Link
                href="/business"
                className="transition-colors duration-200 hover:text-primary"
              >
                SERVICES
              </Link>
            </li>
            <li aria-hidden="true" className="text-ink-muted/60">
              /
            </li>
            <li className="text-ink-soft">{area.name}</li>
          </ol>
        </nav>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl"
        >
          {/* Index + english */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex items-center gap-4"
          >
            <span
              aria-hidden="true"
              className="font-serif text-2xl italic text-primary md:text-3xl"
            >
              {num}
            </span>
            <span aria-hidden="true" className="text-ink-muted/60">
              ·
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {area.englishName}
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            id="business-hero-title"
            variants={itemVariants}
            className="mb-10 font-serif text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-ink md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {area.name}
          </motion.h1>

          {/* Gold divider */}
          <motion.div
            variants={itemVariants}
            aria-hidden="true"
            className="mb-8 h-px w-16 bg-gold"
          />

          {/* Tagline (hero용 짧은 문구) */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl font-serif text-lg italic leading-[1.85] text-ink-soft md:text-xl"
          >
            {area.tagline}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
