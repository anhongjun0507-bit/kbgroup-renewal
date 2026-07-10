"use client";

import Link from "next/link";
import Image from "next/image";
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
  /** 히어로 우측 배경 사진 경로. 지정 시 텍스트 좌측은 bg-soft로 페이드되어 가독성 유지 */
  bgImage?: string;
  /** 배경 사진 object-position (기본 center). 예) "right center" */
  bgPosition?: string;
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
  bgImage,
  bgPosition = "center",
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
      {/* 우측 배경 사진 — 좌측 텍스트 영역은 bg-soft로 페이드되어 가독성 유지.
          bgImage 미지정 시 렌더링 안 함(기존 텍스트 전용 히어로 유지). */}
      {bgImage && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-y-0 right-0 w-full md:w-[62%] lg:w-[56%]">
            <Image
              src={bgImage}
              alt=""
              fill
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              style={{ objectPosition: bgPosition }}
            />
          </div>
          {/* 데스크톱: 좌→우 페이드로 텍스트 배경을 bg-soft 단색으로 */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(90deg, #F7F8FA 0%, #F7F8FA 30%, rgba(247,248,250,0.72) 46%, rgba(247,248,250,0) 70%)",
            }}
          />
          {/* 모바일: 사진이 전체폭이므로 좌측을 더 강하게 덮어 텍스트 가독 확보 */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                "linear-gradient(90deg, #F7F8FA 0%, rgba(247,248,250,0.92) 42%, rgba(247,248,250,0.55) 100%)",
            }}
          />
        </div>
      )}

      <Container className="relative z-10">
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
              /* Phase 14-G G-1 — 모바일 min 2rem → 1.75rem(28px), viewport 5vw → 5.5vw */
              fontSize: "clamp(1.75rem, 5.5vw, 3.25rem)",
              fontWeight: 900,
              letterSpacing: "var(--tracking-tighter)",
              lineHeight: 1.15,
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
