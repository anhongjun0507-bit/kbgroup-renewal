"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const KICKER = "GET IN TOUCH";
const TITLE_LINE_1 = "신뢰할 수 있는 파트너를";
const TITLE_LINE_2 = "찾고 계신가요?";
const SUBTITLE_LINE_1 = "케이비개발이 시설관리의 새로운 기준을 만들어드립니다.";
const SUBTITLE_LINE_2 = "전문 컨설턴트가 직접 상담해드립니다.";

export function CTA() {
  const shouldReduce = useReducedMotion() ?? false;

  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-ink py-40 text-white md:py-48"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={parentVariants}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Kicker */}
          <motion.div variants={itemVariants} className="mb-12">
            <div
              aria-hidden="true"
              className="mx-auto mb-6 h-px w-12 bg-gold"
            />
            <div className="text-xs font-medium uppercase tracking-[0.35em] text-gold">
              {KICKER}
            </div>
          </motion.div>

          {/* Main title */}
          <motion.h2
            id="cta-heading"
            variants={titleVariants}
            className="font-serif text-5xl font-bold leading-[1.1] tracking-[-0.02em] md:text-6xl lg:text-7xl xl:text-[88px]"
          >
            <span className="block">{TITLE_LINE_1}</span>
            <span className="block italic text-gold">{TITLE_LINE_2}</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-10 max-w-xl text-base leading-[1.85] text-white/60 md:text-lg"
          >
            {SUBTITLE_LINE_1}
            <br />
            {SUBTITLE_LINE_2}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 border-b border-white pb-2 text-sm font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out hover:border-gold hover:text-gold"
            >
              서비스 문의
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              href="/about/why"
              className="text-sm tracking-wide text-white/60 transition-colors duration-300 ease-out hover:text-white"
            >
              회사 소개 보기
            </Link>
          </motion.div>

          {/* Contact info row */}
          <motion.div variants={itemVariants} className="mt-20">
            <div
              aria-hidden="true"
              className="mx-auto mb-10 h-px w-16 bg-gold/40"
            />
            <ul className="flex flex-col items-center justify-center gap-6 text-xs font-medium uppercase tracking-[0.25em] text-white/60 md:flex-row md:gap-12">
              <li className="flex items-center gap-3">
                <span className="text-white/30">TEL</span>
                <a
                  href={`tel:${contact.phone}`}
                  className="transition-colors duration-300 hover:text-white"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-white/30">EMAIL</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-colors duration-300 hover:text-white"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-white/30">KAKAO</span>
                <span className="text-white/40">준비 중</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
