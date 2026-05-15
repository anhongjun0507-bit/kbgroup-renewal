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
    <section className="bg-bg-soft py-24 md:py-32 lg:py-40">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="mb-16 max-w-3xl md:mb-20"
        >
          <motion.p
            variants={item}
            className="text-[13px] font-medium tracking-wide text-ink"
          >
            BUSINESS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 text-[32px] font-bold tracking-[-0.03em] text-ink-strong md:text-[48px]"
          >
            한 회사가 책임지는<br className="hidden md:block" /> 종합 시설관리
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-base leading-relaxed text-ink md:text-lg"
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        >
          {businessAreas.map((area, idx) => (
            <motion.article
              key={area.id}
              variants={item}
              className="border border-line bg-white"
              style={{
                marginLeft:
                  idx > 0 && idx % 5 !== 0 ? "-1px" : 0,
                marginTop: 0,
              }}
            >
              <Link
                href={`/business/${area.slug}`}
                className="group flex h-full flex-col p-7 transition-colors duration-300 hover:bg-bg-soft lg:p-8"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-muted">
                  0{idx + 1}
                </p>
                <h3 className="mt-4 text-xl font-bold tracking-[-0.03em] text-ink-strong lg:text-[22px]">
                  {area.name}
                </h3>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {area.englishName}
                </p>
                <p className="mt-5 text-[13px] leading-relaxed text-ink lg:text-sm">
                  {area.tagline}
                </p>

                <div className="mt-auto pt-8">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-strong transition-all duration-300 group-hover:text-primary">
                    자세히 보기
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
