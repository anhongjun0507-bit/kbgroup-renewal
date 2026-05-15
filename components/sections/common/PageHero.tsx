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
  /** 마지막 등장 위치의 1단어만 primary 강조 (NAI 영문 라벨 패턴 흡수) */
  italicWord?: string;
  subtitle: string;
  breadcrumb: BreadcrumbItem[];
}

function renderTitle(title: string, italicWord?: string) {
  if (!italicWord) return title;
  const idx = title.lastIndexOf(italicWord);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-accent">{italicWord}</span>
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

  return (
    <section
      aria-labelledby="page-hero-title"
      className="relative overflow-hidden bg-bg-soft pb-16 pt-20 md:pb-24 md:pt-28 lg:pb-28 lg:pt-32"
    >
      {/* 우측 그래픽 — 빨강 가는 세로선 + 90도 회전 영문 (빈 공간 채움) */}
      <div
        aria-hidden="true"
        className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-6"
      >
        <span className="h-32 w-[2px] bg-accent" />
        <span
          className="font-display text-[14px] italic tracking-[0.3em] text-accent/70"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {kicker}
        </span>
      </div>

      <Container className="relative">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 md:mb-14">
          <ol className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.1em] text-ink-muted">
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <Fragment key={`${item.label}-${idx}`}>
                  <li>
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="uppercase transition-colors duration-200 hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="uppercase text-ink">{item.label}</span>
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
          {/* Playfair italic eyebrow — KB 빨강 */}
          <motion.p
            variants={item}
            className="font-display text-[20px] italic leading-none text-accent md:text-[22px]"
          >
            {kicker}
          </motion.p>

          <motion.h1
            id="page-hero-title"
            variants={item}
            className="mt-5 font-bold leading-[1.12] tracking-[-0.022em] text-ink-strong"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}
          >
            {renderTitle(title, italicWord)}
          </motion.h1>

          {/* 빨강 가는 라인 */}
          <motion.div
            variants={item}
            aria-hidden="true"
            className="mt-8 h-[2px] w-10 bg-accent"
          />

          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-base leading-[1.85] text-ink md:text-lg"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
