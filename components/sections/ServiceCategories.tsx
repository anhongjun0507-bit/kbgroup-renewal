"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { businessAreas, type BusinessCategory } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** 각 사업영역의 액센트 컬러 — KB 3색 순환 */
const CATEGORY_ACCENT: Record<BusinessCategory, string> = {
  facility: "bg-primary",
  sanitation: "bg-secondary",
  security: "bg-accent",
  development: "bg-primary",
  other: "bg-secondary",
};

export function ServiceCategories() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-bg-soft py-20 md:py-24 lg:py-32">
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
              className="inline-flex items-center rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary"
            >
              SERVICES · 사업영역
            </motion.div>
            <motion.h2
              variants={item}
              className="mt-4 text-3xl font-bold tracking-tight text-ink-strong md:text-[40px]"
            >
              한 회사가 책임지는<br className="hidden md:block" />
              <span className="text-primary"> 종합 시설관리</span>
            </motion.h2>
          </div>
          <motion.p
            variants={item}
            className="max-w-md text-base text-ink md:text-lg"
          >
            시설관리부터 위생청소·경비보안·시행건설까지, 단지 운영에 필요한
            모든 서비스를 한 곳에서 제공합니다.
          </motion.p>
        </motion.div>

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
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {businessAreas.map((area) => (
            <motion.article key={area.id} variants={item}>
              <Link
                href={`/business/${area.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-line/70 bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:p-8"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${CATEGORY_ACCENT[area.id]}`}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
                    {area.englishName}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-bold tracking-tight text-ink-strong">
                  {area.name}
                </h3>
                <p className="mt-2 text-[15px] font-medium leading-snug text-ink">
                  {area.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink">
                  {area.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {area.subBusinesses.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className="rounded-md bg-bg-soft px-2.5 py-1 text-xs font-medium text-ink"
                    >
                      {sub}
                    </span>
                  ))}
                  {area.subBusinesses.length > 3 && (
                    <span className="rounded-md bg-bg-soft px-2.5 py-1 text-xs font-medium text-ink-muted">
                      +{area.subBusinesses.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                  자세히 보기
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
