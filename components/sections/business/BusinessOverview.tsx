"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import type { BusinessArea, BusinessCategory } from "@/data/site-content";

/* Phase 4.F.2 — /business/[slug] 핵심 메트릭 3개 (사업별 더미값 — [[data-site-content]] 정책)
   WHY US 3 reasons + 메트릭 3카드 통합 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const METRICS: Record<BusinessCategory, { label: string; value: string; suffix?: string }[]> = {
  /* Phase 14-M (2026-05-20) — 클라 hwpx 요청 반영. 시설관리 09~18, 위생청소 370+, 경비보안 320+/10분. */
  facility: [
    { label: "관리 대응 시간", value: "09~18", suffix: "시" },
    { label: "일평균 점검 건수", value: "180", suffix: "건+" },
    { label: "평균 응답 시간", value: "15", suffix: "분 이내" },
  ],
  sanitation: [
    { label: "전용 청소 인력", value: "370", suffix: "명+" },
    { label: "주간 정밀 청소 회수", value: "3", suffix: "회" },
    { label: "방역 주기", value: "월 2", suffix: "회" },
  ],
  security: [
    { label: "통합 관제 운영", value: "24/7" },
    { label: "근무 인력", value: "320", suffix: "명+" },
    { label: "긴급 대응 시간", value: "10", suffix: "분 이내" },
  ],
  development: [
    { label: "누적 시공 단지", value: "30", suffix: "단지+" },
    { label: "건설업 등록", value: "토목·건축", suffix: "" },
    { label: "하자 대응 기간", value: "2", suffix: "년" },
  ],
  other: [
    { label: "위탁 가능 분야", value: "12", suffix: "종+" },
    { label: "협력사 네트워크", value: "60", suffix: "사+" },
    { label: "맞춤 견적 회신", value: "48", suffix: "시간 내" },
  ],
};

interface Props {
  area: BusinessArea;
}

export function BusinessOverview({ area }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  /* Phase 14-C C-6 — initial opacity 0 → 1 (JS-off/지연 환경 invisible 방지).
     transform y만 미세 이동으로 진입감 유지 */
  const blockVariants: Variants = {
    hidden: { opacity: 1, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 1, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  const metrics = METRICS[area.id];

  return (
    <section
      aria-labelledby={`overview-${area.id}`}
      className="section bg-gray-50"
    >
      <Container>
        {/* WHY US + 3 reasons */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={blockVariants}
            className="lg:col-span-5"
          >
            <div aria-hidden="true" className="mb-6 h-[3px] w-12 bg-accent-500" />
            <p className="eyebrow">WHY US</p>
            <h2
              id={`overview-${area.id}`}
              className="mt-5 font-display text-[28px] font-bold leading-[1.15] tracking-tight text-ink-strong md:text-[36px] lg:text-[44px]"
            >
              {area.name}의 새로운 <span className="accent-em">기준</span>
            </h2>
            <p className="mt-8 text-[16px] leading-[1.75] text-ink-muted md:text-[17px]">
              {area.summary}
            </p>
          </motion.div>

          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="lg:col-span-7"
          >
            {area.reasons.map((reason, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.li
                  key={reason.title}
                  variants={itemVariants}
                  className="grid grid-cols-12 items-start gap-4 border-t border-line py-8 last:border-b md:gap-6"
                >
                  <span
                    aria-hidden="true"
                    className="number-display col-span-2 text-[32px] font-extrabold text-accent-ink md:col-span-1 md:text-[36px]"
                  >
                    {num}
                  </span>
                  <div className="col-span-10 md:col-span-11">
                    <h3 className="font-display text-[20px] font-bold leading-tight tracking-tight text-ink-strong md:text-[24px]">
                      {reason.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.75] text-ink-muted md:text-[16px]">
                      {reason.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* 핵심 메트릭 3개 */}
        {metrics && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="mt-16 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-3 md:gap-6"
          >
            {metrics.map((m) => (
              <motion.div
                key={m.label}
                variants={itemVariants}
                className="group rounded-md border border-line bg-white p-7 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
              >
                <div
                  aria-hidden="true"
                  className="h-[3px] w-6 bg-accent-500 transition-[width] duration-300 [transition-timing-function:var(--ease)] group-hover:w-12"
                />
                <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                  {m.label}
                </p>
                {/* Phase 14-K K-3 — .number-display의 min-width: 5ch로 짧은 숫자
                    우측에 빈 공간 → 단위가 멀리 떨어져 보임. 직접 스타일로 교체. */}
                <p className="mt-3 flex items-baseline gap-1.5 font-display">
                  <span
                    className="tabular font-extrabold leading-none text-navy-800"
                    style={{
                      fontSize: "clamp(2.25rem, 4vw, 3rem)",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.value}
                  </span>
                  {m.suffix && (
                    <span className="whitespace-nowrap text-[16px] font-semibold text-accent-ink">
                      {m.suffix}
                    </span>
                  )}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Container>
    </section>
  );
}
