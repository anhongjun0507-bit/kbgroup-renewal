"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function getDisplayName(c: Complex): string {
  const name = c.name;
  const maeulMatch = name.match(/(\S+)마을/);
  if (maeulMatch) return maeulMatch[1];
  const brandWords = ["휴먼시아", "IPARK", "센텀", "푸르지오", "자이", "트리플", "루젠트힐"];
  for (const w of brandWords) {
    if (name.includes(w)) return w;
  }
  const tokens = name.split(/\s+/).filter((t) => !["LH", "1단지", "2단지", "3단지", "4단지"].includes(t));
  return tokens[tokens.length - 1] ?? name;
}

/** 단지별 미세 hue 변화 (placeholder 식별성) */
const HUES = [0, 12, -8, 18, -14, 6, 22, -20];

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
    <section className="bg-white py-24 md:py-32 lg:py-36">
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
            <motion.p
              variants={item}
              className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-muted"
            >
              CASES
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-4 font-extrabold tracking-tight text-ink-strong"
              style={{ fontSize: "clamp(2rem, 3.6vw, 2.75rem)" }}
            >
              전국 단지의 <span className="text-primary">발자취</span>
            </motion.h2>
          </div>
          <motion.div variants={item} className="hidden md:block">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-2 border-b border-ink-strong pb-1 text-[14px] font-semibold text-ink-strong transition-colors duration-300 hover:border-primary hover:text-primary"
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
          className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {featured.map((c, idx) => {
            const displayName = getDisplayName(c);
            const hue = HUES[idx % HUES.length];
            return (
              <motion.article
                key={`${c.name}-${idx}`}
                variants={item}
                className="group bg-white"
              >
                <Link href="/cases" className="block">
                  <div
                    className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1a2347] via-primary to-[#0a0f24]"
                    style={{ filter: `hue-rotate(${hue}deg)` }}
                  >
                    {c.type === "LH" && (
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        LH
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-end p-6">
                      <p className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-[0.95] tracking-tight text-white/30 transition-colors duration-500 group-hover:text-white/55">
                        {displayName}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
                      {c.region}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.25rem] text-[15px] font-bold leading-snug tracking-tight text-ink-strong transition-colors duration-300 group-hover:text-primary">
                      {c.name}
                    </h3>
                    {c.client && (
                      <p className="mt-3 truncate text-[11px] text-ink-muted">
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
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-strong"
          >
            관리현황 전체 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
