"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Container } from "@/components/ui";
import { complexes, type Complex } from "@/data/site-content";
import {
  CasesFilter,
  type CasesFilterValue,
} from "./CasesFilter";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function isLh(complex: Complex): boolean {
  return complex.name.startsWith("LH");
}

export function CasesGallery() {
  const shouldReduce = useReducedMotion() ?? false;
  const [filter, setFilter] = useState<CasesFilterValue>("ALL");

  const counts = useMemo<Record<CasesFilterValue, number>>(() => {
    const lh = complexes.filter(isLh).length;
    return {
      ALL: complexes.length,
      LH: lh,
      민간: complexes.length - lh,
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return complexes;
    if (filter === "LH") return complexes.filter(isLh);
    return complexes.filter((c) => !isLh(c));
  }, [filter]);

  return (
    <>
      <CasesFilter current={filter} onChange={setFilter} counts={counts} />

      <section
        aria-labelledby="cases-gallery-heading"
        className="bg-cream pb-32 pt-12 md:pb-40 md:pt-16"
      >
        <Container>
          <motion.ul
            layout
            className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((complex) => (
                <motion.li
                  key={complex.name}
                  layout
                  initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduce ? 0 : -16 }}
                  transition={{
                    duration: shouldReduce ? 0 : 0.5,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <CaseCard complex={complex} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-base text-ink-soft">
              해당 조건에 맞는 단지가 없습니다.
            </p>
          )}
        </Container>

        <span id="cases-gallery-heading" className="sr-only">
          관리 단지 갤러리
        </span>
      </section>
    </>
  );
}

function CaseCard({ complex }: { complex: Complex }) {
  const lh = isLh(complex);
  const typeLabel = lh ? "LH 발주" : "민간";
  const meta = [complex.region, typeLabel].filter(Boolean).join(" · ");

  return (
    <article className="group">
      <Link href="#" className="block" aria-label={`${complex.name} 상세보기`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-beige to-line/40">
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <span className="absolute inset-0 flex items-center justify-center px-8 text-center font-serif text-base italic text-ink-muted md:text-lg">
              {complex.name}
            </span>
          </div>
          <span className="absolute right-5 top-5 text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
            {typeLabel}
          </span>
        </div>
        <div className="mt-6">
          <h3 className="font-serif text-lg font-bold leading-tight tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-primary md:text-xl">
            {complex.name}
          </h3>
          <p className="mt-2 text-sm text-ink-soft">{meta}</p>
        </div>
      </Link>
    </article>
  );
}
