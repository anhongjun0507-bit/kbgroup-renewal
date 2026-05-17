"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { collaborators } from "@/data/site-content";

/* Phase 7 — PDF p45 협력업체 15개사 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function CollaboratorsTable() {
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
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="collaborators-heading"
      className="section bg-gray-50"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <Heading
            kicker="STRATEGIC COLLABORATORS"
            title="분야별 협력 네트워크"
            italicWord="네트워크"
            subtitle="법률·세무·소방·승강기·전기·인력 등 15개 전문 파트너와 협력해 단지 관리비 절감과 신속한 문제 해결을 함께 만들어 갑니다."
            align="left"
            size="md"
            as="h2"
            className="mb-10"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="overflow-hidden rounded-md border border-line bg-white"
        >
          {/* 헤더 행 — 데스크탑만 */}
          <li className="hidden border-b border-line bg-white px-6 py-3 md:grid md:grid-cols-12 md:gap-4">
            <span className="col-span-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              NO
            </span>
            <span className="col-span-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              상생 분야
            </span>
            <span className="col-span-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              업체명
            </span>
            <span className="col-span-5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              협력 내용
            </span>
          </li>

          {collaborators.map((c, i) => (
            <motion.li
              key={c.name}
              variants={itemVariants}
              className="grid grid-cols-1 gap-y-2 border-t border-line px-6 py-4 transition-colors duration-200 hover:bg-gray-50 md:grid-cols-12 md:gap-4 md:py-5"
            >
              <span className="font-mono-num text-[13px] font-bold text-accent-ink md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-ink-faint md:col-span-3 md:text-[13px]">
                {c.field}
              </span>
              <span className="font-display text-[15px] font-bold tracking-tight text-ink-strong md:col-span-3 md:text-[16px]">
                {c.name}
              </span>
              <span className="text-[13px] leading-[1.7] text-ink-muted md:col-span-5 md:text-[14px]">
                {c.scope}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
