"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { complexes } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

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
              className="text-[13px] font-medium tracking-wide text-ink-muted"
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
              className="group inline-flex items-center gap-3 border-b border-ink-strong pb-1 text-[14px] font-medium text-ink-strong transition-colors duration-300 hover:border-primary hover:text-primary"
            >
              관리현황 전체
              <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
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
          {featured.map((c, idx) => (
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
                <div className="relative aspect-[4/3] overflow-hidden bg-bg-soft">
                  {c.type === "LH" && (
                    <span className="absolute right-3 top-3 inline-flex items-center bg-ink-strong px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      LH
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] text-ink-faint">
                    사진 추후 등록
                  </span>
                </div>
                <div className="p-6">
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
          ))}
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
