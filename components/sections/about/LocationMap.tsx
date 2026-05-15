"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function LocationMap() {
  const shouldReduce = useReducedMotion() ?? false;
  const query = encodeURIComponent(contact.address);

  return (
    <section
      aria-label="본사 위치 지도"
      className="bg-white py-12 md:py-16"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduce ? 0 : 0.8,
            ease: EASE_OUT,
          }}
          className="relative aspect-[16/9] overflow-hidden border border-line bg-bg-soft"
        >
          <iframe
            title={`(주)케이비개발 본사 위치 — ${contact.address}`}
            src={`https://www.google.com/maps?q=${query}&hl=ko&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
          />
        </motion.div>

        <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-[13px] text-ink-muted">
            <span className="eyebrow mr-2">ADDRESS</span>
            {contact.address}
          </p>
          <a
            href={`https://map.kakao.com/?q=${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 border-b border-ink-strong pb-0.5 text-[12px] font-semibold text-ink-strong transition-colors hover:border-primary hover:text-primary"
          >
            카카오맵에서 보기
            <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </Container>
    </section>
  );
}
