import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";
import { NoticesList } from "@/components/sections/notices/NoticesList";
import { NOTICES } from "./data";

export const metadata: Metadata = {
  title: "공지사항 | (주)케이비개발",
  description:
    "케이비개발의 공지·신규단지·언론보도·채용 공고를 한 곳에서 확인하세요.",
};

export default function NoticesPage() {
  return (
    <>
      <PageHero
        kicker="NOTICES"
        title="공지사항"
        italicWord="공지"
        subtitle="(주)케이비개발의 공지·소식을 카테고리별로 확인하세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES" },
        ]}
      />
      <section className="bg-white pt-12 md:pt-16">
        <Container>
          <Link
            href="/notices/board"
            className="group flex items-center justify-between gap-4 rounded-md border border-line bg-bg-soft px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[0_10px_28px_rgba(11,26,51,0.08)]"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-accent-500 text-navy-900"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5Z" />
                </svg>
              </span>
              <div>
                <p className="font-display text-[16px] font-bold tracking-tight text-ink-strong md:text-[18px]">
                  자유게시판
                </p>
                <p className="mt-0.5 text-[13px] text-ink-muted md:text-[14px]">
                  회원 누구나 자유롭게 글을 남기는 소통 공간입니다.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ink-strong md:text-[14px]">
              <span className="hidden sm:inline">바로가기</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        </Container>
      </section>
      <NoticesList items={NOTICES} />
    </>
  );
}
