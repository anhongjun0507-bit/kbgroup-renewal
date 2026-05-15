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

  /** 5번째 "기타" 카드는 풀폭 배너로 분리 → 4카드 균등 그리드 + 1배너 */
  const mainAreas = businessAreas.slice(0, 4);
  const extraArea = businessAreas[4];

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
            className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-muted"
          >
            BUSINESS
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-4 font-extrabold tracking-tight text-ink-strong"
            style={{ fontSize: "clamp(2rem, 3.6vw, 2.75rem)" }}
          >
            한 회사가 책임지는 <span className="text-primary">종합 시설관리</span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg"
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
          className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {mainAreas.map((area, idx) => (
            <motion.article key={area.id} variants={item}>
              <Link
                href={`/business/${area.slug}`}
                className="group relative flex h-full flex-col overflow-hidden bg-white p-8 transition-colors duration-300 hover:bg-bg-soft lg:p-10"
              >
                {/* 워터마크 번호 — Pretendard 800 outline + opacity 0.08 */}
                <span
                  aria-hidden="true"
                  className="tabular absolute right-6 top-6 text-[88px] font-extrabold leading-none text-primary/[0.06] transition-opacity duration-300 group-hover:text-primary/[0.12]"
                  style={{ letterSpacing: "var(--tracking-tighter)" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
                  {area.englishName}
                </p>
                <h3 className="mt-5 text-[22px] font-bold tracking-tight text-ink-strong">
                  {area.name}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink">
                  {area.tagline}
                </p>

                <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-ink-muted">
                  {area.highlights.slice(0, 2).map((h) => (
                    <li key={h} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2 inline-block h-1 w-1 flex-shrink-0 bg-primary"
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-strong transition-all duration-300 group-hover:text-primary">
                    자세히 보기
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </span>
                </div>

                {/* hover 하단 라인 */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100"
                />
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {/* 5번째 — 풀폭 가로 배너 카드 */}
        {extraArea && (
          <motion.article
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT, delay: 0.2 }}
            className="mt-px border border-line bg-white"
          >
            <Link
              href={`/business/${extraArea.slug}`}
              className="group flex flex-col gap-6 p-8 transition-colors duration-300 hover:bg-bg-soft md:flex-row md:items-center md:justify-between md:gap-10 lg:p-10"
            >
              <div className="flex items-baseline gap-6">
                <span
                  aria-hidden="true"
                  className="tabular text-[44px] font-extrabold leading-none text-primary/30"
                  style={{ letterSpacing: "var(--tracking-tighter)" }}
                >
                  05
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
                    {extraArea.englishName}
                  </p>
                  <h3 className="mt-2 text-[22px] font-bold tracking-tight text-ink-strong">
                    {extraArea.name}
                  </h3>
                  <p className="mt-1 text-[14px] text-ink">
                    {extraArea.tagline}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-strong transition-all duration-300 group-hover:text-primary">
                자세히 보기
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                >
                  →
                </span>
              </span>
            </Link>
          </motion.article>
        )}
      </Container>
    </section>
  );
}
