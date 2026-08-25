"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { Certification, SettingValue } from "@/lib/content";

/* Phase 4 — CertificationsGrid 톤 정비 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type CertCategory =
  | "시설관리"
  | "안전·소방"
  | "회계·세무"
  | "전문 자격"
  | "환경·기타";

const CATEGORY_COLOR: Record<CertCategory, string> = {
  "시설관리": "#C9A24B",
  "안전·소방": "#0E1F3A",
  "회계·세무": "#6B7380",
  "전문 자격": "#16315C",
  "환경·기타": "#9099A5",
};

function categorizeCert(name: string): CertCategory {
  if (/(전기|승강기|기계설비|건축|토목|열처리|에너지|고압가스|위험물)/.test(name)) return "시설관리";
  if (/소방/.test(name)) return "안전·소방";
  if (/(전산세무|전산회계)/.test(name)) return "회계·세무";
  if (/(주택관리사|공인중개사|경비지도사|수목치료사)/.test(name)) return "전문 자격";
  return "환경·기타";
}

interface Props {
  certifications: SettingValue<"certifications">;
}

export function CertificationsGrid({ certifications }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.04 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="certifications-grid-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="CERTIFICATIONS"
            title="기술 인증서"
            italicWord="인증서"
            subtitle={`${certifications.length}종의 전문 기술 자격`}
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
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {certifications.map((cert) => (
            <CertCard
              key={cert.name}
              cert={cert}
              variants={itemVariants}
            />
          ))}
        </motion.ul>
      </Container>

      <span id="certifications-grid-heading" className="sr-only">
        기술 인증서
      </span>
    </section>
  );
}

function CertCard({
  cert,
  variants,
}: {
  cert: Certification;
  variants: Variants;
}) {
  const category = categorizeCert(cert.name);
  const color = CATEGORY_COLOR[category];
  return (
    <motion.li
      variants={variants}
      className="group rounded-md border border-line bg-white p-7 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
    >
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em]"
        style={{ color }}
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-sm"
          style={{ backgroundColor: color }}
        />
        {category}
      </span>
      <h3 className="mt-4 font-display text-[17px] font-bold leading-tight tracking-tight text-ink-strong md:text-[18px]">
        {cert.name}
      </h3>
      <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <span className="text-[13px] text-ink-muted">{cert.issuer}</span>
        <span className="whitespace-nowrap font-mono-num text-[14px] font-semibold text-ink-strong">
          {cert.count.toLocaleString("en-US")}명
        </span>
      </div>
    </motion.li>
  );
}
