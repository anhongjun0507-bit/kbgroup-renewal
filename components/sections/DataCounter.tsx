"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { counters } from "@/data/site-content";

/* Phase 3.B — BY THE NUMBERS
   - 카운트 종료 후 색 잔존 버그 fix: 종료 후 navy-800 solid 유지, "+" 만 accent-500
   - 라인 아이콘 4종 (세대/단지/인증/LH)
   - accent bar hover width 24 → 48 expand */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const ICONS: Record<string, React.ReactNode> = {
  households: (
    /* 세대 — 작은 집들 */
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 14L10 9L15 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14V22H14V14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 14L22 9L27 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 14V22H26V14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  complexes: (
    /* 단지 — 큰 건물 */
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 26V12L16 6L27 12V26" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 26H27" strokeLinecap="round" />
      <path d="M11 16H13M11 20H13M19 16H21M19 20H21" strokeLinecap="round" />
    </svg>
  ),
  licenses: (
    /* 인허가 — 인증 마크 */
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 4L20 8L26 8L26 14L30 18L26 22L26 28L20 28L16 32L12 28L6 28L6 22L2 18L6 14L6 8L12 8Z" strokeLinejoin="round" />
      <path d="M11 18L15 22L22 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  lhProjects: (
    /* LH — 공공/계약서 */
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="7" y="4" width="18" height="24" strokeLinejoin="round" />
      <path d="M11 11H21M11 15H21M11 19H17" strokeLinecap="round" />
    </svg>
  ),
};

export function DataCounter() {
  const shouldReduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-10% 0px" },
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    /* Hero floating card가 위에 살짝 겹치므로 상단 pt 추가 */
    <section className="section bg-white" ref={sectionRef}>
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-16 max-w-3xl md:mb-20"
        >
          <motion.p variants={item} className="eyebrow">
            BY THE NUMBERS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 font-extrabold tracking-tight text-ink-strong"
          >
            숫자로 보는 <span className="accent-em">케이비개발</span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-[16px] text-ink"
          >
            2014년 설립 이래 축적해온 운영 성과입니다.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
          }}
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 md:gap-x-10 md:gap-y-12"
        >
          {counters.map((c) => (
            <motion.div
              key={c.key}
              variants={item}
              className="group relative"
            >
              {/* accent bar — hover 시 24 → 48 expand */}
              <div
                aria-hidden="true"
                className="mb-6 h-[3px] w-6 bg-accent-500 transition-[width] duration-300 [transition-timing-function:var(--ease)] group-hover:w-12"
              />

              {/* 라인 아이콘 */}
              <div className="mb-5 h-8 w-8 text-navy-800">
                {ICONS[c.key] ?? null}
              </div>

              <div className="stat-cell flex items-baseline gap-1">
                {shouldReduce ? (
                  <span
                    className="stat-number font-mono-num font-bold leading-none text-navy-800"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                      letterSpacing: "var(--tracking-tight)",
                    }}
                  >
                    {c.value.toLocaleString()}
                  </span>
                ) : inView ? (
                  <CountUp
                    /* Phase 11 P0-C — 0 노출 제거: 70% 진폭에서 시작 */
                    start={Math.round(c.value * 0.7)}
                    end={c.value}
                    duration={Math.max(0.6, 0.6 + Math.log10(Math.max(1, c.value)) * 0.25)}
                    separator=","
                    easingFn={(t, b, c, d) => {
                      const tn = t / d - 1;
                      return c * (tn * tn * tn + 1) + b;
                    }}
                    className="stat-number font-mono-num font-bold leading-none text-navy-800"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                      letterSpacing: "var(--tracking-tight)",
                    }}
                  />
                ) : (
                  /* Phase 11 P0-C — inView 직전 fallback도 최종값 표시 (0 노출 방지) */
                  <span
                    className="stat-number font-mono-num font-bold leading-none text-navy-800"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                      letterSpacing: "var(--tracking-tight)",
                    }}
                  >
                    {c.value.toLocaleString()}
                  </span>
                )}
                {c.suffix && (
                  /* Phase 3.B — "+" 만 accent-500 */
                  <span
                    className="font-mono-num font-bold text-accent-500"
                    style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}
                  >
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="mt-5 text-[15px] font-semibold text-ink-strong">
                {c.label}
              </p>
              {/* Phase 11 P2-D — eyebrow 토큰과 동일 자간/색으로 통일 */}
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-deep">
                {c.caption}
              </p>
              {/* Phase 14 UP-02 — 데이터스토리텔링 컨텍스트 1줄 */}
              {c.context && (
                <p className="mt-3 text-[12px] leading-[1.55] text-ink-faint">
                  {c.context}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
