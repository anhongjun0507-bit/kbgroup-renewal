"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// 사용자 가이드: 데이터 없는 항목은 가짜값 만들지 말고 항목 자체 생략
// - 우편번호: 없음 → 표시 X
// - 영업시간: 없음 → 표시 X (가짜 시간 X)

const CONTACT_ROWS: {
  label: string;
  value: string;
  href: string | null;
}[] = [
  { label: "TEL", value: contact.phone, href: `tel:${contact.phone}` },
  { label: "FAX", value: contact.fax, href: null },
  { label: "EMAIL", value: contact.email, href: `mailto:${contact.email}` },
];

export function LocationInfo() {
  const shouldReduce = useReducedMotion() ?? false;

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.15 } },
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
      className="bg-beige py-24 md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20"
        >
          {/* Left — address + contact */}
          <motion.div variants={itemVariants}>
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              ADDRESS
            </p>
            <h2 className="mt-6 font-serif text-2xl font-bold leading-[1.3] tracking-[-0.02em] text-ink md:text-3xl lg:text-4xl">
              {contact.address}
            </h2>

            <ul className="mt-12">
              {CONTACT_ROWS.map((row, idx) => (
                <li
                  key={row.label}
                  className={
                    idx === CONTACT_ROWS.length - 1
                      ? "grid grid-cols-12 items-baseline gap-4 border-t border-line/40 border-b py-5"
                      : "grid grid-cols-12 items-baseline gap-4 border-t border-line/40 py-5"
                  }
                >
                  <span className="col-span-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted sm:col-span-2">
                    {row.label}
                  </span>
                  <span className="col-span-9 text-base text-ink sm:col-span-10">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="transition-colors duration-200 hover:text-primary"
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

          {/* Right — directions */}
          <motion.div variants={itemVariants}>
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              DIRECTIONS
            </p>
            <h2
              id="location-info-heading"
              className="mt-6 font-serif text-2xl font-bold leading-[1.3] tracking-[-0.02em] text-ink md:text-3xl"
            >
              <span className="serif-em">편리한</span> 교통
            </h2>

            <div className="mt-12 space-y-10">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">
                  BY PUBLIC TRANSIT
                </p>
                <h3 className="mt-2 font-serif text-lg font-bold text-ink">
                  대중교통
                </h3>
                <p className="mt-3 text-base leading-[1.75] text-ink-soft">
                  인근 정류장: {contact.nearestStops.join(", ")}
                </p>
                <p className="mt-1 text-sm leading-[1.75] text-ink-soft">
                  주요 노선: {contact.busRoutes.join(" · ")}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">
                  BY CAR
                </p>
                <h3 className="mt-2 font-serif text-lg font-bold text-ink">
                  자가용
                </h3>
                <p className="mt-3 text-base leading-[1.75] text-ink-soft">
                  {contact.parking}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
