import Link from "next/link";
import { Container, Heading, FadeIn } from "@/components/ui";
import { contact } from "@/data/site-content";
import { getPublishedOpenings } from "@/lib/job-openings";
import { JobCard } from "./JobCard";
import { TalentPoolCTA } from "./TalentPoolCTA";

/* /careers 의 "현재 채용 중" 섹션 (서버 컴포넌트).
   - 활성 공고가 있으면 카드 미리보기(최대 2건) + 전체 보기 링크 + 인재풀 안내.
   - 0건이면 빈 상태 + 인재풀 등록.
   Phase 5.I.3 빈 상태 / Phase 14-N 클립보드 fallback 계승.
   2026-06-08 — 채용 공고 데이터 모델(jobOpenings) 연동 + /careers/openings 분리. */

const PREVIEW_COUNT = 2;

export async function CareersOpenings() {
  const careersEmail = contact.careersEmail ?? contact.email;
  const openings = await getPublishedOpenings();
  const now = new Date();
  const preview = openings.slice(0, PREVIEW_COUNT);
  const hasMore = openings.length > PREVIEW_COUNT;

  return (
    <section
      aria-labelledby="careers-openings-heading"
      className="section bg-gray-50"
    >
      <Container>
        <FadeIn>
          <Heading
            kicker="OPEN POSITIONS"
            title="현재 채용 중인 공고"
            italicWord="공고"
            subtitle={
              openings.length > 0
                ? "진행 중인 채용 정보입니다. 관심 있는 직무를 확인하고 지원해 주세요."
                : "공고가 없을 때는 인재 풀 등록으로 미리 연결하세요. 적합한 포지션이 열리면 먼저 연락드립니다."
            }
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </FadeIn>

        {openings.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {preview.map((job, i) => (
                <FadeIn key={job.id} delay={i * 80}>
                  <JobCard job={job} now={now} />
                </FadeIn>
              ))}
            </div>

            <div className="flex flex-col items-start justify-between gap-6 border-t border-line pt-8 md:flex-row md:items-center">
              <Link
                href="/careers/openings"
                className="group inline-flex items-center gap-2 text-[15px] font-semibold text-ink-strong"
              >
                전체 채용공고 보기
                <span className="font-mono-num text-ink-faint">
                  ({openings.length}건)
                </span>
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <span className="text-[14px] text-ink-muted">
                  관심 직무가 없으신가요?
                </span>
                <TalentPoolCTA email={careersEmail} compact />
              </div>
            </div>

            {hasMore && (
              <p className="text-[13px] text-ink-faint">
                ※ 미리보기에는 최신 공고 {PREVIEW_COUNT}건만 표시됩니다. 전체
                공고는 위 링크에서 확인하세요.
              </p>
            )}
          </div>
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
  );
}
