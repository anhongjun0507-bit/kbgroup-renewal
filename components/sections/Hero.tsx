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

const HIGHLIGHTS = [
  { value: "12,000+", label: "관리 세대수" },
  { value: "85+", label: "운영 단지" },
  { value: `${yearsOfOperation}년`, label: "운영 경험" },
  { value: "11종", label: "인허가 보유" },
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

  /** "자산이 됩니다"에서 "됩니다"만 accent 강조 */
  const slogan2Idx = SLOGAN_LINE_2.lastIndexOf(SLOGAN_HIGHLIGHT);

  return (
    <section
      aria-label="히어로"
      className="relative isolate overflow-hidden bg-[#0e1530]"
      style={{ minHeight: "min(88svh, 880px)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0e1530] via-primary to-[#0a0f24]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative">
        <Container>
          <div className="grid min-h-[calc(88svh-3rem)] grid-cols-1 items-center pb-12 pt-20 md:pt-24 lg:pt-28">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-4xl"
            >
              {/* eyebrow — Pretendard uppercase, 회색 톤 */}
              <motion.p
                variants={item}
                className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/55"
              >
                (주)케이비개발 · SINCE {company.foundedYear}
              </motion.p>

              {/* h1 — text-white 강제 (Hero h1 가독성 복구) */}
              <motion.h1
                variants={item}
                className="mt-7 font-extrabold !text-white"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.08,
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
                className="mt-10 h-[2px] w-12 bg-accent"
              />

              <motion.p
                variants={item}
                className="mt-8 max-w-xl text-[15px] leading-[1.85] text-white/85 md:text-base"
              >
                {SUBTITLE_LINE_1}
                <br />
                {SUBTITLE_LINE_2}
              </motion.p>

              <motion.div
                variants={item}
                className="mt-12 flex flex-wrap items-center gap-5"
              >
                <Button as="link" href="/about" variant="accent" size="lg">
                  상담 문의
                  <span aria-hidden="true">→</span>
                </Button>
                <Link
                  href="/business"
                  className="border-b border-white/60 pb-1 text-[14px] font-medium text-white transition-colors duration-200 hover:border-white hover:text-white"
                >
                  사업영역 보기 <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stat strip — 한글 라벨만, 영문 caption 제거 */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduce ? 0 : 0.9,
                delay: shouldReduce ? 0 : 0.55,
                ease: EASE_OUT,
              }}
              className="mt-20 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-10 md:mt-24 md:grid-cols-4 md:gap-x-12"
            >
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="border-l-2 border-accent pl-4">
                  <p className="tabular text-[32px] font-extrabold leading-none tracking-[-0.025em] !text-white md:text-[40px]">
                    {h.value}
                  </p>
                  <p className="mt-3 text-[13px] font-medium text-white/65">
                    {h.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
