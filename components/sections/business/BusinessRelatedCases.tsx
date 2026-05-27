"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { Complex } from "@/data/site-content";

/* Phase 4.F.5 — 동일 사업 다른 단지 3개 (Cases 톤 통일) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const HUES = [0, 14, -10];

function getInitial(name: string) {
  const noLh = name.replace(/^LH\s+/, "").trim();
  const tokens = noLh.split(/\s+/).filter(Boolean);
  return (tokens[tokens.length - 1] ?? noLh).charAt(0) || "K";
}

function badgeStyle(type?: Complex["type"]) {
  if (type === "LH") return "bg-accent-500 text-navy-900";
  if (type === "민간") return "bg-navy-800 text-white";
  if (type === "공공") return "bg-navy-700 text-white";
  return "bg-white/85 text-ink-strong";
}

interface Props {
  complexes: Complex[];
}

export function BusinessRelatedCases({ complexes }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="related-cases-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <Heading
            kicker="RELATED CASES"
            title="함께한 현장들"
            italicWord="현장들"
            align="left"
            size="md"
            as="h2"
          />
          <Link
            href="/cases"
            className="group hidden items-center gap-2 self-end rounded-sm border border-ink-strong px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white md:inline-flex"
          >
            View All Cases
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {complexes.map((complex, idx) => (
            <RelatedCard
              key={complex.name}
              complex={complex}
              hue={HUES[idx % HUES.length]}
              shouldReduce={shouldReduce}
              index={idx}
            />
          ))}
        </div>
      </Container>

      <span id="related-cases-heading" className="sr-only">
        함께한 현장들
      </span>
    </section>
  );
}

function RelatedCard({
  complex,
  hue,
  shouldReduce,
  index,
}: {
  complex: Complex;
  hue: number;
  shouldReduce: boolean;
  index: number;
}) {
  const initial = getInitial(complex.name);
  const badge = complex.type ?? "민간";

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.1,
        ease: EASE_OUT_EXPO,
      }}
      className="group overflow-hidden rounded-md border border-line bg-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <Link href="/cases" className="block">
        <div
          className="relative aspect-[4/5] overflow-hidden bg-navy-900"
        >
          {complex.image ? (
            <Image
              src={complex.image}
              alt={complex.name}
              fill
              className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
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
            </>
          )}
          <div className="absolute inset-0 bg-navy-900/40 transition-opacity duration-500 group-hover:bg-navy-900/20" />

          <span
            className={
              "absolute left-3 top-3 z-10 inline-flex items-center rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] " +
              badgeStyle(badge)
            }
          >
            {badge}
          </span>

          {!complex.image && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden="true"
                className="font-display text-[clamp(5rem,12vw,9rem)] font-black leading-none text-white/15 transition-colors duration-500 group-hover:text-white/30"
              >
                {initial}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint">
            {complex.region}
          </p>
          <h3 className="mt-2 font-display text-[16px] font-bold leading-tight tracking-tight text-ink-strong transition-colors duration-300 group-hover:text-accent-500 md:text-[17px]">
            {complex.name}
          </h3>
        </div>
      </Link>
    </motion.article>
  );
}
