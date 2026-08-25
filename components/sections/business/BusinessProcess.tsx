"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { SettingValue } from "@/lib/content";
import { cn } from "@/lib/cn";

/* Phase 4.F.6 — OUR PROCESS
   데스크탑: 1행 5열 인디케이터 + 클릭 시 우측 상세 콘텐츠 교체
   모바일: stacking 카드 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface Props {
  processSteps: SettingValue<"processSteps">;
}

export function BusinessProcess({ processSteps }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const [activeIdx, setActiveIdx] = useState(0);
  const active = processSteps[activeIdx];

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="process-heading"
      className="section bg-gray-50"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="OUR PROCESS"
            title="체계적인 진행 과정"
            italicWord="진행 과정"
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        {/* 데스크탑 — 인디케이터(1행 N열) */}
        <div className="hidden lg:block">
          <ol
            role="tablist"
            className="grid border-y border-line"
            style={{
              gridTemplateColumns: `repeat(${processSteps.length}, minmax(0, 1fr))`,
            }}
          >
            {processSteps.map((step, idx) => {
              const isActive = idx === activeIdx;
              const isLast = idx === processSteps.length - 1;
              return (
                <li key={step.key} role="presentation" className="relative">
                  {/* Phase 6 D-3 — 카드 사이 점선 connector */}
                  {!isLast && !isActive && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-1/2 z-10 hidden h-px w-6 -translate-y-1/2 translate-x-1/2 lg:block"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, var(--color-ink-faint) 0 4px, transparent 4px 8px)",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveIdx(idx)}
                    className={cn(
                      "group relative w-full px-5 py-6 text-left transition-colors duration-200 [transition-timing-function:var(--ease)]",
                      isActive ? "bg-navy-800 text-white" : "bg-white text-ink-strong hover:bg-gray-100",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "block font-mono-num text-[28px] font-extrabold leading-none",
                        isActive ? "text-accent-ink" : "text-ink-faint",
                      )}
                    >
                      {step.numberLabel}
                    </span>
                    <span
                      className={cn(
                        "mt-3 block text-[10px] uppercase tracking-[0.18em]",
                        isActive ? "text-white/60" : "text-ink-faint",
                      )}
                    >
                      STEP
                    </span>
                    <span className="mt-2 block font-display text-[18px] font-bold tracking-tight">
                      {step.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* 우측 상세 */}
          <div
            role="tabpanel"
            className="grid grid-cols-12 gap-12 border-x border-b border-line bg-white p-10"
          >
            <div className="col-span-4">
              <span
                aria-hidden="true"
                className="number-display text-[80px] font-extrabold text-accent-ink"
              >
                {active.numberLabel}
              </span>
              <p className="mt-6 text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                {active.englishName}
              </p>
              <h3 className="mt-3 font-display text-[28px] font-bold tracking-tight text-ink-strong">
                {active.name}
              </h3>
            </div>
            <div className="col-span-8">
              <p className="text-[16px] leading-[1.75] text-ink-muted">
                {active.description}
              </p>
            </div>
          </div>
        </div>

        {/* 모바일 — stacking 카드 */}
        <ol className="space-y-3 lg:hidden">
          {processSteps.map((step) => (
            <li
              key={step.key}
              className="rounded-md border border-line bg-white p-6"
            >
              <div className="flex items-baseline gap-4">
                <span
                  aria-hidden="true"
                  className="number-display text-[36px] font-extrabold text-accent-ink"
                >
                  {step.numberLabel}
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {step.englishName}
                  </p>
                  <h3 className="mt-1 font-display text-[20px] font-bold tracking-tight text-ink-strong">
                    {step.name}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-[15px] leading-[1.75] text-ink-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>

      <span id="process-heading" className="sr-only">
        체계적인 진행 과정
      </span>
    </section>
  );
}
