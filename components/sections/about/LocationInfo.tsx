"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

/* Phase 4.E.6 — 오시는 길 보조 카드
   상단: ADDRESS + 연락처 (좌) — 그대로
   하단: 대중교통 / 자가용 / 도보 3카드 (라인 아이콘 + hover 카드 정책) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const CONTACT_ROWS: {
  label: string;
  value: string;
  href: string | null;
}[] = [
  { label: "TEL", value: contact.phone, href: `tel:${contact.phone}` },
  { label: "FAX", value: contact.fax, href: null },
  { label: "EMAIL", value: contact.email, href: `mailto:${contact.email}` },
];

const ACCESS_CARDS = [
  {
    key: "transit",
    label: "BY PUBLIC TRANSIT",
    title: "대중교통",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="6" width="20" height="22" rx="3" />
        <path d="M10 22H30" />
        <circle cx="15" cy="26" r="1.5" fill="currentColor" />
        <circle cx="25" cy="26" r="1.5" fill="currentColor" />
        <path d="M14 30L12 34" />
        <path d="M26 30L28 34" />
      </svg>
    ),
    body: (
      <>
        <p>인근 정류장: {contact.nearestStops.join(", ")}</p>
        <p className="mt-2 text-[13px] text-ink-faint">
          주요 노선: {contact.busRoutes.join(" · ")}
        </p>
      </>
    ),
  },
  {
    key: "car",
    label: "BY CAR",
    title: "자가용",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 24L8 16C8.5 14 10 13 12 13H28C30 13 31.5 14 32 16L34 24" />
        <rect x="4" y="24" width="32" height="6" rx="2" />
        <circle cx="11" cy="30" r="2.5" />
        <circle cx="29" cy="30" r="2.5" />
      </svg>
    ),
    body: <p>{contact.parking}</p>,
  },
  {
    key: "walk",
    label: "BY FOOT",
    title: "도보",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="22" cy="9" r="3" />
        <path d="M18 18L22 14L26 18L28 25" />
        <path d="M18 18L14 24L17 30" />
        <path d="M22 22L24 27L20 32" />
        <path d="M14 34L17 30M20 32L25 34" />
      </svg>
    ),
    body: (
      <p>
        지하철·버스 정류장 하차 후 도보 5~7분 거리. 1층 로비에 안내 표지가
        있습니다.
      </p>
    ),
  },
];

export function LocationInfo() {
  const shouldReduce = useReducedMotion() ?? false;

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="location-info-heading"
      className="section bg-gray-50"
    >
      <Container>
        {/* 상단: ADDRESS + 연락처 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <motion.div variants={itemVariants}>
            <div aria-hidden="true" className="mb-6 h-[3px] w-12 bg-accent-500" />
            <p className="eyebrow">ADDRESS</p>
            <h2 className="mt-5 font-display text-[28px] font-bold leading-[1.3] tracking-tight text-ink-strong md:text-[36px]">
              {contact.address}
            </h2>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ul className="divide-y divide-line border-y border-line">
              {CONTACT_ROWS.map((row) => (
                <li
                  key={row.label}
                  className="grid grid-cols-12 items-baseline gap-4 py-5"
                >
                  <span className="col-span-3 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-faint sm:col-span-2">
                    {row.label}
                  </span>
                  <span className="col-span-9 text-[16px] font-semibold text-ink-strong sm:col-span-10">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="transition-colors duration-200 hover:text-accent-500"
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* 하단: 3 access cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {ACCESS_CARDS.map((card) => (
            <motion.div
              key={card.key}
              variants={itemVariants}
              className="group rounded-md border border-line bg-white p-7 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
            >
              <div className="h-10 w-10 text-navy-800 transition-colors duration-200 group-hover:text-accent-500">
                {card.icon}
              </div>
              <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {card.label}
              </p>
              <h3 className="mt-2 font-display text-[22px] font-bold tracking-tight text-ink-strong">
                {card.title}
              </h3>
              <div className="mt-4 text-[15px] leading-[1.75] text-ink-muted">
                {card.body}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      <span id="location-info-heading" className="sr-only">
        오시는 길
      </span>
    </section>
  );
}
