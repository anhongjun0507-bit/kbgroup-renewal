import Link from "next/link";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

/* Phase 14-E E-1 — 페이지 하단 상담 유도 가벼운 CTA.
   기존: 모든 페이지 하단에 동일한 9-필드 ContactForm 반복 노출 → 페이지 스크롤 비용 큼
   변경: /contact 외 페이지는 본 컴포넌트로 교체. 폼은 /contact 한 곳에 집중.
   컨텍스트별 카피는 context prop으로 조정. */

interface Props {
  /** 페이지 컨텍스트에 맞는 짧은 안내 (선택). 없으면 기본 카피 */
  context?: string;
  /** 1차 CTA 라벨 (선택). 기본: "상담 문의하기" */
  ctaLabel?: string;
}

export function ContactInvite({
  context,
  ctaLabel = "상담 문의하기",
}: Props) {
  return (
    <section
      data-surface="dark"
      aria-label="상담 문의"
      className="relative isolate overflow-hidden bg-navy-900 py-16 text-white md:py-20"
    >
      {/* radial accent */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(45% 60% at 20% 30%, rgba(201,162,75,0.14) 0%, transparent 60%)",
            "radial-gradient(40% 50% at 80% 70%, rgba(30,44,86,0.7) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <p
              className="eyebrow"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              CONTACT US
            </p>
            <h2 className="mt-4 font-display text-[22px] font-bold leading-snug tracking-tight text-white md:text-[28px]">
              {context ?? "단지·시설 운영에 관한 모든 문의를 환영합니다"}
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-white/75 md:text-[15px]">
              상담 폼 또는 전화로 접수 — 영업일 기준 평균 4시간 안에 회신드립니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="btn-reset inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[var(--shadow-cta)]"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href={`tel:${contact.phone}`}
              className="btn-reset inline-flex h-12 items-center gap-2 rounded-sm border border-white/60 px-5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-ink-strong"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {contact.phone}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
