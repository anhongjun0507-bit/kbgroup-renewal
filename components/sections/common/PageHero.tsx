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
  /** 한글 제목 (필수). 빈 문자열이면 page 자체 fallback이 들어가야 함 */
  title: string;
  /**
   * 마지막 등장 위치의 1단어만 KB primary(남색) 강조.
   * title 전체와 일치하는 경우 강조 무시 (전체 컬러화 방지).
   * 비우면 강조 없음.
   */
  italicWord?: string;
  subtitle: string;
  breadcrumb: BreadcrumbItem[];
}

function renderTitle(title: string, italicWord?: string) {
  if (!italicWord) return title;
  // 전체와 일치하면 강조 안 함 (facility 케이스 방지)
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

  // h1 fallback (title이 비어있는 경우 — CEO 페이지 버그 픽스)
  const safeTitle = title?.trim() ? title : breadcrumb[breadcrumb.length - 1]?.label ?? "";

  return (
    <section
      aria-labelledby="page-hero-title"
      className="relative overflow-hidden bg-bg-soft pt-16 pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
    >
      <Container className="relative">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.1em] text-ink-muted">
            {breadcrumb.map((bi, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <Fragment key={`${bi.label}-${idx}`}>
                  <li>
                    {bi.href && !isLast ? (
                      <Link
                        href={bi.href}
                        className="uppercase transition-colors duration-200 hover:text-primary"
                      >
                        {bi.label}
                      </Link>
                    ) : (
                      <span className="uppercase text-ink">{bi.label}</span>
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
          {/* eyebrow — Pretendard uppercase 회색 (italic 제거) */}
          <motion.p
            variants={item}
            className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-muted"
          >
            {kicker}
          </motion.p>

          <motion.h1
            id="page-hero-title"
            variants={item}
            className="mt-5 font-extrabold leading-[1.18] tracking-[-0.025em] text-ink-strong"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
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
