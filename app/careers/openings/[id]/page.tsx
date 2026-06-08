import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { MailtoCard } from "@/components/sections/common/MailtoCard";
import { JobApplyForm } from "@/components/sections/careers/JobApplyForm";
import { contact, jobOpenings } from "@/data/site-content";
import { findOpening, deadlineBadge, formatDate } from "@/lib/jobs";

type Params = { id: string };

export const revalidate = 3600;

export function generateStaticParams(): Params[] {
  return jobOpenings.map((j) => ({ id: j.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = findOpening(id);
  if (!job) return { title: "채용 공고 없음 | (주)케이비개발" };
  return {
    title: `${job.title} (${job.type}) | 채용 공고 | (주)케이비개발`,
    description:
      job.summary ??
      `${job.location} ${job.title} ${job.type} — (주)케이비개발 채용 공고`,
  };
}

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const job = findOpening(id);
  if (!job) notFound();

  const badge = deadlineBadge(job.deadline);
  const closed = !job.isActive || badge.tone === "closed";
  const applyEmail = job.applyEmail ?? contact.careersEmail ?? contact.email;
  const applySubject = `[케이비개발] ${job.title} 지원 — `;

  return (
    <>
      {/* 헤더 */}
      <section className="border-b border-line bg-bg-soft pt-16 pb-12 md:pt-20 md:pb-14">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.15em] text-ink-muted">
              <li>
                <Link href="/" className="font-medium uppercase hover:text-primary">
                  HOME
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/careers" className="font-medium uppercase hover:text-primary">
                  CAREERS
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/careers/openings"
                  className="font-medium uppercase hover:text-primary"
                >
                  OPENINGS
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-ink">{job.title}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center border border-navy-700 bg-navy-900 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
              {job.type}
            </span>
            <span
              className={
                "inline-flex items-center border px-2.5 py-1 text-[11px] font-bold tracking-wide " +
                (closed
                  ? "border-line bg-gray-50 text-ink-faint"
                  : badge.tone === "urgent"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-accent-500 bg-accent-50 text-accent-deep")
              }
            >
              {closed ? "마감" : badge.label}
            </span>
          </div>

          <h1 className="mt-5 font-display text-[32px] font-extrabold leading-[1.12] tracking-tight text-ink-strong md:text-[44px]">
            {job.title}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-ink-faint">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="2.6" />
              </svg>
              {job.location}
            </span>
            <span className="text-ink-faint">·</span>
            <span className="font-mono-num">등록 {formatDate(job.postedAt)}</span>
          </p>

          {job.summary && (
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.85] text-ink md:text-base">
              {job.summary}
            </p>
          )}
        </Container>
      </section>

      {/* 본문 */}
      <section className="section bg-white">
        <Container>
          {closed && (
            <div className="mb-10 rounded-md border border-line bg-gray-50 px-6 py-5 text-[14px] text-ink-muted">
              ※ 이 공고는 마감되었습니다. 인재 풀 등록 또는 채용 문의는 아래
              이메일로 연락 주세요.
            </div>
          )}

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            {/* 좌 — 상세 내용 */}
            <div className="space-y-12">
              {job.responsibilities && job.responsibilities.length > 0 && (
                <DetailBlock label="주요 업무" items={job.responsibilities} />
              )}
              <DetailBlock label="자격 요건" items={job.requirements} />
              {job.preferred && job.preferred.length > 0 && (
                <DetailBlock label="우대 사항" items={job.preferred} />
              )}

              <div>
                <p className="eyebrow text-accent-deep">지원 방법</p>
                <h2 className="mt-3 font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]">
                  지원 방법
                </h2>
                <p className="mt-5 text-[16px] leading-[1.85] text-ink-muted">
                  {job.applyMethod}
                </p>
              </div>
            </div>

            {/* 우 — 모집 요강 + 지원 CTA (sticky) */}
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-md border border-line bg-gray-50 p-6 md:p-7">
                <p className="eyebrow">모집 요강</p>
                <dl className="mt-5 space-y-4 text-[14px]">
                  <SpecRow label="고용형태" value={job.type} />
                  <SpecRow label="모집지역" value={job.location} />
                  <SpecRow
                    label="마감"
                    value={job.deadline ? formatDate(job.deadline) : "상시채용"}
                  />
                  <SpecRow label="등록일" value={formatDate(job.postedAt)} />
                </dl>

                <div className="mt-6 space-y-3">
                  {closed ? (
                    <p className="rounded-md border border-line bg-white px-6 py-5 text-center text-[14px] font-semibold text-ink-faint">
                      마감된 공고입니다
                    </p>
                  ) : (
                    <>
                      <a
                        href="#apply"
                        className="flex h-14 items-center justify-center gap-2 rounded-sm bg-accent-500 px-6 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
                      >
                        지원하기 · 온라인 접수
                        <span aria-hidden="true">↓</span>
                      </a>
                      <MailtoCard
                        email={applyEmail}
                        subject={applySubject}
                        label="이메일로 지원"
                      />
                      <p className="text-[12px] leading-relaxed text-ink-faint">
                        온라인 접수 시 담당자가 바로 확인합니다. 이메일 지원도
                        가능합니다.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/careers/openings"
                  className="text-[13px] font-medium text-ink-muted underline-offset-4 transition-colors hover:text-ink-strong hover:underline"
                >
                  ← 전체 채용공고 목록
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* 지원 폼 — DB 접수, 관리자 페이지에서 확인 */}
      {!closed && (
        <section id="apply" className="section scroll-mt-24 bg-bg-soft">
          <Container>
            <div className="mx-auto max-w-2xl">
              <p className="eyebrow text-accent-deep">APPLY · 지원하기</p>
              <h2 className="mt-3 font-display text-[26px] font-bold tracking-tight text-ink-strong md:text-[32px]">
                <span className="text-navy-700">{job.title}</span> 지원
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-ink-muted">
                아래 양식을 작성해 제출하시면 담당자가 검토 후 기재해주신
                연락처로 개별 연락드립니다. 별도 회원가입 없이 지원하실 수
                있습니다.
              </p>
              <div className="mt-10">
                <JobApplyForm openingId={job.id} openingTitle={job.title} />
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function DetailBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow text-accent-deep">{label}</p>
      <h2 className="mt-3 font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]">
        {label}
      </h2>
      <ul className="mt-6 space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-[16px] leading-[1.7] text-ink-muted">
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 shrink-0 text-accent-600"
            >
              <path d="M5 12.5l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
      <dt className="shrink-0 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </dt>
      <dd className="text-right font-display text-[15px] font-bold text-ink-strong">
        {value}
      </dd>
    </div>
  );
}
