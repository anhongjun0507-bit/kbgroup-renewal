"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { licenses, type License } from "@/data/site-content";
import { cn } from "@/lib/cn";

/* Phase 4.H.3 — 보유 인허가 그리드
   각 라이선스 카드 + "증명서 보기" 라이트박스 placeholder (실 사진 없음) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function LicensesGrid() {
  const shouldReduce = useReducedMotion() ?? false;
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  const current = lightboxIdx != null ? licenses[lightboxIdx] : null;

  return (
    <section
      aria-labelledby="licenses-grid-heading"
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
            kicker="LICENSES"
            title="보유 인허가"
            italicWord="인허가"
            subtitle={`법적으로 등록된 ${licenses.length}종의 사업 자격`}
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
        >
          {licenses.map((license, i) => (
            <LicenseRow
              key={license.name}
              license={license}
              index={i}
              variants={itemVariants}
              onView={() => setLightboxIdx(i)}
            />
          ))}
        </motion.ul>
      </Container>

      {current && (
        <Lightbox
          license={current}
          index={lightboxIdx ?? 0}
          total={licenses.length}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      <span id="licenses-grid-heading" className="sr-only">
        보유 인허가
      </span>
    </section>
  );
}

function LicenseRow({
  license,
  index,
  variants,
  onView,
}: {
  license: License;
  index: number;
  variants: Variants;
  onView: () => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.li
      variants={variants}
      className="group flex items-start gap-5 rounded-md border border-line bg-white p-6 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
    >
      <span
        aria-hidden="true"
        className="font-mono-num text-[20px] font-bold text-accent-500"
      >
        {num}
      </span>
      <div className="flex-1">
        <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight text-ink-strong md:text-[18px]">
          {license.name}
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px]">
          <span className="text-ink-muted">{license.issuer}</span>
          {license.acquiredAt && (
            <span className="text-ink-faint">취득 {license.acquiredAt}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onView}
        className="ml-auto inline-flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-ink-strong transition-colors duration-200 hover:text-accent-500"
        aria-label={`${license.name} 증명서 보기`}
      >
        증명서
        <span aria-hidden="true">↗</span>
      </button>
    </motion.li>
  );
}

function Lightbox({
  license,
  index,
  total,
  onClose,
}: {
  license: License;
  index: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${license.name} 증명서`}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-5 backdrop-blur-sm",
      )}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-md bg-white p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-strong transition-colors hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        <p className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
          LICENSE {String(index + 1).padStart(2, "0")} / {total}
        </p>
        <h3 className="mt-3 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[26px]">
          {license.name}
        </h3>
        <dl className="mt-5 divide-y divide-line border-y border-line text-[14px]">
          <div className="grid grid-cols-3 gap-4 py-3">
            <dt className="text-ink-faint">발급기관</dt>
            <dd className="col-span-2 text-ink-strong">{license.issuer}</dd>
          </div>
          {license.acquiredAt && (
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-ink-faint">취득일</dt>
              <dd className="col-span-2 text-ink-strong">
                {license.acquiredAt}
              </dd>
            </div>
          )}
        </dl>

        {/* 증명서 사진 placeholder */}
        <div className="mt-6 flex aspect-[4/3] items-center justify-center rounded-sm border border-line bg-gray-50 text-center">
          <div>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#9099A5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <rect x="6" y="8" width="28" height="24" rx="2" />
              <circle cx="14" cy="16" r="3" />
              <path d="M6 26L14 20L22 26L34 18" />
            </svg>
            <p className="mt-3 text-[12px] text-ink-faint">
              증명서 사진은 추후 등록 예정입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
