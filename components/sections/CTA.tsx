"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { contact } from "@/data/site-content";

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
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#0e1530] via-primary to-[#0a0f24] py-24 text-white md:py-32 lg:py-40"
    >
      {/* 미세 grid 패턴 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
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
            className="font-display text-[18px] italic text-accent md:text-[22px]"
          >
            Get in Touch
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-5 font-display italic leading-[1.05] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Leave a message
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-8 text-lg leading-relaxed text-white/75 md:text-xl"
          >
            단지 운영, 케이비개발과 시작하세요.
          </motion.p>
          <motion.p
            variants={item}
            className="mt-3 text-sm leading-relaxed text-white/55 md:text-base"
          >
            상담은 무료입니다. 단지 규모·요구사항을 알려주시면 맞춤 제안을
            드립니다.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            <Button
              as="link"
              href={`tel:${contact.phone}`}
              variant="accent"
              size="lg"
            >
              <span aria-hidden="true">📞</span>
              {contact.phone}
            </Button>
            <Link
              href={`mailto:${contact.email}`}
              className="text-[14px] font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              이메일 문의 →
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
