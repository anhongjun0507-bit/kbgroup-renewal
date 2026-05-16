import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";

/* Phase 5.J.4 — /notices/[id] 라우트 골격
   콘텐츠 0건 상태 — 데이터 연동 후 정상 동작 */

export const metadata: Metadata = {
  title: "공지 상세 | (주)케이비개발",
};

export default function NoticeDetailPage() {
  return (
    <>
      <PageHero
        kicker="NOTICE DETAIL"
        title="공지 상세 페이지"
        italicWord="상세"
        subtitle="공지 콘텐츠 데이터 연동 후 정상 동작합니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "DETAIL" },
        ]}
      />

      <section className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl rounded-md border border-line bg-gray-50 p-10 text-center md:p-14">
            <div className="mx-auto h-12 w-12 text-ink-faint">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="10" width="32" height="28" rx="2" />
                <path d="M8 18H40" />
                <path d="M16 26H32M16 32H26" />
              </svg>
            </div>
            <p className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[26px]">
              아직 공개된 공지 콘텐츠가 없습니다
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
              공지 콘텐츠 마이그레이션이 완료되면 이 페이지에서 본문, 첨부, 이전·다음 공지로 이동할 수 있습니다.
            </p>
            <div className="mt-8">
              <Link
                href="/notices"
                className="inline-flex h-12 items-center gap-2 rounded-sm border border-ink-strong px-6 text-[14px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
              >
                ← 공지사항 목록으로
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
