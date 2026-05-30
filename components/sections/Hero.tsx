"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

/* Phase 15 — Hero 풀스크린 영상+사진 슬라이드 (아모레퍼시픽 톤)
   100svh 풀스크린 / 5장 자동 전환 / crossfade / 좌하단 카피 / 우하단 카운터 / 하단중앙 Scroll 인디케이터 */

type Slide =
  | { type: "video"; src: string; poster: string; alt: string }
  | { type: "image"; src: string; alt: string };

/* 슬라이드 순서: 영상 5개 → 사진 3개 (사용자 피드백: 영상 먼저 다 사용)
   영상은 loop 없이 1회 재생 후 onEnded → 다음 슬라이드 (사용자 피드백: 한 번만 재생)
   사진은 IMAGE_DURATION 후 다음 슬라이드 */
const SLIDES: Slide[] = [
  {
    type: "video",
    src: "/images/hero/video-01.mp4",
    poster: "/images/hero/slide-01.png",
    alt: "케이비개발 시설관리 현장 01",
  },
  {
    type: "video",
    src: "/images/hero/video-02.mp4",
    poster: "/images/hero/slide-02.png",
    alt: "케이비개발 시설관리 현장 02",
  },
  {
    type: "video",
    src: "/images/hero/video-03.mp4",
    poster: "/images/hero/slide-03.png",
    alt: "케이비개발 시설관리 현장 03",
  },
  {
    type: "video",
    src: "/images/hero/video-04.mp4",
    poster: "/images/hero/slide-04.png",
    alt: "케이비개발 시설관리 현장 04",
  },
  {
    type: "video",
    src: "/images/hero/video-05.mp4",
    poster: "/images/hero/slide-05.png",
    alt: "케이비개발 시설관리 현장 05",
  },
  {
    type: "image",
    src: "/images/hero/slide-06.png",
    alt: "주택관리 현장",
  },
  {
    type: "image",
    src: "/images/hero/slide-07.png",
    alt: "위생청소 현장",
  },
  {
    type: "image",
    src: "/images/hero/slide-08.png",
    alt: "경비보안 현장",
  },
];

const IMAGE_DURATION = 6500;
const FADE_DURATION = 2400;
const FADE_EASE = "cubic-bezier(0.45, 0, 0.15, 1)";
/* 영상 끝 N초 전에 다음 슬라이드 페이드인 시작 (FADE_DURATION 만큼 미리 시작해야 정확히 끝 프레임에서 페이드 완료) */
const VIDEO_HANDOFF_LEAD = 1.0;

export function Hero() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const goTo = (i: number) => setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  const goNext = () => goTo(active + 1);

  /* 사진 슬라이드만 타이머로 다음으로 전환 (영상은 onEnded로 전환) */
  useEffect(() => {
    if (reducedMotion) return;
    const slide = SLIDES[active];
    if (slide.type !== "image") return;
    const id = window.setTimeout(() => goNext(), IMAGE_DURATION);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reducedMotion]);

  /* 활성 슬라이드가 video면 처음부터 재생 (1회), 비활성 영상은 pause.
     이미 재생 중이면(첫 mount의 autoPlay) 그대로 둬서 부드러운 시작 보장. */
  useEffect(() => {
    SLIDES.forEach((slide, i) => {
      const el = videoRefs.current[i];
      if (!el || slide.type !== "video") return;
      if (i === active) {
        if (el.paused || el.ended) {
          try {
            el.currentTime = 0;
          } catch {
            /* iOS Safari가 metadata 로딩 전이면 throw — 무시 */
          }
          delete el.dataset.t;
          el.play().catch(() => {});
        }
      } else {
        el.pause();
      }
    });
  }, [active]);

  /* 페이지 진입 직후 모든 영상 사전 로드 (iOS Safari는 preload=auto 무시하므로 load() 강제 호출) */
  useEffect(() => {
    SLIDES.forEach((slide, i) => {
      if (slide.type !== "video") return;
      const el = videoRefs.current[i];
      if (!el) return;
      try {
        el.load();
      } catch {
        /* noop */
      }
    });
  }, []);

  return (
    <section
      aria-label="히어로"
      data-surface="dark"
      className="relative isolate -mt-[88px] w-full overflow-hidden bg-black text-white md:-mt-[100px] lg:-mt-[148px]"
      style={{ height: "100svh", minHeight: 600 }}
    >
      {/* Slide stack */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            className="absolute inset-0"
            style={{
              opacity: i === active ? 1 : 0,
              transition: `opacity ${FADE_DURATION}ms ${FADE_EASE}`,
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            {slide.type === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={slide.src}
                poster={slide.poster}
                autoPlay={i === 0}
                muted
                playsInline
                preload="auto"
                onTimeUpdate={(e) => {
                  if (i !== active) return;
                  const v = e.currentTarget;
                  if (!v.duration || !isFinite(v.duration)) return;
                  /* 끝 N초 전에 다음 슬라이드 페이드인 시작 — 페이드 시간이 영상 끝에서 완료되도록 */
                  if (
                    v.duration - v.currentTime <= VIDEO_HANDOFF_LEAD &&
                    !v.dataset.t
                  ) {
                    v.dataset.t = "1";
                    goNext();
                  }
                }}
                onEnded={() => {
                  if (i === active) goNext();
                }}
                className="h-full w-full object-cover"
                aria-label={slide.alt}
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                quality={85}
                className={`object-cover ${
                  i === active && !reducedMotion ? "hero-kenburns" : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Gradient overlays — 가독성 + 깊이감 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.78) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 55%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Content — Phase 15: 가로·세로 중앙 정렬 (세로는 살짝 위, 약 56% 지점) */}
      <div className="relative z-10 flex h-full flex-col">
        <Container className="flex flex-1 flex-col items-center justify-center pb-32 pt-32 text-center sm:pb-36 sm:pt-36 lg:pb-40 lg:pt-48">
          <div className="mx-auto max-w-3xl">
            <p
              className="hero-anim hero-anim-1 mb-5 text-[11px] font-medium uppercase text-white/85 sm:mb-6 sm:text-[12px]"
              style={{ letterSpacing: "0.32em" }}
            >
              KB GROUP · Facility Management
            </p>

            <h1
              className="font-display text-white"
              style={{
                fontSize: "clamp(1.95rem, 6.6vw, 5.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                textShadow: "0 8px 32px rgba(0,0,0,0.45)",
              }}
            >
              <span className="hero-anim hero-anim-2 block">신뢰가 자산이</span>
              <span className="hero-anim hero-anim-3 block">됩니다</span>
            </h1>

            <p
              className="hero-anim hero-anim-4 mt-6 text-[12px] font-medium uppercase text-accent-300 sm:mt-7 sm:text-[13px]"
              style={{
                letterSpacing: "0.28em",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              Trusted Facility Management Since 2014
            </p>

            <p
              className="mx-auto mt-6 max-w-xl text-[15px] text-white/90 sm:text-base md:text-[17px]"
              style={{
                lineHeight: 1.75,
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
              }}
            >
              <span className="hero-anim hero-anim-5 block">
                대한민국 시설관리의 새로운 표준을 만들어갑니다.
              </span>
              <span className="hero-anim hero-anim-6 block">
                오랜 신뢰가 지금의 케이비개발을 만들었습니다.
              </span>
            </p>

            <div className="hero-anim hero-anim-cta mt-9 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/contact"
                className="btn-reset inline-flex h-[52px] items-center justify-center gap-2 rounded-sm bg-accent-500 px-7 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[0_12px_30px_rgba(201,162,75,0.35)] sm:px-8"
              >
                무료 상담 신청
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/business"
                className="btn-reset inline-flex h-[52px] items-center justify-center gap-2 rounded-sm border border-white/45 bg-white/[0.04] px-7 text-base font-semibold text-white backdrop-blur-sm transition-colors duration-200 [transition-timing-function:var(--ease)] hover:border-white hover:bg-white/12 sm:px-8"
              >
                사업영역 보기
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className="hero-anim hero-anim-tel mt-5 text-[13px] text-white/75">
              <span className="hidden sm:inline">
                바로 통화 ·{" "}
                <a
                  href={`tel:${contact.phone}`}
                  className="btn-reset font-semibold text-accent-300 underline-offset-4 hover:text-white hover:underline"
                >
                  {contact.phone}
                </a>
              </span>
              <a
                href={`tel:${contact.phone}`}
                className="btn-reset font-semibold text-accent-300 underline-offset-4 hover:text-white hover:underline sm:hidden"
              >
                전화 상담 · {contact.phone}
              </a>
            </p>
          </div>
        </Container>

        {/* Slide counter — 우하단 */}
        <div className="absolute bottom-7 right-5 z-20 flex items-center gap-3 text-white/85 sm:bottom-8 sm:right-8 sm:gap-4 lg:right-12">
          <button
            type="button"
            aria-label="이전 슬라이드"
            onClick={() => goTo(active - 1)}
            className="btn-reset hidden h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span className="text-[12px] tabular-nums sm:text-[13px]">
            {String(active + 1).padStart(2, "0")}
          </span>
          <div className="relative h-px w-12 overflow-hidden bg-white/25 sm:w-16">
            <span
              className="absolute inset-y-0 left-0 bg-white"
              style={{
                width: `${((active + 1) / SLIDES.length) * 100}%`,
                transition: "width 700ms var(--ease)",
              }}
            />
          </div>
          <span className="text-[12px] tabular-nums text-white/55 sm:text-[13px]">
            {String(SLIDES.length).padStart(2, "0")}
          </span>

          <button
            type="button"
            aria-label="다음 슬라이드"
            onClick={() => goTo(active + 1)}
            className="btn-reset hidden h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Scroll indicator — 하단 중앙 */}
        <div
          aria-hidden="true"
          className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex"
        >
          <span
            className="text-[10px] font-medium uppercase"
            style={{ letterSpacing: "0.32em" }}
          >
            Scroll
          </span>
          <div className="relative h-10 w-px overflow-hidden bg-white/20">
            <span
              className="absolute left-0 top-0 h-3 w-full bg-white"
              style={{ animation: "heroScrollDot 1.8s var(--ease) infinite" }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroScrollDot {
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

      <style jsx global>{`
        .hero-kenburns {
          animation: heroKenBurns 9s ease-out forwards;
          transform-origin: center;
        }
        @keyframes heroKenBurns {
          0% {
            transform: scale(1.04);
          }
          100% {
            transform: scale(1.14);
          }
        }

        /* Phase 15 — Hero 카피 스태거 등장. 위에서부터 한 줄씩 페이드+슬라이드인 */
        .hero-anim {
          opacity: 0;
          transform: translateY(28px);
          animation: heroLineIn 1000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-play-state: running;
          will-change: opacity, transform;
        }
        .hero-anim-1 { animation-delay: 350ms; }
        .hero-anim-2 { animation-delay: 750ms; }
        .hero-anim-3 { animation-delay: 1100ms; }
        .hero-anim-4 { animation-delay: 1450ms; }
        .hero-anim-5 { animation-delay: 1800ms; }
        .hero-anim-6 { animation-delay: 2100ms; }
        .hero-anim-cta { animation-delay: 2500ms; }
        .hero-anim-tel { animation-delay: 2850ms; }

        @keyframes heroLineIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-kenburns {
            animation: none !important;
          }
          .hero-anim {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
