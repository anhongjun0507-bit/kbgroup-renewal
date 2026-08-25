"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import type { BusinessCategory, SettingValue } from "@/lib/content";

/* Phase 4.F.1 — /business 인덱스
   5개 사업 alternating 좌우 배치 (SK 에코플랜트 / Apple Business 스타일)
   Phase 15 — 워터마크 숫자/radial accent 제거 + 사용자 업로드 배너 이미지 매핑 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const VISUAL_BG: Record<BusinessCategory, string> = {
  facility:
    "linear-gradient(135deg, #0E1F3A 0%, #16315C 100%)",
  sanitation:
    "linear-gradient(135deg, #16315C 0%, #2C4276 100%)",
  security:
    "linear-gradient(135deg, #0B1A33 0%, #16315C 100%)",
  development:
    "linear-gradient(135deg, #0E1F3A 0%, #B88B3A 200%)",
  other:
    "linear-gradient(135deg, #16315C 0%, #0E1F3A 100%)",
};

const VISUAL_IMAGE: Record<BusinessCategory, string> = {
  facility: "/images/banner/IMG_1484.PNG",
  sanitation: "/images/banner/IMG_1485.PNG",
  security: "/images/banner/IMG_1486.PNG",
  development: "/images/banner/IMG_1487.PNG",
  other: "/images/banner/IMG_1488.PNG",
};

interface Props {
  businessAreas: SettingValue<"businessAreas">;
}

export function BusinessIntroAlternating({ businessAreas }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section className="bg-white">
      <Container>
        <ul className="divide-y divide-line">
          {businessAreas.map((area, idx) => {
            const reverse = idx % 2 === 1;
            return (
              <motion.li
                key={area.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={itemVariants}
                className="py-16 md:py-24 lg:py-28"
              >
                <div
                  className={
                    "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 " +
                    (reverse ? "lg:[&>*:first-child]:order-2" : "")
                  }
                >
                  {/* 비주얼 — 실제 사진 (사용자 업로드 배너) */}
                  <div
                    className="relative aspect-[5/3] overflow-hidden rounded-md"
                    style={{ background: VISUAL_BG[area.id] }}
                  >
                    <Image
                      src={VISUAL_IMAGE[area.id]}
                      alt={area.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>

                  {/* 텍스트 */}
                  <div>
                    <p className="eyebrow">
                      0{idx + 1} · {area.englishName}
                    </p>
                    <h2 className="mt-5 font-display text-[28px] font-extrabold leading-[1.15] tracking-tight text-ink-strong sm:text-[32px] md:text-[44px]">
                      {area.name}
                    </h2>
                    <p className="mt-4 text-[17px] font-semibold text-ink-strong">
                      {area.tagline}
                    </p>
                    <p className="mt-5 text-[16px] leading-[1.75] text-ink-muted">
                      {area.summary}
                    </p>

                    <ul className="mt-6 space-y-2 text-[15px] leading-relaxed text-ink-muted">
                      {area.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-2.5 inline-block h-1.5 w-1.5 flex-shrink-0 bg-accent-500"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/business/${area.slug}`}
                      className="group mt-8 inline-flex items-center gap-2 rounded-sm border border-ink-strong px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
                    >
                      자세히 보기
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
