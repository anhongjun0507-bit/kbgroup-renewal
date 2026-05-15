"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const TITLE = "관리하는 공간들";
const ITALIC = "공간들";
const SUBTITLE =
  "케이비개발이 함께하는 단지들 — 신뢰의 일상이 흐르는 곳입니다.";

function renderTitle(title: string, italicWord: string) {
  const idx = title.indexOf(italicWord);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="serif-em">{italicWord}</span>
      {title.slice(idx + italicWord.length)}
    </>
  );
}

export function CasesHero() {
  const shouldReduce = useReducedMotion() ?? false;

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
      aria-labelledby="cases-hero-title"
      className="bg-cream pb-12 pt-32 md:pb-16 md:pt-40"
    >
      <Container>
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
            <li className="text-ink-soft">CASES</li>
          </ol>
        </nav>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl"
        >
          <motion.div variants={itemVariants}>
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              OUR PORTFOLIO
            </p>
          </motion.div>

          <motion.h1
            id="cases-hero-title"
            variants={itemVariants}
            className="mt-6 font-serif text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-ink md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {renderTitle(TITLE, ITALIC)}
          </motion.h1>

          <motion.div
            variants={itemVariants}
            aria-hidden="true"
            className="mb-8 mt-10 h-px w-16 bg-gold"
          />

          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-lg leading-[1.85] text-ink-soft md:text-xl"
          >
            {SUBTITLE}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
