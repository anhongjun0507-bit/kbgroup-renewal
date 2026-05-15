"use client";

import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { company, contact, yearsOfOperation } from "@/data/site-content";

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SLOGAN_HIGHLIGHT = "됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

const INLINE_STATS = [
  { value: `${yearsOfOperation}`, suffix: "년", label: "운영 경험" },
  { value: "12,000", suffix: "+", label: "관리 세대수" },
  { value: "85", suffix: "+", label: "운영 단지" },
];

export function Hero() {
  const slogan2Idx = SLOGAN_LINE_2.lastIndexOf(SLOGAN_HIGHLIGHT);

  return (
    <section
      aria-label="히어로"
      data-surface="dark"
      className="relative isolate flex items-center overflow-hidden bg-[#0e1530]"
      style={{ minHeight: "min(720px, 84svh)" }}
    >
      {/* 베이스 그라데이션 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0e1530] via-[#1a2456] to-[#0e1530]"
      />
      {/* h1 영역 뒤 라디얼 vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: "0",
          top: "15%",
          width: "75%",
          height: "70%",
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.45) 0%, transparent 65%)",
        }}
      />
      {/* P1-11: grid opacity 0.05 → 0.03 약화, Hero에만 사용 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* P0-04: above-the-fold는 motion 제거, 첫 paint에 즉시 가시 */}
      <div className="relative z-10 w-full">
        <Container>
          <div className="max-w-4xl pt-20 pb-12 md:pt-24">
            <p
              className="eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              (주)케이비개발 · SINCE {company.foundedYear}
            </p>

            {/* h1 — ls -0.02em (P1-10 한글 자모 충돌 방지) */}
            <h1
              className="mt-6 font-display"
              style={{
                fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
                fontWeight: 900,
                letterSpacing: "var(--tracking-tight)",
                lineHeight: 1.05,
                color: "#ffffff",
                textShadow: [
                  "0 1px 0 rgba(0,0,0,0.5)",
                  "0 2px 8px rgba(0,0,0,0.4)",
                  "0 8px 32px rgba(30,42,94,0.6)",
                ].join(", "),
              }}
            >
              <span className="block">{SLOGAN_LINE_1}</span>
              <span className="block">
                {slogan2Idx >= 0 ? (
                  <>
                    {SLOGAN_LINE_2.slice(0, slogan2Idx)}
                    <span style={{ color: "var(--color-accent)" }}>
                      {SLOGAN_HIGHLIGHT}
                    </span>
                  </>
                ) : (
                  SLOGAN_LINE_2
                )}
              </span>
            </h1>

            <div aria-hidden="true" className="mt-7 h-[2px] w-12 bg-accent" />

            <p
              className="mt-5 max-w-xl text-[15px] leading-[1.85] md:text-base"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              {SUBTITLE_LINE_1}
              <br />
              {SUBTITLE_LINE_2}
            </p>

            {/* P0-03 + P1-05: CTA "상담 문의" → "무료 상담 신청" + tel: 라우팅 */}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Button
                as="link"
                href={`tel:${contact.phone}`}
                variant="accent"
                size="lg"
              >
                무료 상담 신청
                <span aria-hidden="true">→</span>
              </Button>
              <Link
                href="#contact"
                className="border-b pb-1 text-[14px] font-medium transition-colors duration-200"
                style={{
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.55)",
                }}
              >
                온라인 문의 <span aria-hidden="true">↓</span>
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5 md:gap-x-12">
              {INLINE_STATS.map((s) => (
                <div key={s.label}>
                  <div
                    className="font-mono-num text-[24px] font-bold leading-none md:text-[28px]"
                    style={{ color: "#ffffff" }}
                  >
                    {s.value}
                    <span
                      className="ml-1 text-base font-medium"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {s.suffix}
                    </span>
                  </div>
                  <div
                    className="mt-2 text-[12px]"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
