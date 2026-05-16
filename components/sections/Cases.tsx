"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";

/* Phase 3.D — CASES
   - placeholder 업그레이드: 그라데이션 + 단지 이니셜 로고 SVG + 좌상단 배지 + 우하단 위치 마커
   - 카드 4:5 비율
   - hover: ken-burns scale 1.03 + 어두운 오버레이 0.4→0.2
   - "관리현황 전체" chip 형태로 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** 단지별 미세 hue 변화로 placeholder 식별성 부여 */
const HUES = [0, 14, -10, 22, -16, 6, 28, -22];

function getInitial(name: string): string {
  const noLh = name.replace(/^LH\s+/, "").trim();
  const tokens = noLh.split(/\s+/).filter(Boolean);
  const target = tokens[tokens.length - 1] ?? noLh;
  const ch = target.charAt(0);
  return ch || "K";
}

function badgeStyle(type?: Complex["type"]) {
  if (type === "LH") return "bg-accent-500 text-white";
  if (type === "민간") return "bg-navy-800 text-white";
  if (type === "공공") return "bg-navy-700 text-white";
  return "bg-white/85 text-ink-strong";
}

export function Cases() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  const featured = complexes.slice(0, 8);

  return (
    <section className="section bg-white">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-14 flex flex-col items-start gap-6 md:mb-20 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <motion.p variants={item} className="eyebrow">
              CASES
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-4 font-extrabold tracking-tight text-ink-strong"
            >
              전국 단지의 <span className="accent-em">발자취</span>
            </motion.h2>
          </div>
          {/* chip 형태 CTA */}
          <motion.div variants={item} className="hidden md:block">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-2 rounded-sm border border-ink-strong px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
            >
              관리현황 전체
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
          }}
          className="cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featured.map((c, idx) => {
            const initial = getInitial(c.name);
            const hue = HUES[idx % HUES.length];
            const badge = c.type ?? "민간";
            return (
              <motion.article
                key={`${c.name}-${idx}`}
                variants={item}
                className="group overflow-hidden rounded-md border border-line bg-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <Link href="/cases" className="block">
                  {/* 4:5 placeholder */}
                  <div
                    className="relative aspect-[4/5] overflow-hidden bg-navy-900"
                    style={{ filter: `hue-rotate(${hue}deg)` }}
                  >
                    {/* 베이스 그라데이션 */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #15203F 0%, #1E2C56 50%, #0E1733 100%)",
                      }}
                    />
                    {/* radial accent — ken-burns scale 1.03 */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 origin-center transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.03]"
                      style={{
                        background:
                          "radial-gradient(60% 60% at 30% 30%, rgba(230,57,80,0.18) 0%, transparent 70%)",
                      }}
                    />

                    {/* 어두운 오버레이 0.4 → 0.2 */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-navy-900/40 transition-opacity duration-500 group-hover:bg-navy-900/20"
                    />

                    {/* 좌상단 배지 */}
                    <span
                      className={
                        "absolute left-3 top-3 z-10 inline-flex items-center rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] " +
                        badgeStyle(badge)
                      }
                    >
                      {badge}
                    </span>

                    {/* 우하단 위치 마커 */}
                    <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-white/10 px-2 py-1 text-[10px] font-medium text-white/85 backdrop-blur-sm">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M8 1.5C5.2 1.5 3 3.7 3 6.5C3 10 8 14.5 8 14.5S13 10 13 6.5C13 3.7 10.8 1.5 8 1.5Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <circle cx="8" cy="6.5" r="1.5" fill="currentColor" />
                      </svg>
                      {c.region}
                    </div>

                    {/* 중앙 이니셜 워터마크 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        aria-hidden="true"
                        className="font-display text-[clamp(5rem,12vw,9rem)] font-black leading-none text-white/15 transition-colors duration-500 group-hover:text-white/30"
                        style={{ letterSpacing: "var(--tracking-tighter)" }}
                      >
                        {initial}
                      </span>
                    </div>

                    {/* 좌측 accent 라인 */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent-500 transition-transform duration-500 group-hover:scale-y-100"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint">
                      {c.region}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.25rem] text-[15px] font-bold leading-snug tracking-tight text-ink-strong transition-colors duration-300 group-hover:text-accent-500">
                      {c.name}
                    </h3>
                    {c.client && (
                      <p className="mt-3 truncate text-[12px] text-ink-muted">
                        {c.client}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 rounded-sm border border-ink-strong px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-strong"
          >
            관리현황 전체 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
