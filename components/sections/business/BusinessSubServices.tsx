"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { BusinessArea, SettingValue } from "@/lib/content";

/* Phase 4.F.3 — 하위 서비스 그리드 + 작업 갤러리 6장
   Phase 15 — placeholder/라벨 제거 + 사용자 업로드 갤러리 이미지(public/images/can) 매핑 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  area: BusinessArea;
  /** 현장 사진 (어댑터 주입 · PLAN B / DAY 6). 5개 사업영역이 같은 목록을 공유한다. */
  gallery: SettingValue<"businessGallery">;
}

export function BusinessSubServices({ area, gallery }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const { subBusinesses } = area;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby={`sub-${area.id}`}
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="SERVICES IN DETAIL"
            title="구체적인 서비스"
            italicWord="서비스"
            subtitle={area.summary}
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        {/* 작업 갤러리 — 4장 placeholder */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:gap-8"
        >
          {gallery.map(({ src }, idx) => (
            <motion.figure
              key={src}
              variants={itemVariants}
              className="group relative aspect-[3/2] overflow-hidden rounded-md bg-navy-900"
            >
              <Image
                src={src}
                alt={`${area.name} 현장 ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent-500 transition-transform duration-500 group-hover:scale-y-100"
              />
            </motion.figure>
          ))}
        </motion.div>

        {/* 하위 사업 리스트 */}
        {subBusinesses.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {subBusinesses.map((name, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.li
                  key={name}
                  variants={itemVariants}
                  className="group flex items-start gap-4 rounded-md border border-line bg-white p-5 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 font-mono-num text-[22px] font-bold text-accent-ink"
                  >
                    {num}
                  </span>
                  <h3 className="font-display text-[16px] font-bold leading-tight tracking-tight text-ink-strong md:text-[17px]">
                    {name}
                  </h3>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </Container>

      <span id={`sub-${area.id}`} className="sr-only">
        구체적인 서비스
      </span>
    </section>
  );
}
