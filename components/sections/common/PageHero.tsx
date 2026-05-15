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
  /** 한글 큰 제목 (필수). 비어 있으면 breadcrumb 마지막 라벨 fallback. */
  title: string;
  /** title의 마지막 등장 1단어만 KB primary 강조. title 전체와 일치 시 무시. */
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
      <span className="text-primary">{italicWord}</span>
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

  /** title이 빈 문자열일 때 breadcrumb 마지막 라벨로 fallback (CEO 페이지 h1 누락 픽스 C-1) */
  const safeTitle =
    title && title.trim().length > 0
      ? title
      : breadcrumb[breadcrumb.length - 1]?.label ?? "";

  return (
    <section
      aria-labelledby="page-hero-title"
      className="relative overflow-hidden bg-bg-soft pt-16 pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
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

          {/* h1 — Pretendard 800 + 색상 강제 (P-1 픽스: 옅게 렌더 방지) */}
          <motion.h1
            id="page-hero-title"
            variants={item}
            className="mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              color: "var(--color-ink-strong)",
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
