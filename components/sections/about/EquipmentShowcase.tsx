"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { cn } from "@/lib/cn";

/* Phase 8 — 장비 보유 현황 (PDF p18~20)
   39종 보유 / 법정장비 7종 / 표 이미지 2장 라이트박스 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const EQUIPMENT_STATS = [
  { label: "보유 장비", value: "39", suffix: "종" },
  { label: "법정 장비", value: "7", suffix: "종" },
  { label: "안전·방호 장비", value: "12", suffix: "종" },
  { label: "측정·점검 장비", value: "15", suffix: "종" },
];

/* Phase 14-K K-2 — ⚖️ 이모지 → 구조화 데이터. 렌더에서 SVG 배지로 표시 */
type Equipment = { name: string; legal?: boolean };
const HIGHLIGHT_EQUIPMENT: Equipment[] = [
  { name: "디지털 조도계 LX-1330B" },
  { name: "휴대용 연막기 D.Y.FORGGER 130형", legal: true },
  { name: "열화상 카메라 FLIR / TG165" },
  { name: "디지털 클램프테스터 (접지저항계)" },
  { name: "고압세척기 200bar / 18l" },
  { name: "탑승용 청소차량 CLAS-50R · 80R" },
  { name: "압축식 분무기 TH33", legal: true },
  { name: "휴대용 초미립자 살포기", legal: true },
  { name: "디지털 풍속계 KESTREL-1000", legal: true },
  { name: "일산화 측정기 GM8850", legal: true },
  { name: "충전 드라이버드릴 DD-1202L-2" },
  { name: "건축물 안전점검 보유세트" },
];

const TABLE_IMAGES = [
  { src: "/images/equipment/equipment-list-1.jpeg", label: "장비 보유 현황 (1) — 1~20번" },
  { src: "/images/equipment/equipment-list-2.png", label: "장비 보유 현황 (2) — 21~39번" },
];

export function EquipmentShowcase() {
  const shouldReduce = useReducedMotion() ?? false;
  const [lightbox, setLightbox] = useState<number | null>(null);

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
      aria-labelledby="equipment-showcase-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <Heading
            kicker="EQUIPMENT"
            title="장비 보유 현황"
            italicWord="장비"
            subtitle="시설관리·청소·방역·전기점검·안전점검 전 분야 39종 보유. 법정 의무 장비 7종을 포함합니다."
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        {/* KPI 4종 */}
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {EQUIPMENT_STATS.map((s) => (
            <li
              key={s.label}
              className="relative rounded-md border border-line bg-white p-7 pl-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <span aria-hidden="true" className="absolute left-0 top-0 h-full w-1 bg-navy-700" />
              <p className="flex items-baseline gap-1">
                <span className="number-display font-mono-num text-[40px] font-extrabold text-navy-800 md:text-[44px]">
                  {s.value}
                </span>
                <span className="text-[14px] font-semibold text-accent-ink">{s.suffix}</span>
              </p>
              <p className="mt-3 text-[14px] font-semibold text-ink-strong">{s.label}</p>
            </li>
          ))}
        </ul>

        {/* 핵심 장비 + PDF 표 이미지 */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">KEY EQUIPMENT</p>
            <h3 className="mt-3 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[26px]">
              주요 보유 장비
            </h3>
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-faint">
              <span
                aria-hidden="true"
                className="inline-flex h-4 items-center rounded-sm bg-accent-500/15 px-1.5 font-mono-num text-[9px] font-bold uppercase tracking-[0.1em] text-accent-deep"
              >
                LAW
              </span>
              표시 = 법정 의무 장비
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {HIGHLIGHT_EQUIPMENT.map((e) => (
                <li
                  key={e.name}
                  className="flex items-start gap-2 text-[14px] leading-[1.6] text-ink-muted"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 bg-accent-500"
                  />
                  <span className="flex-1">
                    {e.name}
                    {e.legal && (
                      <span
                        aria-label="법정 의무 장비"
                        className="ml-1.5 inline-flex h-4 items-center rounded-sm bg-accent-500/15 px-1.5 align-[1px] font-mono-num text-[9px] font-bold uppercase tracking-[0.1em] text-accent-deep"
                      >
                        LAW
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 표 이미지 라이트박스 */}
          <div>
            <p className="eyebrow">FULL LIST</p>
            <h3 className="mt-3 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[26px]">
              장비 보유 현황 전체 목록
            </h3>
            <p className="mt-3 text-[14px] text-ink-muted">
              PDF 회사소개서 기준 39종 장비 일람표. 표 클릭 시 확대보기.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {TABLE_IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="group block overflow-hidden rounded-sm border border-line bg-gray-50 transition-all duration-200 hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
                  aria-label={img.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.label}
                    className="block aspect-[3/4] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <p className="border-t border-line bg-white px-3 py-2 text-[12px] font-medium text-ink-strong">
                    {img.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* 라이트박스 */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={TABLE_IMAGES[lightbox].label}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/85 p-5 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className={cn(
              "relative max-h-[90vh] max-w-3xl overflow-auto rounded-md bg-white",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="닫기"
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-white/95 text-ink-strong transition-colors hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TABLE_IMAGES[lightbox].src}
              alt={TABLE_IMAGES[lightbox].label}
              className="block h-auto w-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
