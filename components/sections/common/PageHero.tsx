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
        staggerChildren: shouldReduce ? 0 : 0.08,
        delayChildren: shouldReduce ? 0 : 0.05,
      },
    },
  };

  /* Phase 14 P0-07 — 첫 페인트 시 opacity 0 영구 invisible 위험 제거.
     opacity는 항상 1로 두고 transform y만 미세 이동 → JS-off/지연 환경에서도 즉시 가독.
     reduced-motion 시 transform도 0으로 즉시 완료. */
  const item: Variants = {
    hidden: { opacity: 1, y: shouldReduce ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  /** title이 비어있어도 breadcrumb 마지막 라벨로 fallback (R5-2·R5-3) */
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
          <motion.p variants={item} className="eyebrow">
            {kicker}
          </motion.p>

          {/* h1 — motion 제거하고 plain h1로 SSR-safe (R5-2·R5-3 가시성).
              inline style로 color/weight/letterSpacing 강제. */}
          <h1
            id="page-hero-title"
            className="mt-5 font-display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "var(--tracking-tighter)",
              lineHeight: 1.1,
              color: "#0e1530",
              minHeight: "1.05em",
            }}
          >
            {renderTitle(safeTitle, italicWord)}
          </h1>

          <motion.div
            variants={item}
            aria-hidden="true"
            /* Phase 14 P2-02 — gold-rule 토큰 사용. PageHero는 sm 40px */
            className="gold-rule gold-rule-sm mt-7 !my-0"
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
