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
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#0e1530] via-primary to-[#0a0f24] py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
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
            className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/55"
          >
            CONTACT
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-5 font-extrabold leading-[1.15] tracking-tight !text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            상담 문의를 <span className="text-accent">남겨주세요</span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-8 text-base leading-[1.85] text-white/80 md:text-lg"
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
            >
              <span aria-hidden="true">📞</span>
              {contact.phone}
            </Button>
            <Link
              href={`mailto:${contact.email}`}
              className="inline-flex h-14 items-center justify-center border border-white/30 px-9 text-[15px] font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/[0.06]"
            >
              이메일 문의 →
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
