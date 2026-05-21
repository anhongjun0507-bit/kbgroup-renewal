"use client";

import Image from "next/image";
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

/* Phase 9 P0-04 — placeholder 톤 통일 (HUES 제거, 단일 navy + 골드 라디얼)
   카드별 다른 hue로 분산되던 톤을 navy-800/navy-900 단일로 통일 */

function getInitial(name: string): string {
  /* P0-04 — 한글 한 글자 → 영문 이니셜 (단지명 영문 첫 글자) */
  const map: Record<string, string> = {
    "광주": "GJ", "운남": "UN", "성남": "SN", "파주": "PJ",
    "계림": "GL", "평택": "PT", "오송": "OS", "의정부": "UJB",
    "고덕": "GD", "첨단": "CD", "수원": "SW", "양주": "YJ",
    "양림": "YR", "의왕": "UW", "문흥": "MH",
  };
  for (const [k, v] of Object.entries(map)) {
    if (name.includes(k)) return v;
  }
  return "KB";
}

function badgeStyle(type?: Complex["type"]) {
  if (type === "LH") return "bg-accent-500 text-navy-900";
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

  /* Phase 14 P0-04 — 메인 카드 노출 정책 변경.
     이전: complexes.slice(0,8) → 지역순 첫 8개 (사진 보유 1건만)
     변경: isFeatured 단지 우선 8개 노출 → 모두 실사 사진 보유, 시각 위계 일관 */
  const featured = complexes.filter((c) => c.isFeatured).slice(0, 8);

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
          {/* Phase 10 P1-11 — 보조 CTA outline pill 통일 */}
          <motion.div variants={item} className="hidden md:block">
            <Link href="/cases" className="group cta-outline">
              관리현황 전체
              <span aria-hidden="true" className="cta-arrow">
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
            const badge = c.type ?? "민간";
            /* Phase 14-D D-2 — 홈 단지 카드를 /cases/[slug] 상세로 직접 연결.
               이전: 모두 /cases 인덱스로 이동해 카드 클릭 의미 없음 */
            const slug = encodeURIComponent(c.name);
            return (
              <motion.article
                key={`${c.name}-${idx}`}
                variants={item}
                className="group overflow-hidden rounded-md border border-line bg-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <Link
                  href={`/cases/${slug}`}
                  className="block"
                  aria-label={`${c.name} 상세보기`}
                >
                  {/* Phase 14 P0-03 — c.image 지정 시 실사 사진 우선, 없으면 기존 그라데이션 + 이니셜 fallback */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                    {c.image ? (
                      <>
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                          priority={idx < 4}
                          className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]"
                        />
                        {/* Phase 14 P0-04 hotfix — placeholder 톤다운 제거. 사진 본연 표현.
                            hover 시에만 살짝 어둡게 (interaction feedback) */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-navy-900/0 transition-colors duration-500 group-hover:bg-navy-900/20"
                        />
                      </>
                    ) : (
                      <>
                        <div
                          aria-hidden="true"
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #0E1F3A 0%, #16315C 50%, #0B1A33 100%)",
                          }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 origin-center transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.03]"
                          style={{
                            background:
                              "radial-gradient(60% 60% at 30% 30%, rgba(201,162,75,0.18) 0%, transparent 70%)",
                          }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-navy-900/40 transition-opacity duration-500 group-hover:bg-navy-900/20"
                        />
                      </>
                    )}

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

                    {/* 중앙 이니셜 워터마크 — 이미지 없을 때만 */}
                    {!c.image && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          aria-hidden="true"
                          className="font-display text-[clamp(5rem,12vw,9rem)] font-black leading-none text-white/15 transition-colors duration-500 group-hover:text-white/30"
                          style={{ letterSpacing: "var(--tracking-tighter)" }}
                        >
                          {initial}
                        </span>
                      </div>
                    )}

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
