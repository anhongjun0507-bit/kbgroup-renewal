"use client";

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
          {/* Portrait — Phase 14-D D-4: 기존 ceo-portrait.png(107x146)는 해상도 부족으로
              fill 컨테이너에서 흐릿한 실루엣으로 보임. 실사 사진 수급 전까지 명확한
              navy 톤 placeholder(이름 이니셜 + CEO 라벨)로 교체 → '미설정' 인상 제거 */}
          <motion.div variants={item} className="lg:col-span-5">
            <div
              className="relative aspect-[3/4] overflow-hidden bg-navy-900"
              style={{
                background:
                  "linear-gradient(135deg, #0E1F3A 0%, #16315C 60%, #0B1A33 100%)",
              }}
            >
              {/* radial gold accent */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 60% at 30% 30%, rgba(201,162,75,0.22) 0%, transparent 70%)",
                }}
              />
              {/* 골드 좌측 라인 */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] bg-accent-500"
              />
              {/* CEO 라벨 */}
              <span className="absolute left-5 top-5 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-strong">
                CEO
              </span>
              {/* 이름 이니셜 모노그램 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <span
                  aria-hidden="true"
                  className="font-display text-[clamp(6rem,16vw,12rem)] font-black leading-none text-white/12"
                  style={{ letterSpacing: "var(--tracking-tighter)" }}
                >
                  {ceoMessage.authorName.charAt(0)}
                </span>
                <p className="mt-6 font-display text-[20px] font-bold tracking-tight text-white md:text-[22px]">
                  {ceoMessage.authorName}
                </p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-300">
                  {ceoMessage.authorTitle}
                </p>
              </div>
              {/* 하단 보조 라벨 */}
              <p className="absolute inset-x-5 bottom-5 text-center text-[10px] uppercase tracking-[0.14em] text-white/45">
                Official portrait to be updated
              </p>
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
