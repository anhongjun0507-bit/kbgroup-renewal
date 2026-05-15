"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { businessAreas, type BusinessArea } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SECTION_TITLE = "다섯 가지 사업 영역";
const SECTION_ITALIC = "영역";
const SIDE_TEXT = "5 Specialized Fields";

export function ServiceCategories() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0 : 0.8,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <section
      aria-labelledby="services-heading"
      className="bg-beige py-32 md:py-40"
    >
      <Container>
        {/* Header row */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mb-24 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <Heading
            kicker="OUR SERVICES"
            title={SECTION_TITLE}
            italicWord={SECTION_ITALIC}
            align="left"
            size="md"
            as="h2"
          />
          <p className="hidden font-serif text-xl italic text-ink-muted md:block">
            {SIDE_TEXT}
          </p>
        </motion.div>

        {/* Category list */}
        <ul className="border-b border-line">
          {businessAreas.map((area, index) => (
            <CategoryItem
              key={area.id}
              area={area}
              index={index}
              shouldReduce={shouldReduce}
            />
          ))}
        </ul>
      </Container>

      <span id="services-heading" className="sr-only">
        {SECTION_TITLE}
      </span>
    </section>
  );
}

function CategoryItem({
  area,
  index,
  shouldReduce,
}: {
  area: BusinessArea;
  index: number;
  shouldReduce: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.li
      initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: shouldReduce ? 0 : 0.7,
        delay: shouldReduce ? 0 : index * 0.1,
        ease: EASE_OUT_EXPO,
      }}
      className="group border-t border-line transition-colors duration-500 ease-out hover:bg-cream"
    >
      <Link
        href={`/business/${area.slug}`}
        className="grid grid-cols-12 items-start gap-6 py-12 lg:gap-12 lg:py-16"
      >
        {/* Number */}
        <div className="col-span-2 lg:col-span-1">
          <span
            aria-hidden="true"
            className="block font-serif text-3xl font-medium italic leading-none text-primary transition-transform duration-500 ease-out group-hover:translate-x-1 lg:text-4xl"
          >
            {num}
          </span>
        </div>

        {/* Content */}
        <div className="col-span-7 lg:col-span-6">
          <h3 className="font-serif text-2xl font-bold leading-tight tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-primary md:text-3xl lg:text-4xl">
            {area.name}
          </h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
            {area.englishName}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-[1.75] text-ink-soft md:text-base">
            {area.summary}
          </p>
        </div>

        {/* Action */}
        <div className="col-span-3 flex items-center justify-end lg:col-span-5">
          {/* Desktop: VIEW DETAIL + arrow */}
          <span className="hidden items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-ink-muted transition-colors duration-300 group-hover:text-primary lg:inline-flex">
            View Detail
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-2"
            >
              →
            </span>
          </span>
          {/* Mobile: arrow only */}
          <span
            aria-hidden="true"
            className="inline-block text-2xl text-ink-muted transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:text-primary lg:hidden"
          >
            →
          </span>
        </div>
      </Link>
    </motion.li>
  );
}
