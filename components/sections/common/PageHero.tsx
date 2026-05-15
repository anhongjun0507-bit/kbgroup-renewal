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
  /** 비우면 현재 페이지 텍스트 only */
  href?: string;
};

interface Props {
  kicker: string;
  title: string;
  /**
   * 강조 규칙: title 내부의 마지막 1단어만 primary 컬러로 강조.
   * 단어 단위(공백 split)로 정확히 일치해야 함. 없으면 강조 없음.
   */
  italicWord?: string;
  subtitle: string;
  breadcrumb: BreadcrumbItem[];
}

/** italicWord가 title의 마지막 등장 위치에 있을 때 primary 컬러로 강조 */
function renderTitle(title: string, italicWord?: string) {
  if (!italicWord) return title;
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

  return (
    <section
      aria-labelledby="page-hero-title"
      className="bg-bg-soft pb-16 pt-20 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32"
    >
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 md:mb-14">
          <ol className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-ink-muted">
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <Fragment key={`${item.label}-${idx}`}>
                  <li>
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="uppercase transition-colors duration-200 hover:text-primary"
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
          className="max-w-4xl"
        >
          <motion.p
            variants={item}
            className="text-[13px] font-medium tracking-wide text-ink-muted"
          >
            {kicker}
          </motion.p>

          <motion.h1
            id="page-hero-title"
            variants={item}
            className="mt-5 text-[36px] font-bold leading-[1.12] tracking-[-0.035em] text-ink-strong md:text-[56px] lg:text-[68px]"
          >
            {renderTitle(title, italicWord)}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-2xl text-base leading-[1.7] text-ink md:text-lg"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
