"use client";

import Link from "next/link";
import { Fragment } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface Props {
  kicker: string;
  title: string;
  italicWord?: string;
  subtitle: string;
  breadcrumb: BreadcrumbItem[];
}

function renderTitle(title: string, italicWord?: string) {
  if (!italicWord) return title;
  if (italicWord.trim() === title.trim()) return title;
  const idx = title.lastIndexOf(italicWord);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span style={{ color: "var(--color-primary)" }}>{italicWord}</span>
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

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.1,
        delayChildren: shouldReduce ? 0 : 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT },
    },
  };

  // safeTitle fallback (title 비어있을 때 breadcrumb 마지막 라벨 사용)
  const safeTitle =
    title && title.trim().length > 0
      ? title
      : breadcrumb[breadcrumb.length - 1]?.label ?? "페이지";

  return (
    <section
      aria-labelledby="page-hero-title"
      className="relative overflow-hidden border-b border-line bg-bg-soft pt-16 pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
    >
      <Container className="relative">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.15em] text-ink-muted">
            {breadcrumb.map((bi, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <Fragment key={`${bi.label}-${idx}`}>
                  <li>
                    {bi.href && !isLast ? (
                      <Link
                        href={bi.href}
                        className="uppercase font-medium transition-colors duration-200 hover:text-primary"
                      >
                        {bi.label}
                      </Link>
                    ) : (
                      <span className="uppercase font-medium text-ink">{bi.label}</span>
                    )}
                  </li>
                  {!isLast && (
                    <li aria-hidden="true" className="text-ink-muted">
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
          variants={stagger}
          className="max-w-3xl"
        >
          {/* eyebrow */}
          <motion.p variants={item} className="eyebrow">
            {kicker}
          </motion.p>

          {/* h1 — SUIT 900 + inline color 강제 (R4-2·R4-3 픽스) */}
          <motion.h1
            id="page-hero-title"
            variants={item}
            className="mt-5 font-display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 1.1,
              color: "#0e1530",  /* inline 강제 — 외부 CSS에 옅게 덮이지 않도록 */
            }}
          >
            {renderTitle(safeTitle, italicWord)}
          </motion.h1>

          <motion.div
            variants={item}
            aria-hidden="true"
            className="mt-7 h-[2px] w-10 bg-primary"
          />

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-[15px] leading-[1.85] text-ink md:text-base"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
