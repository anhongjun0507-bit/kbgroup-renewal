"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { certifications, type Certification } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type CertCategory =
  | "시설관리"
  | "안전·소방"
  | "회계·세무"
  | "전문 자격"
  | "환경·기타";

/**
 * 자격증명 패턴 기반 카테고리 자동 분류.
 * 데이터에는 카테고리 필드 없음 — 컴포넌트에서 derived.
 * 매칭 우선순위: 시설관리(전기/건축 등) → 안전·소방 → 회계·세무 → 전문 자격 → 환경·기타
 */
function categorizeCert(name: string): CertCategory {
  if (
    /(전기|승강기|기계설비|건축|토목|열처리|에너지|고압가스|위험물)/.test(name)
  ) {
    return "시설관리";
  }
  if (/소방/.test(name)) return "안전·소방";
  if (/(전산세무|전산회계)/.test(name)) return "회계·세무";
  if (/(주택관리사|공인중개사|경비지도사|수목치료사)/.test(name)) {
    return "전문 자격";
  }
  return "환경·기타";
}

export function CertificationsGrid() {
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
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="certifications-grid-heading"
      className="bg-cream py-32 md:py-40"
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
            className="mb-16"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
  return (
    <motion.li
      variants={variants}
      className="group border border-line bg-white p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary lg:p-8"
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
        {category}
      </span>
      <h3 className="mt-4 font-serif text-lg font-bold leading-tight tracking-[-0.01em] text-ink">
        {cert.name}
      </h3>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line/60 pt-4">
        <span className="text-sm text-ink-soft">{cert.issuer}</span>
        <span className="whitespace-nowrap text-sm font-medium text-ink">
          {cert.count.toLocaleString("en-US")}명
        </span>
      </div>
    </motion.li>
  );
}
