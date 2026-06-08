import Link from "next/link";
import {
  deadlineBadge,
  formatDate,
  type DeadlineTone,
  type JobOpening,
} from "@/lib/jobs";

/* 채용 공고 카드 (서버 컴포넌트).
   /careers 미리보기와 /careers/openings 목록에서 공유. v10 디자인 토큰. */

const TONE_CLASS: Record<DeadlineTone, string> = {
  always: "border-accent-500 text-accent-deep bg-accent-50",
  urgent: "border-red-300 text-red-700 bg-red-50",
  normal: "border-line text-ink-muted bg-white",
  closed: "border-line text-ink-faint bg-gray-50",
};

export function JobCard({ job, now }: { job: JobOpening; now?: Date }) {
  const badge = deadlineBadge(job.deadline, now);

  return (
    <Link
      href={`/careers/openings/${job.id}`}
      className="group flex h-full flex-col rounded-md border border-line bg-white p-6 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-1 hover:border-ink-strong hover:shadow-[0_12px_32px_rgba(11,26,51,0.08)] md:p-7"
    >
      {/* 상단 뱃지 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center border border-navy-700 bg-navy-900 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
          {job.type}
        </span>
        <span
          className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold tracking-wide ${TONE_CLASS[badge.tone]}`}
        >
          {badge.label}
        </span>
      </div>

      {/* 직무명 */}
      <h3 className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink-strong transition-colors duration-200 group-hover:text-navy-700 md:text-[22px]">
        {job.title}
      </h3>

      {/* 지역 */}
      <p className="mt-3 flex items-center gap-1.5 text-[14px] text-ink-muted">
        <svg
          aria-hidden="true"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-ink-faint"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
        {job.location}
      </p>

      {job.summary && (
        <p className="mt-4 line-clamp-2 text-[14px] leading-[1.7] text-ink-muted">
          {job.summary}
        </p>
      )}

      {/* 푸터 */}
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="font-mono-num text-[12px] text-ink-faint">
          등록 {formatDate(job.postedAt)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-strong">
          자세히 보기
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
