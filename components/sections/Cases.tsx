"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { complexes } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Cases() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  const featured = complexes.slice(0, 8);

  return (
    <section className="bg-white py-20 md:py-24 lg:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduce ? 0 : 0.08 },
            },
          }}
          className="mb-12 flex flex-col items-start gap-6 md:mb-16 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <motion.div
              variants={item}
              className="inline-flex items-center rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent"
            >
              CASES · 관리 단지
            </motion.div>
            <motion.h2
              variants={item}
              className="mt-4 text-3xl font-bold tracking-tight text-ink-strong md:text-[40px]"
            >
              전국 단지에서<br className="hidden md:block" />
              <span className="text-primary"> 함께해온 발자취</span>
            </motion.h2>
          </div>
          <motion.div variants={item} className="hidden md:block">
            <Button as="link" href="/cases" variant="ghost" size="md">
              실적 전체 보기 <span aria-hidden="true">→</span>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduce ? 0 : 0.05 },
            },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featured.map((c, idx) => (
            <motion.article
              key={`${c.name}-${idx}`}
              variants={item}
              className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* 이미지 placeholder — 추후 단지 사진 교체 */}
              <div
                className={`relative aspect-[4/3] overflow-hidden ${
                  c.type === "LH"
                    ? "bg-gradient-to-br from-primary/10 via-primary-soft to-secondary/5"
                    : "bg-gradient-to-br from-bg-soft via-secondary-soft to-bg-tinted"
                }`}
              >
                {c.type === "LH" && (
                  <span className="absolute right-3 top-3 inline-flex items-center rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    LH
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center text-xs text-ink-faint">
                  Image · 추후 교체
                </span>
              </div>

              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {c.region}
                </p>
                <h3 className="mt-2 line-clamp-2 min-h-[3rem] text-base font-bold leading-snug tracking-tight text-ink-strong">
                  {c.name}
                </h3>
                {c.client && (
                  <p className="mt-2 truncate text-xs font-medium text-ink">
                    {c.client}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/cases"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            실적 전체 보기 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
