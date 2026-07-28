import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { setMemberStatus, deleteMember } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 회원 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type StatusKey = "pending" | "approved" | "rejected";

const STATUS_META: Record<StatusKey, { label: string; badge: string }> = {
  pending: {
    label: "승인 대기",
    badge: "border-accent-500 bg-accent-50 text-accent-deep",
  },
  approved: {
    label: "승인됨",
    badge: "border-success/40 bg-success/10 text-success",
  },
  rejected: {
    label: "거절",
    badge: "border-line bg-gray-100 text-ink-faint",
  },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "승인 대기" },
  { key: "approved", label: "승인됨" },
  { key: "rejected", label: "거절" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { supabase, user, profile } = await requireAdmin();
  const { status: rawStatus, q: rawQ } = await searchParams;
  const filter = FILTERS.some((f) => f.key === rawStatus) ? rawStatus! : "all";
  const q = (rawQ ?? "").trim();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, status, created_at")
    .order("created_at", { ascending: false });

  const allMembers = data ?? [];
  // 이름·이메일 검색 (대소문자 무시). 상태 카운트·필터는 검색 결과 안에서 동작.
  const needle = q.toLowerCase();
  const members = needle
    ? allMembers.filter(
        (m) =>
          m.email.toLowerCase().includes(needle) ||
          (m.display_name ?? "").toLowerCase().includes(needle),
      )
    : allMembers;
  const counts: Record<string, number> = {
    all: members.length,
    pending: members.filter((m) => m.status === "pending").length,
    approved: members.filter((m) => m.status === "approved").length,
    rejected: members.filter((m) => m.status === "rejected").length,
  };
  const list =
    filter === "all" ? members : members.filter((m) => m.status === filter);

  // 상태 필터 링크에 현재 검색어를 유지. (검색어 초기화 링크에서도 재사용)
  const buildHref = (statusKey: string) => {
    const params = new URLSearchParams();
    if (statusKey !== "all") params.set("status", statusKey);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/members?${qs}` : "/admin/members";
  };

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="members" />

        {/* 헤더 */}
        <div className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-accent-deep">ADMIN · 관리자</p>
            <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
              회원 관리
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              {profile?.display_name ?? profile?.email} 님 ·{" "}
              {q ? (
                <>
                  <span className="font-semibold text-ink-strong">‘{q}’</span>{" "}
                  검색결과{" "}
                  <span className="font-semibold text-ink-strong">
                    {counts.all}
                  </span>
                  명
                </>
              ) : (
                <>
                  총{" "}
                  <span className="font-semibold text-ink-strong">
                    {counts.all}
                  </span>
                  명
                  {counts.pending > 0 && (
                    <>
                      {" "}
                      · 승인 대기{" "}
                      <span className="font-semibold text-accent-deep">
                        {counts.pending}
                      </span>
                      명
                    </>
                  )}
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

        {/* 검색 (이름·이메일) */}
        <form
          action="/admin/members"
          method="get"
          role="search"
          className="mt-8 flex flex-wrap gap-2"
        >
          {filter !== "all" && (
            <input type="hidden" name="status" value={filter} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="이름 또는 이메일로 검색"
            aria-label="회원 이름 또는 이메일 검색"
            className="min-w-0 flex-1 rounded-sm border border-line bg-white px-4 py-2.5 text-[14px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none md:max-w-xs md:flex-none md:w-80"
          />
          <button
            type="submit"
            className="shrink-0 rounded-sm bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-800"
          >
            검색
          </button>
          {q && (
            <Link
              href={
                filter === "all"
                  ? "/admin/members"
                  : `/admin/members?status=${filter}`
              }
              className="inline-flex shrink-0 items-center rounded-sm border border-line px-4 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
            >
              초기화
            </Link>
          )}
        </form>

        {/* 상태 필터 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Link
                key={f.key}
                href={buildHref(f.key)}
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
              {q
                ? "검색 결과가 없습니다"
                : filter === "all"
                  ? "아직 가입한 회원이 없습니다"
                  : "해당 상태의 회원이 없습니다"}
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">
              {q
                ? "다른 이름이나 이메일로 검색해 보세요."
                : "회원가입이 접수되면 이곳에 표시됩니다. 신규 가입자는 승인 대기 상태로 등록됩니다."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {list.map((m) => {
              const meta =
                STATUS_META[(m.status as StatusKey) ?? "pending"] ??
                STATUS_META.pending;
              const isSelf = m.id === user.id;
              const isAdminRow = m.role === "admin";
              const name = m.display_name ?? m.email.split("@")[0];

              return (
                <li
                  key={m.id}
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
                        {isAdminRow && (
                          <span className="inline-flex items-center border border-navy-500 bg-navy-100 px-2.5 py-1 text-[11px] font-bold text-navy-700">
                            관리자
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[12px] font-medium text-ink-faint">
                            본인 계정
                          </span>
                        )}
                        <span className="font-mono-num text-[12px] text-ink-faint">
                          가입 {formatDate(m.created_at)}
                        </span>
                      </div>

                      <p className="mt-4 font-display text-[20px] font-bold tracking-tight text-ink-strong">
                        {name}
                      </p>
                      <a
                        href={`mailto:${m.email}`}
                        className="mt-1 inline-block break-all text-[14px] text-ink-muted hover:text-ink-strong hover:underline"
                      >
                        ✉ {m.email}
                      </a>
                    </div>

                    {/* 관리 컨트롤 */}
                    <div className="flex shrink-0 flex-col gap-2 md:w-[220px]">
                      {isSelf ? (
                        <p className="text-[12px] text-ink-faint md:text-right">
                          본인 계정은 변경할 수 없습니다.
                        </p>
                      ) : isAdminRow ? (
                        <p className="text-[12px] text-ink-faint md:text-right">
                          관리자 계정입니다.
                        </p>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {m.status !== "approved" && (
                              <StatusButton
                                id={m.id}
                                status="approved"
                                className="flex-1 rounded-sm bg-primary px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
                              >
                                승인
                              </StatusButton>
                            )}
                            {m.status !== "pending" && (
                              <StatusButton
                                id={m.id}
                                status="pending"
                                className="flex-1 rounded-sm border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
                              >
                                대기로
                              </StatusButton>
                            )}
                            {m.status !== "rejected" && (
                              <form action={setMemberStatus} className="flex-1">
                                <input type="hidden" name="id" value={m.id} />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="rejected"
                                />
                                <ConfirmButton
                                  message={`${name} 님의 가입을 거절하시겠습니까?`}
                                  className="w-full rounded-sm border border-line px-3 py-2 text-[13px] font-semibold text-ink-muted transition-colors hover:border-danger/40 hover:bg-danger/5 hover:text-danger"
                                >
                                  거절
                                </ConfirmButton>
                              </form>
                            )}
                          </div>
                          <form action={deleteMember}>
                            <input type="hidden" name="id" value={m.id} />
                            <ConfirmButton
                              message={`${name} (${m.email}) 회원을 삭제하시겠습니까? 계정과 관련 정보가 모두 삭제되며 되돌릴 수 없습니다.`}
                              className="w-full rounded-sm px-3 py-2 text-[12px] font-medium text-ink-faint transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              회원 삭제
                            </ConfirmButton>
                          </form>
                        </>
                      )}
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

/** 승인 상태 변경 submit 버튼 (id + status 히든필드 포함 단일 form). */
function StatusButton({
  id,
  status,
  className,
  children,
}: {
  id: string;
  status: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={setMemberStatus} className="flex-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
