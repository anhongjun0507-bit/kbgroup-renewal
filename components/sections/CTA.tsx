"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { contact } from "@/data/site-content";

/* Phase 3 — 톤 정비 (navy-900 통일). Phase 5에서 ContactForm으로 교체 예정 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function CTA() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT },
    },
  };

  return (
    <section
      id="contact"
      data-surface="dark"
      className="section relative isolate overflow-hidden bg-navy-900 text-white"
    >
      {/* mesh 그라데이션 */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(50% 60% at 20% 30%, rgba(230,57,80,0.16) 0%, transparent 60%)",
            "radial-gradient(45% 55% at 80% 70%, rgba(30,44,86,0.7) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            variants={item}
            className="eyebrow"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            CONTACT
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-5 font-extrabold leading-[1.15] tracking-tight"
            style={{ color: "#ffffff", fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            상담 문의를 <span className="text-accent-500">남겨주세요</span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-8 text-base md:text-lg"
            style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.75 }}
          >
            상담은 무료입니다. 단지 규모·요구사항을 알려주시면 맞춤 제안을
            드립니다.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          >
            <Button
              as="link"
              href={`tel:${contact.phone}`}
              variant="accent"
              size="lg"
              aria-label={`전화 ${contact.phone}로 무료 상담 신청`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {contact.phone}
            </Button>
            <Link
              href={`mailto:${contact.email}`}
              className="inline-flex h-14 items-center justify-center rounded-sm border border-white/40 px-8 text-[15px] font-semibold text-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-white hover:text-ink-strong"
            >
              이메일 문의 →
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
