import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { getAllOpeningsForAdmin } from "@/lib/job-openings";
import { deadlineBadge, formatDate } from "@/lib/jobs";
import { deleteOpening, togglePublish } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 채용 공고 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOpeningsPage() {
  await requireAdmin("/admin/openings");
  const openings = await getAllOpeningsForAdmin();
  const now = new Date();

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="openings" />

        <div className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-accent-deep">ADMIN · 관리자</p>
            <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
              채용 공고 관리
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              총 <span className="font-semibold text-ink-strong">{openings.length}</span>
              건 · 공개{" "}
              <span className="font-semibold text-accent-deep">
                {openings.filter((o) => o.isPublished).length}
              </span>
              건
            </p>
          </div>
          <Link
            href="/admin/openings/new"
            className="inline-flex h-12 shrink-0 items-center gap-1.5 self-start rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] sm:self-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            새 공고 작성
          </Link>
        </div>

        {openings.length === 0 ? (
          <div className="mt-10 rounded-md border border-line bg-white p-12 text-center">
            <p className="font-display text-[20px] font-bold text-ink-strong">
              등록된 채용 공고가 없습니다
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              새 공고를 작성하면 채용 페이지에 노출할 수 있습니다.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {openings.map((o) => {
              const badge = deadlineBadge(o.deadline, now);
              return (
                <li
                  key={o.id}
                  className="rounded-md border border-line bg-white p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            "inline-flex items-center border px-2.5 py-1 text-[11px] font-bold " +
                            (o.isPublished
                              ? "border-success/40 bg-success/10 text-success"
                              : "border-line bg-gray-100 text-ink-faint")
                          }
                        >
                          {o.isPublished ? "공개" : "비공개"}
                        </span>
                        <span className="inline-flex items-center border border-navy-700 bg-navy-900 px-2.5 py-1 text-[11px] font-bold text-white">
                          {o.type}
                        </span>
                        <span className="font-mono-num text-[12px] text-ink-faint">
                          {badge.label} · 등록 {formatDate(o.postedAt)}
                        </span>
                      </div>
                      <p className="mt-3 font-display text-[20px] font-bold tracking-tight text-ink-strong">
                        {o.title}
                      </p>
                      <p className="mt-1 text-[14px] text-ink-muted">
                        {o.location || "지역 미지정"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        href={`/careers/openings/${o.id}`}
                        className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
                      >
                        미리보기
                      </Link>
                      <form action={togglePublish}>
                        <input type="hidden" name="id" value={o.id} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-navy-700 hover:text-navy-700"
                        >
                          {o.isPublished ? "비공개로" : "공개로"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/openings/${o.id}/edit`}
                        className="inline-flex h-9 items-center rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-navy-800"
                      >
                        수정
                      </Link>
                      <form action={deleteOpening}>
                        <input type="hidden" name="id" value={o.id} />
                        <ConfirmButton
                          message="이 채용 공고를 삭제하시겠습니까? 되돌릴 수 없습니다."
                          className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          삭제
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
