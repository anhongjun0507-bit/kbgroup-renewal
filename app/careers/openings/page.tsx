import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container, FadeIn } from "@/components/ui";
import { JobCard } from "@/components/sections/careers/JobCard";
import { TalentPoolCTA } from "@/components/sections/careers/TalentPoolCTA";
import { contact } from "@/data/site-content";
import { getPublishedOpenings } from "@/lib/job-openings";

export const metadata: Metadata = {
  title: "채용 공고 | (주)케이비개발",
  description:
    "(주)케이비개발에서 현재 진행 중인 채용 공고입니다. 관심 직무를 확인하고 지원해 주세요.",
};

export const dynamic = "force-dynamic";

export default async function OpeningsPage() {
  const openings = await getPublishedOpenings();
  const now = new Date();
  const careersEmail = contact.careersEmail ?? contact.email;

  return (
    <>
      <PageHero
        kicker="OPEN POSITIONS · 채용 공고"
        title="현재 채용 중인 공고"
        italicWord="공고"
        subtitle="(주)케이비개발과 함께 신뢰를 키워갈 동료를 찾습니다. 진행 중인 채용 정보를 확인하고 지원해 주세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "CAREERS", href: "/careers" },
          { label: "OPENINGS" },
        ]}
      />

      <section className="section bg-cream">
        <Container>
          {openings.length > 0 ? (
            <>
              <div className="mb-10 flex items-baseline justify-between border-b border-line pb-6">
                <p className="eyebrow">
                  진행 중 <span className="text-accent-deep">{openings.length}</span>건
                </p>
                <Link
                  href="/careers"
                  className="text-[13px] font-medium text-ink-muted underline-offset-4 transition-colors hover:text-ink-strong hover:underline"
                >
                  ← 채용 안내로
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {openings.map((job, i) => (
                  <FadeIn key={job.id} delay={i * 80}>
                    <JobCard job={job} now={now} />
                  </FadeIn>
                ))}
              </div>

              {/* 인재 풀 안내 */}
              <div className="mt-16 rounded-md border border-line bg-white p-8 text-center md:p-10">
                <p className="font-display text-[20px] font-bold tracking-tight text-ink-strong md:text-[22px]">
                  맞는 공고가 없으신가요?
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-ink-muted">
                  인재 풀에 등록해 두시면 적합한 포지션이 열릴 때 먼저 연락드립니다.
                </p>
                <div className="mt-6">
                  <TalentPoolCTA email={careersEmail} compact />
                </div>
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-3xl rounded-md border border-line bg-white p-10 text-center md:p-14">
              <div className="mx-auto h-12 w-12 text-ink-faint">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="8" y="14" width="32" height="26" rx="2" />
                  <path d="M18 14V10C18 8.9 18.9 8 20 8H28C29.1 8 30 8.9 30 10V14" />
                  <path d="M14 22H34" />
                  <circle cx="20" cy="30" r="1.5" fill="currentColor" />
                  <path d="M24 30H32" />
                </svg>
              </div>
              <p className="mt-6 font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]">
                현재 진행 중인 공고가 없습니다
              </p>
              <p className="mt-4 text-[15px] leading-[1.75] text-ink-muted">
                신규 공고는 이곳에 게재됩니다. 관심 직무가 있으시면
                <br className="hidden sm:inline" />
                인재 풀에 등록해 주세요. 적합한 포지션이 열릴 때 먼저 연락드립니다.
              </p>
              <div className="mt-8">
                <TalentPoolCTA email={careersEmail} />
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
