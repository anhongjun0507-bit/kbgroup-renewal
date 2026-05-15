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
          {/* Portrait — 실제 사진 사용 */}
          <motion.div variants={item} className="lg:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden bg-bg-soft">
              <Image
                src="/ceo-portrait.png"
                alt={`${ceoMessage.authorName} ${ceoMessage.authorTitle}`}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
                priority
              />
              {/* KB 빨강 좌측 라인 */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] bg-accent"
              />
              {/* 영문 라벨 */}
              <span className="absolute left-5 top-5 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                CEO
              </span>
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
