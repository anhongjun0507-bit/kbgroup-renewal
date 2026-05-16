"use client";

import { Container, Button } from "@/components/ui";
import { company, contact } from "@/data/site-content";

/* Phase 3.A — Hero 전면 재구성
   배경: 135deg navy 그라데이션 + mesh radial 3blend + 우측 placeholder visual
   좌측: max-w 720 / "신뢰가" / "자산이 됩니다" 2줄 + underline-gradient SVG
   CTA: Primary(무료 상담) + Ghost(사업영역 보기)
   하단 floating glass card 통계 / 우측 하단 Scroll 인디케이터 */

const SLOGAN_LINE_1 = "신뢰가";
const SLOGAN_LINE_2 = "자산이 됩니다";
/* Phase 11 P0-D — H1 강조를 어말 어미("됩니다") → 의미 키워드("자산")로 이동.
   "신뢰"는 골드 컬러로 추가 강조해 의미 위계(신뢰=가치 / 자산=결과) 명확화 */
const SLOGAN_LINE_1_HIGHLIGHT = "신뢰";
const SLOGAN_HIGHLIGHT = "자산";
const SUBTITLE_LINE_1 = "대한민국 시설관리의 새로운 표준을 만들어갑니다.";
const SUBTITLE_LINE_2 = "오랜 신뢰가 지금의 케이비개발을 만들었습니다.";

/* Phase 12 — FLOATING_STATS 제거 (Hero floating card 폐기).
   동일 정보는 다음 DataCounter 섹션이 4-카드로 노출 */

export function Hero() {
  const slogan1Idx = SLOGAN_LINE_1.indexOf(SLOGAN_LINE_1_HIGHLIGHT);
  const slogan2Idx = SLOGAN_LINE_2.indexOf(SLOGAN_HIGHLIGHT);

  return (
    /* Phase 12 P0 — overflow-hidden을 section에서 제거.
       배경 레이어 4종(그라데이션·mesh·빌딩·격자)만 wrapper로 묶어 클리핑.
       카드는 자유롭게 hero 하단 밖으로 튀어나옴 (translate-y-1/2 정상 작동) */
    <section
      aria-label="히어로"
      data-surface="dark"
      className="relative isolate bg-navy-900 text-white"
      style={{ minHeight: "min(820px, 92svh)" }}
    >
      {/* 배경 클리핑 영역 — 배경 4종만 overflow-hidden */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 overflow-hidden"
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

          {/* Phase 11 P1-C — 빌딩 옥상 디테일 (안테나·물탱크) — 단지 임을 명확화 */}
          <g stroke="#E3C57A" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round">
            {/* 안테나 (가장 높은 빌딩 위) */}
            <path d="M385 160 L385 130" />
            <path d="M380 138 L390 138" />
            <path d="M382 145 L388 145" />
            {/* 물탱크 (실루엣) */}
            <ellipse cx="180" cy="195" rx="14" ry="4" fill="#E3C57A" fillOpacity="0.3" />
            <path d="M166 195 L166 205 L194 205 L194 195" />
          </g>
        </svg>

        {/* Phase 11 P1-C — 시설관리 픽토그램 floating (메타포 명확화)
            보안(실드) / 청소(빗자루) / 관리(공구) / 점검(체크) 4종 */}
        <svg
          viewBox="0 0 600 700"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="xMaxYMid meet"
          aria-hidden="true"
        >
          <g stroke="#E3C57A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45">
            {/* 보안 실드 — 좌상단 */}
            <g transform="translate(60, 100)">
              <path d="M0 0 L0 22 C0 32, 12 38, 16 40 C20 38, 32 32, 32 22 L32 0 L16 -6 Z" />
              <path d="M10 18 L14 24 L24 12" />
            </g>
            {/* 청소 브러시 — 우상단 */}
            <g transform="translate(490, 130)">
              <rect x="0" y="0" width="40" height="10" />
              <path d="M3 10 V20 M11 10 V22 M19 10 V20 M27 10 V22 M35 10 V20" />
              <path d="M0 0 L-12 -10" />
            </g>
            {/* 시설 관리 공구 (스패너) — 좌하단 */}
            <g transform="translate(40, 540)">
              <circle cx="8" cy="8" r="6" />
              <path d="M14 14 L38 38" />
              <path d="M34 34 a8 8 0 1 0 10 10" />
            </g>
            {/* 안전 점검 (체크 in 원) — 우하단 */}
            <g transform="translate(470, 540)">
              <circle cx="20" cy="20" r="18" />
              <path d="M12 20 L18 26 L30 14" />
            </g>
          </g>
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
      </div>
      {/* /배경 클리핑 영역 끝 */}

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

              {/* Phase 11 P0-D — 의미 키워드 강조
                  line1: "신뢰" 골드 컬러 / line2: "자산" 밑줄 gradient */}
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
                <span className="block">
                  {slogan1Idx >= 0 ? (
                    <>
                      {SLOGAN_LINE_1.slice(0, slogan1Idx)}
                      <span className="text-accent-300">
                        {SLOGAN_LINE_1_HIGHLIGHT}
                      </span>
                      {SLOGAN_LINE_1.slice(
                        slogan1Idx + SLOGAN_LINE_1_HIGHLIGHT.length,
                      )}
                    </>
                  ) : (
                    SLOGAN_LINE_1
                  )}
                </span>
                <span className="block whitespace-nowrap">
                  {slogan2Idx >= 0 ? (
                    <>
                      {SLOGAN_LINE_2.slice(0, slogan2Idx)}
                      <span className="relative inline-block">
                        <span className="relative z-10">{SLOGAN_HIGHLIGHT}</span>
                        {/* underline-gradient SVG — 골드 → 골드 페이드 */}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 200 12"
                          preserveAspectRatio="none"
                          className="absolute inset-x-0 -bottom-1 h-[10px] w-full"
                        >
                          <defs>
                            <linearGradient id="ul" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#C9A24B" />
                              <stop offset="100%" stopColor="#E3C57A" />
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
                      {SLOGAN_LINE_2.slice(slogan2Idx + SLOGAN_HIGHLIGHT.length)}
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

        {/* Phase 12 — floating glass card 제거. DataCounter 섹션이 동일 정보 노출 */}

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
