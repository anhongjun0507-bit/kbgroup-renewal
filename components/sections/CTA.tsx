"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function CTA() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-ink-strong py-20 md:py-28">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
          }}
          className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <motion.p
              variants={item}
              className="text-[13px] font-medium tracking-wide text-white/60"
            >
              GET STARTED
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-white md:text-[44px]"
            >
              단지 운영, 케이비개발과<br className="hidden md:block" /> 시작하세요
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 md:text-base"
            >
              상담은 무료입니다. 단지 규모·요구사항을 알려주시면 맞춤 제안을
              드립니다.
            </motion.p>
          </div>

          <motion.div
            variants={item}
            className="flex flex-col gap-3 sm:flex-row md:flex-shrink-0 md:flex-col lg:flex-row"
          >
            <a
              href={`tel:${contact.phone}`}
              aria-label={`전화 ${contact.phone}`}
              className="group inline-flex h-14 items-center justify-center bg-white px-8 text-base font-medium text-ink-strong transition-all duration-300 hover:bg-bg-soft"
            >
              <span className="mr-2" aria-hidden="true">📞</span>
              {contact.phone}
            </a>
            <a
              href={`mailto:${contact.email}`}
              aria-label={`이메일 ${contact.email}`}
              className="inline-flex h-14 items-center justify-center border border-white/30 px-8 text-base font-medium text-white transition-all duration-300 hover:border-white hover:bg-white/[0.06]"
            >
              이메일 문의
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
