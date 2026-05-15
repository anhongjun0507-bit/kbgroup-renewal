"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { company, yearsOfOperation } from "@/data/site-content";

const EYEBROW = "Trusted Facility Partner";
const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const HIGHLIGHTS = [
  { value: "12,000+", label: "관리 세대수", caption: "MANAGED HOUSEHOLDS" },
  { value: "85+", label: "운영 단지", caption: "COMPLEXES" },
  { value: `${yearsOfOperation}`, label: "운영 경험 (년)", caption: "YEARS" },
  { value: "11", label: "인허가 보유", caption: "LICENSES" },
];

export function Hero() {
  const shouldReduce = useReducedMotion() ?? false;

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.12,
        delayChildren: shouldReduce ? 0 : 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.9, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-label="히어로"
      className="relative isolate overflow-hidden bg-[#0e1530] text-white"
      style={{ minHeight: "min(88svh, 900px)" }}
    >
      {/* 배경 그라데이션 — KB 남색 + 짙은 네이비 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0e1530] via-primary to-[#0a0f24]"
      />
      {/* 미세 grid 패턴 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* KB 3색 가로 라인 (상단 액센트) */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 flex h-[3px]"
      >
        <span className="flex-1 bg-secondary" />
        <span className="flex-1 bg-accent" />
        <span className="flex-1 bg-white/40" />
      </div>

      <div className="relative">
        <Container>
          <div className="grid min-h-[calc(88svh-3rem)] grid-cols-1 items-center pb-12 pt-20 md:pt-24 lg:pt-28">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-4xl"
            >
              {/* 영문 eyebrow — Playfair italic + KB 빨강 */}
              <motion.p
                variants={item}
                className="font-display text-[20px] italic leading-none text-accent md:text-[22px]"
              >
                {EYEBROW}
              </motion.p>

              {/* 한글 헤딩 — 96px → 64px 축소 */}
              <motion.h1
                variants={item}
                className="mt-7 font-bold leading-[1.1] tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
              >
                <span className="block">{SLOGAN_LINE_1}</span>
                <span className="block">{SLOGAN_LINE_2}</span>
              </motion.h1>

              {/* KB 3색 액센트 라인 (구분자) */}
              <motion.div
                variants={item}
                aria-hidden="true"
                className="mt-10 h-[2px] w-12 bg-accent"
              />

              <motion.p
                variants={item}
                className="mt-8 max-w-xl text-[15px] leading-[1.85] text-white/75 md:text-base"
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
                  className="text-[14px] font-medium text-white/80 transition-colors duration-200 hover:text-white"
                >
                  사업영역 보기 <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero footer stat strip */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduce ? 0 : 0.9,
                delay: shouldReduce ? 0 : 0.6,
                ease: EASE_OUT,
              }}
              className="mt-20 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-10 md:mt-24 md:grid-cols-4 md:gap-x-12"
            >
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="border-l-2 border-accent pl-4">
                  <p className="font-display text-[10px] italic tracking-widest text-accent">
                    {h.caption}
                  </p>
                  <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.02em] text-white md:text-[40px]">
                    {h.value}
                  </p>
                  <p className="mt-2 text-[12px] font-medium text-white/65 md:text-[13px]">
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
