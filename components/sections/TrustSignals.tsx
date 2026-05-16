"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { licenses, partners } from "@/data/site-content";

/* Phase 12 업그레이드 #7 — 신뢰 시그널 강화 섹션
   인허가 골드 뱃지 6종 + 발주처/시공사 로고 strip
   히어로 직후 위치 — "검증된 회사" 시그널을 첫 인상에서 강화 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* 핵심 인허가 6종 (PDF 9건 중 운영 시각화 임팩트 큰 것) */
const KEY_LICENSES = [
  { name: "주택관리업", issuer: "광산구청", year: "2016", icon: "B" },
  { name: "시설경비업", issuer: "광주지방경찰청", year: "2016", icon: "S" },
  { name: "위생관리용역업", issuer: "광산구청", year: "2016", icon: "C" },
  { name: "소독·방역업", issuer: "광산구청", year: "2018", icon: "D" },
  { name: "저수조청소업", issuer: "광산구청", year: "2018", icon: "W" },
  { name: "ISO 45001 안전보건", issuer: "한국표준협회", year: "2023", icon: "I" },
];

void licenses; // licenses 데이터 직접 사용 안 함 (위 KEY_LICENSES로 핵심만 추출)

export function TrustSignals() {
  const shouldReduce = useReducedMotion() ?? false;

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  /* 발주처/시공사를 client + construction 만 추려 strip 표시 */
  const orgPartners = partners.filter(
    (p) => p.category === "client" || p.category === "construction",
  );

  return (
    <section
      aria-labelledby="trust-signals-heading"
      className="border-y border-line bg-gray-50 py-14 md:py-20"
    >
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <p className="eyebrow">TRUSTED · VERIFIED</p>
          <h2
            id="trust-signals-heading"
            className="font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]"
          >
            <span className="accent-em">9종</span>의 인허가와{" "}
            <span className="accent-em">검증된 발주처</span>가 함께합니다
          </h2>
        </div>

        {/* 인허가 6 뱃지 */}
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {KEY_LICENSES.map((lic) => (
            <motion.li
              key={lic.name}
              variants={itemVariants}
              className="group flex items-center gap-3 rounded-md border border-line bg-white p-4 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-[var(--shadow-card)]"
            >
              {/* 골드 뱃지 — 라운드 인서클 + 글자 */}
              <span
                aria-hidden="true"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono-num text-[14px] font-bold text-navy-900"
                style={{
                  background:
                    "linear-gradient(135deg, #E3C57A 0%, #C9A24B 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                {lic.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-[13px] font-bold text-ink-strong md:text-[14px]">
                  {lic.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-ink-faint">
                  {lic.issuer} · {lic.year}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* 발주처/시공사 strip — 텍스트 로고 grayscale → hover 컬러 */}
        <div className="mt-10 border-t border-line pt-8">
          <p className="eyebrow mb-4 text-center">
            CLIENTS · CONSTRUCTION PARTNERS
          </p>
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={listVariants}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12"
          >
            {orgPartners.map((p) => (
              <motion.li
                key={p.name}
                variants={itemVariants}
                className="group inline-flex items-center text-[14px] font-display font-bold tracking-tight text-ink-faint grayscale transition-all duration-200 hover:grayscale-0 hover:text-ink-strong md:text-[15px]"
              >
                {p.name}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
