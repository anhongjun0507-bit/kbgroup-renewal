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
              className="font-display text-[18px] italic leading-none text-accent md:text-[20px]"
            >
              Our Cases
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-4 text-[32px] font-bold tracking-[-0.022em] text-ink-strong md:text-[44px]"
            >
              전국 단지의 발자취
            </motion.h2>
          </div>
          <motion.div variants={item} className="hidden md:block">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-strong transition-colors duration-300 hover:text-accent"
            >
              View All Cases
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
            return (
              <motion.article
                key={`${c.name}-${idx}`}
                variants={item}
                className="group bg-white"
              >
                <Link href="/cases" className="block">
                  {/* 다크 시네마틱 placeholder */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1a2347] via-primary to-[#0a0f24]">
                    {c.type === "LH" && (
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        LH
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-end p-6">
                      <p className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-[0.95] tracking-[-0.02em] text-white/30 transition-colors duration-500 group-hover:text-white/50">
                        {displayName}
                      </p>
                    </div>
                    {/* hover 빨강 좌측 라인 */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                      {c.region}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.25rem] text-[15px] font-bold leading-snug tracking-[-0.022em] text-ink-strong transition-colors duration-300 group-hover:text-accent">
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
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-strong"
          >
            View All Cases <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
