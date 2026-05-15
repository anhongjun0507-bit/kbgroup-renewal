"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { businessAreas } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function ServiceCategories() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-bg-soft py-24 md:py-32 lg:py-36">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-14 max-w-3xl md:mb-20"
        >
          <motion.p
            variants={item}
            className="font-display text-[18px] italic leading-none text-accent md:text-[20px]"
          >
            Business Strengths
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 text-[32px] font-bold tracking-[-0.022em] text-ink-strong md:text-[44px]"
          >
            한 회사가 책임지는<br className="hidden md:block" /> 종합 시설관리
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-2xl text-base leading-relaxed text-ink md:text-lg"
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
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
          }}
          className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3"
        >
          {businessAreas.map((area, idx) => (
            <motion.article key={area.id} variants={item}>
              <Link
                href={`/business/${area.slug}`}
                className="group relative flex h-full flex-col bg-white p-8 transition-all duration-300 hover:bg-bg-soft lg:p-10"
              >
                {/* 빨강 큰 숫자 — NAI 시각 위계 */}
                <p className="font-display text-[56px] italic leading-none text-accent">
                  {String(idx + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-7 text-[22px] font-bold tracking-[-0.022em] text-ink-strong">
                  {area.name}
                </h3>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                  {area.englishName}
                </p>
                <p className="mt-5 text-[15px] leading-relaxed text-ink">
                  {area.tagline}
                </p>

                {/* highlights 첫 2개 — 불릿 */}
                <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-ink-muted">
                  {area.highlights.slice(0, 2).map((h) => (
                    <li key={h} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 flex-shrink-0 bg-accent" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-strong transition-all duration-300 group-hover:text-accent">
                    Learn More
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </span>
                </div>

                {/* 하단 빨강 라인 (hover) */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
                />
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
