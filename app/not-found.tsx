import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getSetting } from "@/lib/content";

/* Phase 9 P0-03 — 404 페이지
   Next.js 기본 흰화면 + 영문 한 줄 → 브랜드 톤 + 한국어 + 회복 동선 3종 */

export const metadata: Metadata = {
  title: "요청하신 페이지를 찾을 수 없습니다 | (주)케이비개발",
  description: "주소가 변경되었거나 삭제된 페이지일 수 있습니다.",
};

export default async function NotFound() {
  const contact = await getSetting("contact");

  return (
    <section
      data-surface="dark"
      className="relative isolate flex min-h-[75vh] items-center overflow-hidden bg-navy-900 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0B1A33 0%, #0E1F3A 50%, #0B1A33 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(45% 50% at 20% 30%, rgba(201,162,75,0.16) 0%, transparent 60%)",
            "radial-gradient(40% 45% at 80% 70%, rgba(30,44,86,0.55) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl py-24 text-center md:py-32">
          <p className="eyebrow">ERROR 404</p>
          <h1
            className="mt-6 font-display font-extrabold leading-[1.1] tracking-tight"
            style={{
              color: "#ffffff",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            }}
          >
            요청하신 페이지를 <br className="hidden sm:inline" />
            찾을 수 없습니다
          </h1>
          <p
            className="mx-auto mt-7 max-w-md text-[16px] md:text-[17px]"
            style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}
          >
            주소가 변경되었거나, 삭제된 페이지일 수 있습니다. 아래 경로로 다시
            방문해 주세요.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="btn-reset inline-flex h-14 items-center gap-2 rounded-sm bg-accent-500 px-8 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[var(--shadow-cta)]"
            >
              홈으로 <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/business"
              className="btn-reset inline-flex h-14 items-center gap-2 rounded-sm border border-white/60 px-8 text-base font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-ink-strong"
            >
              사업영역 보기
            </Link>
            <a
              href={`mailto:${contact.email}`}
              className="btn-reset inline-flex h-14 items-center gap-2 px-4 text-[14px] font-medium text-white/75 transition-colors duration-200 hover:text-white"
            >
              담당자에게 문의 ↗
            </a>
          </div>

          <p className="mt-10 text-[13px] text-white/55">
            {contact.phone} · {contact.email}
          </p>
        </div>
      </Container>
    </section>
  );
}
