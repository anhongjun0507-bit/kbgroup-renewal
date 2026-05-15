"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function CTA() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-ink-strong py-24 md:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
          }}
          className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <motion.p
              variants={item}
              className="text-[13px] font-semibold tracking-wide text-white/50"
            >
              GET STARTED
            </motion.p>
            <motion.h2
              variants={item}
              className="mt-4 text-[32px] font-bold leading-[1.15] tracking-tight text-white md:text-[48px]"
            >
              단지 운영,<br className="md:hidden" /> 케이비개발과 시작하세요
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              상담은 무료입니다. 단지 규모·요구사항을 알려주시면
              맞춤 제안을 드립니다.
            </motion.p>
          </div>

          <motion.div
            variants={item}
            className="flex flex-col gap-3 sm:flex-row md:flex-shrink-0 md:flex-col lg:flex-row"
          >
            <Button
              as="link"
              href={`tel:${contact.phone}`}
              variant="primary"
              size="lg"
              className="!bg-white !text-ink-strong hover:!bg-bg-soft"
            >
              {contact.phone}
            </Button>
            <Button
              as="link"
              href={`mailto:${contact.email}`}
              variant="outline"
              size="lg"
              className="!border-white/30 !bg-transparent !text-white hover:!border-white hover:!text-white"
            >
              이메일 문의
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
