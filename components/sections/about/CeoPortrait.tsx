"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { ceoMessage } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const QUOTE_LINE_1 = "공정하고 투명한 관리가 되도록";
const QUOTE_LINE_2 = "최선을 다하겠습니다";

export function CeoPortrait() {
  const shouldReduce = useReducedMotion() ?? false;

  const stagger: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.15 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT },
    },
  };

  return (
    <section
      aria-labelledby="ceo-portrait-heading"
      className="bg-white py-24 md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16"
        >
          {/* Portrait — Phase 14-L (2026-05-18) 실사 프로필 사진(1075×1464) 적용.
              navy → 사진 우측 하단 그라데이션으로 자연스럽게 페이드.
              좌측 골드 라인·CEO 라벨·하단 캡션은 디자인 일관성 유지를 위해 그대로 유지. */}
          <motion.div variants={item} className="lg:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden bg-navy-900">
              <Image
                src="/images/company/ceo-portrait.png"
                alt={`${ceoMessage.authorName} ${ceoMessage.authorTitle} 공식 프로필 사진`}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-top"
              />
              {/* 가독성 확보용 하단 그라데이션 */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3"
                style={{
                  background:
                    "linear-gradient(to top, rgba(11,26,51,0.78) 0%, rgba(11,26,51,0) 100%)",
                }}
              />
              {/* 골드 좌측 라인 */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 z-10 w-[3px] bg-accent-500"
              />
              {/* CEO 라벨 */}
              <span className="absolute left-5 top-5 z-10 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-strong">
                CEO
              </span>
              {/* 이름 + 직함 */}
              <div className="absolute inset-x-5 bottom-5 z-10 text-white">
                <p className="font-display text-[20px] font-bold tracking-tight md:text-[22px]">
                  {ceoMessage.authorName}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-300">
                  {ceoMessage.authorTitle}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quote + signature */}
          <motion.div
            variants={item}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <p className="eyebrow">CEO MESSAGE</p>
            <blockquote
              id="ceo-portrait-heading"
              className="mt-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "var(--tracking-tight)",
                lineHeight: 1.25,
                color: "var(--color-ink-strong)",
              }}
            >
              <span className="block">{QUOTE_LINE_1}</span>
              <span className="block">
                <span className="text-primary">{QUOTE_LINE_2}</span>
              </span>
            </blockquote>

            <div className="mt-10 flex items-center gap-5">
              <div aria-hidden="true" className="h-px w-12 bg-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {ceoMessage.authorTitle}
                </p>
                <p className="mt-1 text-xl font-bold tracking-tight text-ink-strong md:text-2xl">
                  {ceoMessage.authorName}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
