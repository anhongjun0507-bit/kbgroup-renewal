"use client";

import { Container, Button } from "@/components/ui";
import { company, contact, yearsOfOperation } from "@/data/site-content";

/* Phase 3.A — Hero 전면 재구성
   배경: 135deg navy 그라데이션 + mesh radial 3blend + 우측 placeholder visual
   좌측: max-w 720 / "신뢰가" / "자산이 됩니다" 2줄 + underline-gradient SVG
   CTA: Primary(무료 상담) + Ghost(사업영역 보기)
   하단 floating glass card 통계 / 우측 하단 Scroll 인디케이터 */

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
const SLOGAN_HIGHLIGHT = "됩니다";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

const FLOATING_STATS = [
  { value: yearsOfOperation, suffix: "년", label: "운영 경험" },
  { value: "12,000", suffix: "+", label: "관리 세대수" },
  { value: "85", suffix: "+", label: "운영 단지" },
];

export function Hero() {
  const slogan2Idx = SLOGAN_LINE_2.lastIndexOf(SLOGAN_HIGHLIGHT);

  return (
    <section
      aria-label="히어로"
      data-surface="dark"
      className="relative isolate overflow-hidden bg-navy-900 text-white"
      style={{ minHeight: "min(820px, 92svh)" }}
    >
      {/* 베이스 그라데이션 — 135deg navy-900 → #1B2A5E → navy-900 */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0B1A33 0%, #1B2A5E 50%, #0B1A33 100%)",
        }}
      />

      {/* Stripe 스타일 mesh — radial blob 3 blend */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(50% 60% at 15% 20%, rgba(201,162,75,0.18) 0%, transparent 60%)",
            "radial-gradient(45% 55% at 85% 75%, rgba(110,140,255,0.18) 0%, transparent 60%)",
            "radial-gradient(60% 50% at 70% 15%, rgba(255,255,255,0.06) 0%, transparent 65%)",
          ].join(", "),
        }}
      />

      {/* 우측 60% placeholder visual — 추상 단지 실루엣 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
      >
        {/* 어두운 오버레이 0.55 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,26,51,0.85) 0%, rgba(11,26,51,0.35) 35%, rgba(11,26,51,0.55) 100%)",
          }}
        />
        {/* 추상 빌딩 실루엣 SVG */}
        <svg
          viewBox="0 0 600 700"
          className="absolute bottom-0 right-0 h-full w-auto opacity-30"
          preserveAspectRatio="xMaxYMax meet"
        >
          <defs>
            <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#16315C" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* 빌딩 블록 5개 */}
          <rect x="40" y="280" width="80" height="420" fill="url(#bldg)" />
          <rect x="135" y="200" width="95" height="500" fill="url(#bldg)" />
          <rect x="245" y="320" width="70" height="380" fill="url(#bldg)" />
          <rect x="330" y="160" width="110" height="540" fill="url(#bldg)" />
          <rect x="455" y="240" width="105" height="460" fill="url(#bldg)" />
          {/* 창문 패턴 — Phase 6 B-1: 일부 창문에 노란 twinkle */}
          {Array.from({ length: 20 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) => {
              const idx = row * 5 + col;
              const twinkle = idx % 17 === 0;
              const strong = !twinkle && idx % 4 === 0;
              const dur = 3 + (idx % 4); // 3~6s
              const delay = (idx % 7) * 0.4;
              return (
                <rect
                  key={`w-${row}-${col}`}
                  x={50 + col * 100}
                  y={250 + row * 22}
                  width={8}
                  height={10}
                  fill={twinkle ? "#E3C57A" : "#FFFFFF"}
                  opacity={twinkle ? 0.8 : strong ? 0.4 : 0.1}
                  style={
                    twinkle
                      ? {
                          animation: `heroTwinkle ${dur}s ${delay}s ease-in-out infinite`,
                          transformOrigin: "center",
                        }
                      : undefined
                  }
                />
              );
            }),
          )}
        </svg>
      </div>

      {/* 가벼운 격자 패턴 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 flex min-h-[inherit] flex-col">
        <Container>
          <div className="grid grid-cols-1 items-center pt-24 pb-32 md:pt-28 lg:grid-cols-[minmax(0,720px)_1fr] lg:gap-12 lg:pt-32 lg:pb-40">
            <div className="max-w-[720px]">
              <p
                className="eyebrow"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                (주)케이비개발 · SINCE {company.foundedYear}
              </p>

              {/* H1 — 2줄 고정, "됩니다"에 underline-gradient SVG 데코 */}
              <h1
                className="mt-7 font-display text-white"
                style={{
                  fontSize: "clamp(2.5rem, 6.5vw, 5rem)",
                  fontWeight: 900,
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: 1.08,
                  textShadow: "0 6px 24px rgba(0,0,0,0.35)",
                }}
              >
                <span className="block">{SLOGAN_LINE_1}</span>
                <span className="block whitespace-nowrap">
                  {slogan2Idx >= 0 ? (
                    <>
                      {SLOGAN_LINE_2.slice(0, slogan2Idx)}
                      <span className="relative inline-block">
                        <span className="relative z-10">{SLOGAN_HIGHLIGHT}</span>
                        {/* underline-gradient SVG */}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 200 12"
                          preserveAspectRatio="none"
                          className="absolute inset-x-0 -bottom-1 h-[10px] w-full"
                        >
                          <defs>
                            <linearGradient id="ul" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#C9A24B" />
                              <stop offset="100%" stopColor="#FFFFFF" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M2 7 Q 100 1 198 7"
                            stroke="url(#ul)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </>
                  ) : (
                    SLOGAN_LINE_2
                  )}
                </span>
              </h1>

              <p
                className="mt-8 max-w-xl text-[16px] md:text-[17px]"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.75,
                }}
              >
                {SUBTITLE_LINE_1}
                <br />
                {SUBTITLE_LINE_2}
              </p>

              {/* CTA — Primary + Ghost */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  as="link"
                  href={`tel:${contact.phone}`}
                  variant="accent"
                  size="lg"
                >
                  무료 상담 신청
                  <span aria-hidden="true">→</span>
                </Button>
                <Button
                  as="link"
                  href="/business"
                  variant="ghost"
                  size="lg"
                >
                  사업영역 보기
                  <span aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          </div>
        </Container>

        {/* Floating glass card 통계 — 하단 absolute, 다음 섹션과 살짝 겹침 */}
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2">
          <Container>
            <div
              className="rounded-md border border-white/12 px-6 py-6 md:px-10 md:py-7"
              style={{
                backgroundColor: "rgba(11, 26, 51, 0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow:
                  "0 24px 56px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="grid grid-cols-3 gap-4 md:gap-10">
                {FLOATING_STATS.map((s) => (
                  <div key={s.label} className="text-center md:text-left">
                    <div
                      className="font-mono-num text-[26px] font-bold leading-none text-white md:text-[34px]"
                      style={{ letterSpacing: "var(--tracking-tight)" }}
                    >
                      {s.value}
                      <span className="ml-0.5 text-base font-semibold text-accent-500 md:text-xl">
                        {s.suffix}
                      </span>
                    </div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/65 md:text-[12px]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </div>

        {/* Scroll 인디케이터 — 우측 하단 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-32 right-6 z-10 hidden flex-col items-center gap-3 lg:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/55">
            Scroll
          </span>
          <div className="relative h-12 w-[1px] overflow-hidden bg-white/20">
            <span
              className="absolute left-1/2 top-0 h-2 w-[1px] -translate-x-1/2 bg-accent-500"
              style={{
                animation: "scrollDot 1.8s var(--ease) infinite",
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollDot {
          0% {
            top: -20%;
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
