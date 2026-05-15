"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";
import { cn } from "@/lib/cn";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SECTION_TITLE = "관리하는 공간들";
const SECTION_ITALIC = "공간들";
const SECTION_SUBTITLE =
  "케이비개발이 함께하는 단지들 — 신뢰의 일상이 흐르는 곳입니다.";
const CATEGORY_LABEL = "FACILITY MANAGEMENT · 시설관리";

const FEATURED = complexes.slice(0, 3);

export function Cases() {
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
      aria-labelledby="cases-heading"
      className="bg-cream py-32 md:py-40"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mb-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <Heading
            kicker="OUR PORTFOLIO"
            title={SECTION_TITLE}
            italicWord={SECTION_ITALIC}
            subtitle={SECTION_SUBTITLE}
            align="left"
            size="md"
            as="h2"
          />
          <Link
            href="/cases"
            className="group hidden items-center gap-2 self-end text-sm font-medium uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out hover:text-ink md:inline-flex"
          >
            View All Cases
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </motion.div>

        {/* Asymmetric gallery */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          <CaseCard
            complex={FEATURED[0]}
            index={0}
            variant="big"
            shouldReduce={shouldReduce}
            className="lg:col-span-7"
          />
          <div className="grid grid-cols-1 gap-12 lg:col-span-5 lg:gap-6">
            <CaseCard
              complex={FEATURED[1]}
              index={1}
              variant="small"
              shouldReduce={shouldReduce}
            />
            <CaseCard
              complex={FEATURED[2]}
              index={2}
              variant="small"
              shouldReduce={shouldReduce}
            />
          </div>
        </div>
      </Container>

      <span id="cases-heading" className="sr-only">
        {SECTION_TITLE}
      </span>
    </section>
  );
}

function CaseCard({
  complex,
  index,
  variant,
  shouldReduce,
  className,
}: {
  complex: Complex;
  index: number;
  variant: "big" | "small";
  shouldReduce: boolean;
  className?: string;
}) {
  const isBig = variant === "big";
  const num = String(index + 1).padStart(2, "0");
  const typeLabel = complex.type ? `${complex.type} 발주` : null;
  const meta = [complex.region, typeLabel].filter(Boolean).join(" · ");

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: shouldReduce ? 0 : 0.8,
        delay: shouldReduce ? 0 : index * 0.15,
        ease: EASE_OUT_EXPO,
      }}
      className={cn("group", className)}
    >
      <Link href="/cases" className="block">
        {/* Image area */}
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-beige to-line/40",
            isBig ? "aspect-[4/5]" : "aspect-[4/3]",
          )}
        >
          {/* Scaling inner — placeholder text scales together */}
          <div
            className={cn(
              "absolute inset-0 ease-out",
              shouldReduce
                ? ""
                : "transition-transform duration-700 group-hover:scale-[1.03]",
            )}
          >
            <span className="absolute inset-0 flex items-center justify-center px-10 text-center font-serif italic text-ink-muted text-lg md:text-xl">
              {complex.name}
            </span>
          </div>
          {/* Index badge — does NOT scale */}
          <span
            aria-hidden="true"
            className="absolute right-6 top-6 font-serif text-2xl italic text-primary md:text-3xl"
          >
            {num}
          </span>
        </div>

        {/* Text below image */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
            {CATEGORY_LABEL}
          </p>
          <h3 className="mt-3 font-serif text-xl font-bold leading-tight tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-primary md:text-2xl">
            {complex.name}
          </h3>
          {meta && (
            <p className="mt-2 text-sm text-ink-soft">{meta}</p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
