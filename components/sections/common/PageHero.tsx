"use client";

import Link from "next/link";
import { Fragment } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export type BreadcrumbItem = {
  label: string;
  /** 비우면 현재 페이지(텍스트 only)로 표시 */
  href?: string;
};

interface Props {
  kicker: string;
  title: string;
  /** 제목에서 serif italic 강조할 단어 — 없으면 강조 없이 출력 */
  italicWord?: string;
  subtitle: string;
  breadcrumb: BreadcrumbItem[];
}

function renderTitle(title: string, italicWord?: string) {
  if (!italicWord) return title;
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

export function PageHero({
  kicker,
  title,
  italicWord,
  subtitle,
  breadcrumb,
}: Props) {
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
      aria-labelledby="page-hero-title"
      className="bg-cream pb-12 pt-32 md:pb-16 md:pt-40"
    >
      <Container>
        <nav aria-label="Breadcrumb" className="mb-12">
          <ol className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <Fragment key={`${item.label}-${idx}`}>
                  <li>
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="transition-colors duration-200 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-ink-soft">{item.label}</span>
                    )}
                  </li>
                  {!isLast && (
                    <li aria-hidden="true" className="text-ink-muted/60">
                      /
                    </li>
                  )}
                </Fragment>
              );
            })}
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
              {kicker}
            </p>
          </motion.div>

          <motion.h1
            id="page-hero-title"
            variants={itemVariants}
            className="mt-6 font-serif text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-ink md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {renderTitle(title, italicWord)}
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
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
