import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { updateApplicationStatus, deleteApplication } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 채용 지원 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type StatusKey = "new" | "reviewing" | "done" | "rejected";

const STATUS_META: Record<
  StatusKey,
  { label: string; badge: string }
> = {
  new: { label: "신규", badge: "border-accent-500 bg-accent-50 text-accent-deep" },
  reviewing: { label: "검토중", badge: "border-navy-500 bg-navy-100 text-navy-700" },
  done: { label: "완료", badge: "border-success/40 bg-success/10 text-success" },
  rejected: { label: "보류", badge: "border-line bg-gray-100 text-ink-faint" },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "new", label: "신규" },
  { key: "reviewing", label: "검토중" },
  { key: "done", label: "완료" },
  { key: "rejected", label: "보류" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { supabase, profile } = await requireAdmin();
  const { status: rawStatus } = await searchParams;
  const filter = FILTERS.some((f) => f.key === rawStatus) ? rawStatus! : "all";

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false });

  const apps = data ?? [];
  const counts: Record<string, number> = {
    all: apps.length,
    new: apps.filter((a) => a.status === "new").length,
    reviewing: apps.filter((a) => a.status === "reviewing").length,
    done: apps.filter((a) => a.status === "done").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };
  const list = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="applications" />

        {/* 헤더 */}
        <div className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-accent-deep">ADMIN · 관리자</p>
            <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
              채용 지원·문의 관리
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              {profile?.display_name ?? profile?.email} 님 · 총{" "}
              <span className="font-semibold text-ink-strong">{counts.all}</span>
              건 접수
              {counts.new > 0 && (
                <>
                  {" "}
                  · 신규{" "}
                  <span className="font-semibold text-accent-deep">
                    {counts.new}
                  </span>
                  건
                </>
              )}
            </p>
          </div>
          <Link
            href="/mypage"
            className="text-[13px] font-medium text-ink-muted underline-offset-4 transition-colors hover:text-ink-strong hover:underline"
          >
            마이페이지 →
          </Link>
        </div>

        {/* 상태 필터 */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Link
                key={f.key}
                href={f.key === "all" ? "/admin" : `/admin?status=${f.key}`}
                className={
                  "inline-flex items-center gap-1.5 rounded-sm border px-3.5 py-2 text-[13px] font-semibold transition-colors " +
                  (active
                    ? "border-ink-strong bg-ink-strong text-white"
                    : "border-line bg-white text-ink-muted hover:border-ink-strong")
                }
              >
                {f.label}
                <span
                  className={
                    "font-mono-num " +
                    (active ? "text-white/70" : "text-ink-faint")
                  }
                >
                  {counts[f.key] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 목록 */}
        {error ? (
          <p className="mt-12 rounded-md border border-red-300 bg-red-50 px-6 py-5 text-[14px] text-red-700">
            데이터를 불러오지 못했습니다: {error.message}
          </p>
        ) : list.length === 0 ? (
          <div className="mt-12 rounded-md border border-line bg-white p-12 text-center">
            <p className="font-display text-[20px] font-bold text-ink-strong">
              {filter === "all"
                ? "아직 접수된 지원/문의가 없습니다"
                : "해당 상태의 항목이 없습니다"}
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              채용 공고 페이지에서 지원이 접수되면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {list.map((app) => {
              const meta =
                STATUS_META[(app.status as StatusKey) ?? "new"] ??
                STATUS_META.new;
              return (
                <li
                  key={app.id}
                  className="rounded-md border border-line bg-white p-6 md:p-7"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[13px] font-semibold text-ink-strong">
                          {app.opening_title ?? "일반 문의"}
                        </span>
                        <span className="font-mono-num text-[12px] text-ink-faint">
                          {formatDateTime(app.created_at)}
                        </span>
                      </div>

                      <p className="mt-4 font-display text-[20px] font-bold tracking-tight text-ink-strong">
                        {app.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-ink-muted">
                        <a
                          href={`tel:${app.phone}`}
                          className="hover:text-ink-strong hover:underline"
                        >
                          📞 {app.phone}
                        </a>
                        {app.email && (
                          <a
                            href={`mailto:${app.email}`}
                            className="break-all hover:text-ink-strong hover:underline"
                          >
                            ✉ {app.email}
                          </a>
                        )}
                      </div>

                      {app.message && (
                        <p className="mt-4 whitespace-pre-wrap rounded-sm border border-line bg-gray-50 p-4 text-[14px] leading-[1.7] text-ink-muted">
                          {app.message}
                        </p>
                      )}
                    </div>

                    {/* 관리 컨트롤 */}
                    <div className="flex shrink-0 flex-col gap-3 md:w-[200px]">
                      <form
                        action={updateApplicationStatus}
                        className="flex gap-2"
                      >
                        <input type="hidden" name="id" value={app.id} />
                        <select
                          name="status"
                          defaultValue={app.status}
                          className="min-w-0 flex-1 rounded-sm border border-line bg-white px-3 py-2 text-[13px] text-ink-strong focus:border-navy-700 focus:outline-none"
                        >
                          <option value="new">신규</option>
                          <option value="reviewing">검토중</option>
                          <option value="done">완료</option>
                          <option value="rejected">보류</option>
                        </select>
                        <button
                          type="submit"
                          className="shrink-0 rounded-sm bg-navy-900 px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy-800"
                        >
                          변경
                        </button>
                      </form>
                      <form action={deleteApplication}>
                        <input type="hidden" name="id" value={app.id} />
                        <ConfirmButton
                          message="이 지원/문의를 삭제하시겠습니까? 되돌릴 수 없습니다."
                          className="w-full rounded-sm border border-line px-3 py-2 text-[12px] font-medium text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
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
