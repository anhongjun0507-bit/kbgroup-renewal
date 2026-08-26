import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import {
  TABLE_LABELS,
  isRestorableTable,
  labelOf,
  listRevisionGroups,
  listRevisions,
  resolveActors,
} from "@/lib/content/revisions";
import { restoreRevisionAction } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 복구 이력 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** 저장 시각을 한국 시간 표기로. `Intl` 로 서버·클라 표기를 맞춘다. */
const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  dateStyle: "medium",
  timeStyle: "short",
});

/** 스냅샷 요약 — 무엇을 되돌리는지 한 줄로 가늠할 수 있게. */
function preview(table: string, snapshot: Record<string, unknown>): string {
  const value = table === "site_settings" ? snapshot.value : snapshot;
  let text: string;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (!text) return "(빈 값)";
  return text.length > 220 ? `${text.slice(0, 220)}…` : text;
}

type Search = { table?: string; record?: string; ok?: string; err?: string };

export default async function AdminRevisionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { supabase } = await requireAdmin("/admin/content/revisions");
  const { table, record, ok, err } = await searchParams;

  const detail = table && record && isRestorableTable(table) ? { table, record } : null;

  return (
    <main className="py-10">
      <Container>
        <AdminTabs active="revisions" />

        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-ink-strong">복구 이력</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-ink-muted">
            단지 정보와 사이트 설정은 저장할 때마다{" "}
            <strong className="text-ink-strong">직전 값</strong>이 자동으로 보관됩니다.
            잘못 고쳤을 때 원하는 시점을 골라 되돌릴 수 있습니다. 되돌리기 직전 값도 다시
            보관되므로 <strong className="text-ink-strong">되돌리기를 취소</strong>할 수도
            있습니다. 항목당 최근 20개까지 남습니다.
          </p>
        </header>

        {ok && (
          <p
            role="status"
            className="mb-6 rounded-sm border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900"
          >
            {ok}
          </p>
        )}
        {err && (
          <p
            role="alert"
            className="mb-6 rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-800"
          >
            {err}
          </p>
        )}

        {detail ? (
          <RevisionDetail supabase={supabase} table={detail.table} record={detail.record} />
        ) : (
          <RevisionList supabase={supabase} />
        )}
      </Container>
    </main>
  );
}

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function RevisionList({ supabase }: { supabase: Supabase }) {
  const groups = await listRevisionGroups(supabase);

  if (groups.length === 0) {
    return (
      <div className="rounded-md border border-line bg-white p-12 text-center">
        <p className="font-display text-[20px] font-bold text-ink-strong">
          아직 보관된 이력이 없습니다
        </p>
        <p className="mt-3 text-[14px] text-ink-muted">
          단지 정보나 사이트 설정을 한 번이라도 저장하면 이곳에 쌓입니다.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-md border border-line bg-white">
      <ul className="divide-y divide-line">
        {groups.map((g) => (
          <li
            key={`${g.table}-${g.recordId}`}
            data-record={`${g.table}::${g.recordId}`}
            className="flex flex-wrap items-center gap-3 px-5 py-4"
          >
            <span className="min-w-0 flex-1">
              <span className="text-[14px] font-semibold text-ink-strong">{g.label}</span>
              <span className="ml-2 rounded bg-bg-soft px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
                {TABLE_LABELS[g.table as keyof typeof TABLE_LABELS]}
              </span>
              {!g.exists && (
                <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-700">
                  삭제됨
                </span>
              )}
              <span className="mt-1 block text-[13px] text-ink-faint">
                이력 {g.count}건 · 마지막 저장 {fmt.format(new Date(g.latestAt))}
              </span>
            </span>
            <Link
              href={`/admin/content/revisions?table=${g.table}&record=${encodeURIComponent(g.recordId)}`}
              className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
            >
              이력 보기
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function RevisionDetail({
  supabase,
  table,
  record,
}: {
  supabase: Supabase;
  table: string;
  record: string;
}) {
  if (!isRestorableTable(table)) return null;
  const revisions = await listRevisions(supabase, table, record);
  const actors = await resolveActors(supabase, revisions.map((r) => r.actor_id));
  const title =
    revisions.length > 0 ? labelOf(table, record, revisions[0].snapshot) : record;
  const backTo = `/admin/content/revisions?table=${table}&record=${encodeURIComponent(record)}`;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-accent-deep">
            {TABLE_LABELS[table as keyof typeof TABLE_LABELS]}
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink-strong">
            {title}
          </h2>
        </div>
        <Link
          href="/admin/content/revisions"
          className="text-[13px] font-medium text-ink-muted underline-offset-4 hover:text-ink-strong hover:underline"
        >
          ← 전체 목록으로
        </Link>
      </div>

      {revisions.length === 0 ? (
        <p className="rounded-md border border-line bg-white px-5 py-8 text-center text-[14px] text-ink-muted">
          이 항목의 이력이 없습니다.
        </p>
      ) : (
        <ol className="space-y-4">
          {revisions.map((r, i) => (
            <li
              key={r.id}
              data-revision={r.id}
              className="rounded-md border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-strong">
                    {fmt.format(new Date(r.created_at))}
                    {i === 0 && (
                      <span className="ml-2 rounded bg-navy-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        가장 최근
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-faint">
                    편집자{" "}
                    {r.actor_id ? (actors[r.actor_id] ?? "(알 수 없음)") : "(기록 없음)"}
                  </p>
                </div>
                <form action={restoreRevisionAction}>
                  <input type="hidden" name="revisionId" value={r.id} />
                  <input type="hidden" name="table" value={table} />
                  <input type="hidden" name="record" value={record} />
                  <input type="hidden" name="backTo" value={backTo} />
                  <ConfirmButton
                    message="이 시점의 값으로 되돌립니다. 지금 값도 이력에 보관되므로 다시 되돌릴 수 있습니다. 진행할까요?"
                    className="inline-flex h-9 items-center rounded-sm bg-navy-900 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-navy-800"
                  >
                    이 시점으로 복원
                  </ConfirmButton>
                </form>
              </div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-sm bg-bg-soft px-3 py-2 text-[12px] leading-[1.6] text-ink-muted">
                {preview(table, r.snapshot)}
              </pre>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
