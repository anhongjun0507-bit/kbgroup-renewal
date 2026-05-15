"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function CTA() {
  const shouldReduce = useReducedMotion() ?? false;

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT },
    },
  };

  return (
    <section className="bg-white py-20 md:py-24 lg:py-28">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: shouldReduce ? 0 : 0.08 },
            },
          }}
          className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 lg:p-20"
        >
          {/* 배경 도형 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-white/[0.06] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-accent/[0.08] blur-3xl"
          />

          <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.div
                variants={item}
                className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
              >
                GET STARTED
              </motion.div>
              <motion.h2
                variants={item}
                className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-[44px]"
              >
                단지 운영,<br className="md:hidden" /> 케이비개발과 시작하세요
              </motion.h2>
              <motion.p
                variants={item}
                className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
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
                className="!bg-white !text-primary hover:!bg-bg-soft"
              >
                <span aria-hidden="true">📞</span>
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
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
