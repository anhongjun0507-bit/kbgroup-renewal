"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function LocationMap() {
  const shouldReduce = useReducedMotion() ?? false;
  const query = encodeURIComponent(contact.address);
  const kakaoUrl = `https://map.kakao.com/?q=${query}`;
  const naverUrl = `https://map.naver.com/v5/search/${query}`;

  return (
    <section
      aria-label="본사 위치"
      className="bg-white py-12 md:py-16"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT }}
        >
          {/* 외부 지도 카드 — iframe 대신 클릭 시 카카오맵으로 이동 (R5-3 픽스) */}
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${contact.address} — 카카오맵에서 보기`}
            className="group relative block aspect-[16/9] overflow-hidden border border-line bg-gradient-to-br from-bg-soft via-white to-bg-tinted"
          >
            {/* KB 3색 좌측 라인 */}
            <div className="absolute inset-y-0 left-0 flex w-1.5" aria-hidden="true">
              <span className="flex-1 bg-secondary" />
              <span className="flex-1 bg-accent" />
              <span className="flex-1 bg-primary" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="eyebrow text-accent">VIEW ON MAP</p>
              <p
                className="mt-3 font-display"
                style={{
                  fontSize: "clamp(1.5rem, 3.2vw, 2.25rem)",
                  fontWeight: 900,
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--color-ink-strong)",
                  lineHeight: 1.2,
                }}
              >
                카카오맵에서 보기
                <span
                  aria-hidden="true"
                  className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                >
                  →
                </span>
              </p>
              <p className="mt-3 max-w-xl text-sm text-ink md:text-base">
                {contact.address}
              </p>
            </div>
          </a>
        </motion.div>

        {/* 보조 링크 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">
            <span className="eyebrow mr-2">ADDRESS</span>
            {contact.address}
          </p>
          <div className="flex items-center gap-4 text-[12px] font-semibold">
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-strong transition-colors hover:text-primary"
            >
              KAKAO MAP <span aria-hidden="true">↗</span>
            </a>
            <a
              href={naverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-strong transition-colors hover:text-primary"
            >
              NAVER MAP <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
