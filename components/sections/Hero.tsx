"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { company, yearsOfOperation } from "@/data/site-content";

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SLOGAN_HIGHLIGHT = "됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Hero 통계 — 3개 inline (이전 4-수치 strip 제거: Stats 섹션과 중복 H-2).
 * Stats 섹션이 본 데이터 (12,000+ 등), Hero는 핵심 1-2개 + 운영 경험 정도만.
 */
const INLINE_STATS = [
  { value: `${yearsOfOperation}`, suffix: "년", label: "운영 경험" },
  { value: "12,000", suffix: "+", label: "관리 세대수" },
  { value: "85", suffix: "+", label: "운영 단지" },
];

export function Hero() {
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

  const slogan2Idx = SLOGAN_LINE_2.lastIndexOf(SLOGAN_HIGHLIGHT);

  return (
    <section
      aria-label="히어로"
      className="relative isolate overflow-hidden bg-[#0e1530]"
      style={{ minHeight: "min(82svh, 820px)" }}
    >
      {/* 다크 그라데이션 베이스 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0e1530] via-primary to-[#0a0f24]"
      />
      {/* H-1 대응: 우상단 추가 글로우로 텍스트 콘트라스트 보강 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-transparent"
      />
      {/* 미세 grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative">
        <Container>
          <div className="flex min-h-[calc(82svh-3rem)] flex-col justify-center pb-16 pt-20 md:pt-24 lg:pt-28">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-4xl"
            >
              {/* eyebrow */}
              <motion.p
                variants={item}
                className="eyebrow !text-white/55"
              >
                (주)케이비개발 · SINCE {company.foundedYear}
              </motion.p>

              {/* h1 — Pretendard 900 weight + text-shadow (H-1 대응) */}
              <motion.h1
                variants={item}
                className="mt-7 !text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.98,
                  textShadow: "0 2px 24px rgba(0, 0, 0, 0.3)",
                }}
              >
                <span className="block">{SLOGAN_LINE_1}</span>
                <span className="block">
                  {slogan2Idx >= 0 ? (
                    <>
                      {SLOGAN_LINE_2.slice(0, slogan2Idx)}
                      <span className="text-accent">{SLOGAN_HIGHLIGHT}</span>
                    </>
                  ) : (
                    SLOGAN_LINE_2
                  )}
                </span>
              </motion.h1>

              <motion.div
                variants={item}
                aria-hidden="true"
                className="mt-9 h-[2px] w-12 bg-accent"
              />

              <motion.p
                variants={item}
                className="mt-7 max-w-xl text-[15px] leading-[1.85] !text-white/85 md:text-base"
              >
                {SUBTITLE_LINE_1}
                <br />
                {SUBTITLE_LINE_2}
              </motion.p>

              {/* CTA — fold 위로 (H-4 대응) */}
              <motion.div
                variants={item}
                className="mt-10 flex flex-wrap items-center gap-5"
              >
                <Button as="link" href="/about" variant="accent" size="lg">
                  상담 문의
                  <span aria-hidden="true">→</span>
                </Button>
                <Link
                  href="/business"
                  className="border-b border-white/60 pb-1 text-[14px] font-medium !text-white transition-colors duration-200 hover:border-white"
                >
                  사업영역 보기 <span aria-hidden="true">→</span>
                </Link>
              </motion.div>

              {/* Inline stats — Hero 안 CTA 바로 아래 (H-2 4-수치 strip 대체) */}
              <motion.div
                variants={item}
                className="mt-12 flex flex-wrap gap-x-10 gap-y-6 md:mt-14 md:gap-x-14"
              >
                {INLINE_STATS.map((s) => (
                  <div key={s.label}>
                    <div className="font-mono-num text-[28px] font-bold leading-none !text-white md:text-[32px]">
                      {s.value}
                      <span className="ml-1 text-base font-medium !text-white/65">
                        {s.suffix}
                      </span>
                    </div>
                    <div className="mt-2 text-[12px] !text-white/55 md:text-[13px]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
