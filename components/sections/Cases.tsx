"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** 단지명에서 가장 인상적인 단어/이니셜 추출 (사진 자리 typographic placeholder) */
function getDisplayName(c: Complex): string {
  // "LH 파주 운정 물향기마을 1단지" → "물향기"
  // "계림 IPARK SK뷰" → "IPARK"
  // 단순 휴리스틱: 마지막에서 "단지/마을/IPARK/뷰" 같은 핵심 발견
  const name = c.name;
  // "마을" 앞 단어
  const maeulMatch = name.match(/(\S+)마을/);
  if (maeulMatch) return maeulMatch[1];
  // "휴먼시아", "IPARK", "센텀", "푸르지오" 등
  const brandWords = ["휴먼시아", "IPARK", "센텀", "푸르지오", "자이", "트리플", "루젠트힐"];
  for (const w of brandWords) {
    if (name.includes(w)) return w;
  }
  // 첫 의미 단어 (LH/지역명 빼고)
  const tokens = name.split(/\s+/).filter((t) => !["LH", "1단지", "2단지", "3단지", "4단지"].includes(t));
  return tokens[tokens.length - 1] ?? name;
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
    <section className="bg-white py-24 md:py-32 lg:py-40">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-16 flex flex-col items-start gap-6 md:mb-20 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <motion.p
              variants={item}
              className="text-[13px] font-medium tracking-wide text-ink"
            >
              CASES
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-4 text-[32px] font-bold tracking-[-0.03em] text-ink-strong md:text-[48px]"
            >
              전국 단지에서 함께해온 발자취
            </motion.h2>
          </div>
          <motion.div variants={item} className="hidden md:block">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-3 border-b border-ink-strong pb-1 text-[14px] font-medium text-ink-strong transition-all duration-300 hover:border-primary hover:text-primary"
            >
              관리현황 전체
              <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featured.map((c, idx) => {
            const displayName = getDisplayName(c);
            return (
              <motion.article
                key={`${c.name}-${idx}`}
                variants={item}
                className="group border border-line bg-white"
                style={{
                  marginLeft: idx > 0 && idx % 4 !== 0 ? "-1px" : 0,
                  marginTop: idx >= 4 ? "-1px" : 0,
                }}
              >
                <Link href="/cases" className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-bg-soft transition-colors duration-500 group-hover:bg-bg-tinted">
                    {c.type === "LH" && (
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center bg-ink-strong px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        LH
                      </span>
                    )}
                    {/* Typographic placeholder — 단지명 핵심 키워드 */}
                    <div className="absolute inset-0 flex items-end p-6">
                      <p className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink-faint/70 transition-colors duration-500 group-hover:text-ink-muted">
                        {displayName}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-line p-6">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                      {c.region}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] text-[16px] font-bold leading-snug tracking-[-0.02em] text-ink-strong transition-colors duration-300 group-hover:text-primary">
                      {c.name}
                    </h3>
                    {c.client && (
                      <p className="mt-3 truncate text-xs text-ink-muted">
                        {c.client}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-strong"
          >
            관리현황 전체 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
