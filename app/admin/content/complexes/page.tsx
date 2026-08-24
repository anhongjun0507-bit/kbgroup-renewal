import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { deleteComplex, toggleComplexActive } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 단지 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 단지 목록 (PLAN B / DAY 3-1).
 *
 * 검색·정렬·페이지네이션은 서버에서 전량(172행)을 읽어 메모리에서 처리한다.
 * 별칭(text[]) 부분 일치까지 포함해야 하는데 SQL 로 짜면 쿼리가 복잡해지고,
 * 172행은 페이로드가 무의미하게 작다. 행 수가 수천 단위로 커지면 그때 SQL 로 내린다.
 *
 * 관리자 화면은 캐시된 어댑터가 아니라 DB 를 직접 읽는다 — 저장 직후 최신 값이 보여야 한다.
 */

const PAGE_SIZE = 30;

const SORTS = {
  sort_order: { label: "기본 순서", key: "sort_order" },
  name: { label: "이름", key: "name" },
  region: { label: "지역", key: "region" },
  households: { label: "세대수", key: "households" },
  client: { label: "발주처", key: "client" },
} as const;

type SortKey = keyof typeof SORTS;

const STATUS_FILTERS = [
  { key: "all", label: "전체" },
  { key: "active", label: "현재 운영" },
  { key: "past", label: "과거 단지" },
] as const;

type Row = {
  id: string;
  slug: string;
  name: string;
  client: string | null;
  region: string;
  households: number | null;
  area: number | null;
  type: string | null;
  period: string | null;
  image: string | null;
  aliases: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

function collator() {
  return new Intl.Collator("ko");
}

export default async function AdminComplexesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}) {
  const { supabase } = await requireAdmin("/admin/content/complexes");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const status = STATUS_FILTERS.some((f) => f.key === sp.status) ? sp.status! : "all";
  const sort: SortKey = (sp.sort ?? "") in SORTS ? (sp.sort as SortKey) : "sort_order";
  const dir = sp.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const { data, error } = await supabase
    .from("complexes")
    .select(
      "id, slug, name, client, region, households, area, type, period, image, aliases, is_featured, is_active, sort_order",
    )
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  const all = (data ?? []) as Row[];

  const byStatus = all.filter((c) =>
    status === "all" ? true : status === "active" ? c.is_active : !c.is_active,
  );

  // 검색: 단지명 · 지역 · 별칭 부분 일치 (대소문자 무시)
  const needle = q.toLowerCase();
  const filtered = needle
    ? byStatus.filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          c.region.toLowerCase().includes(needle) ||
          c.aliases.some((a) => a.toLowerCase().includes(needle)),
      )
    : byStatus;

  const cmp = collator();
  const sorted = [...filtered].sort((a, b) => {
    let r: number;
    if (sort === "households") {
      r = (a.households ?? -1) - (b.households ?? -1);
    } else if (sort === "sort_order") {
      // 기본 순서는 현재 → 과거 그룹 안에서의 원본 배열 순서를 그대로 보여준다.
      r = Number(b.is_active) - Number(a.is_active) || a.sort_order - b.sort_order;
    } else {
      r = cmp.compare(a[sort] ?? "", b[sort] ?? "");
    }
    return dir === "desc" ? -r : r;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const activeCount = all.filter((c) => c.is_active).length;
  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, status, sort, dir, page: current, ...over };
    for (const [k, v] of Object.entries(merged)) {
      if (v === undefined || v === "" || (k === "page" && v === 1) || (k === "status" && v === "all"))
        continue;
      p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="complexes" />

        <div className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-accent-deep">ADMIN · 콘텐츠</p>
            <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
              단지 관리
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              전체 <span className="font-semibold text-ink-strong">{all.length}</span>건 · 현재
              운영 <span className="font-semibold text-accent-deep">{activeCount}</span>건 · 과거{" "}
              <span className="font-semibold text-ink-strong">{all.length - activeCount}</span>건
            </p>
          </div>
          <Link
            href="/admin/content/complexes/new"
            className="inline-flex h-12 shrink-0 items-center gap-1.5 self-start rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] sm:self-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            새 단지 등록
          </Link>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            단지 목록을 불러오지 못했습니다: {error.message}
          </p>
        )}

        {/* 검색 · 상태 필터 · 정렬 */}
        <div className="mt-8 space-y-4">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="dir" value={dir} />
            <div className="min-w-[240px] flex-1">
              <label htmlFor="cx-q" className="eyebrow mb-2 block">
                검색 (단지명 · 지역 · 별칭)
              </label>
              <input
                id="cx-q"
                name="q"
                defaultValue={q}
                placeholder="예) 계림, 광주, LH"
                className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center rounded-sm bg-navy-900 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-navy-800"
            >
              검색
            </button>
            {q && (
              <Link
                href={`/admin/content/complexes${qs({ q: "", page: 1 })}`}
                className="inline-flex h-12 items-center rounded-sm border border-line px-4 text-[14px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
              >
                초기화
              </Link>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                상태
              </span>
              {STATUS_FILTERS.map((f) => (
                <Link
                  key={f.key}
                  href={`/admin/content/complexes${qs({ status: f.key, page: 1 })}`}
                  aria-current={status === f.key ? "page" : undefined}
                  className={
                    "inline-flex h-9 items-center rounded-sm border px-3 text-[13px] font-semibold transition-colors " +
                    (status === f.key
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-line bg-white text-ink-muted hover:border-ink-strong hover:text-ink-strong")
                  }
                >
                  {f.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                정렬
              </span>
              {(Object.keys(SORTS) as SortKey[]).map((k) => {
                const on = sort === k;
                const nextDir = on && dir === "asc" ? "desc" : "asc";
                return (
                  <Link
                    key={k}
                    href={`/admin/content/complexes${qs({ sort: k, dir: nextDir, page: 1 })}`}
                    aria-current={on ? "page" : undefined}
                    className={
                      "inline-flex h-9 items-center gap-1 rounded-sm border px-3 text-[13px] font-semibold transition-colors " +
                      (on
                        ? "border-accent-500 bg-accent-50 text-accent-deep"
                        : "border-line bg-white text-ink-muted hover:border-ink-strong hover:text-ink-strong")
                    }
                  >
                    {SORTS[k].label}
                    {on && <span aria-hidden="true">{dir === "asc" ? "↑" : "↓"}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-ink-muted">
          {sorted.length.toLocaleString()}건 중{" "}
          {sorted.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1}–
          {Math.min(current * PAGE_SIZE, sorted.length)}번 표시 · {current}/{totalPages} 페이지
        </p>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-md border border-line bg-white p-12 text-center">
            <p className="font-display text-[20px] font-bold text-ink-strong">
              조건에 맞는 단지가 없습니다
            </p>
            <p className="mt-3 text-[14px] text-ink-muted">검색어나 필터를 바꿔보세요.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((c) => (
              <li key={c.id} className="rounded-md border border-line bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          "inline-flex items-center border px-2.5 py-1 text-[11px] font-bold " +
                          (c.is_active
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-line bg-gray-100 text-ink-faint")
                        }
                      >
                        {c.is_active ? "현재 운영" : "과거"}
                      </span>
                      {c.type && (
                        <span className="inline-flex items-center border border-navy-700 bg-navy-900 px-2.5 py-1 text-[11px] font-bold text-white">
                          {c.type}
                        </span>
                      )}
                      {c.is_featured && (
                        <span className="inline-flex items-center border border-accent-500 bg-accent-50 px-2.5 py-1 text-[11px] font-bold text-accent-deep">
                          주요
                        </span>
                      )}
                      {c.image && (
                        <span className="inline-flex items-center border border-line bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-ink-faint">
                          사진
                        </span>
                      )}
                      <span className="font-mono-num text-[12px] text-ink-faint">
                        #{c.sort_order}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-[19px] font-bold tracking-tight text-ink-strong">
                      {c.name}
                    </p>
                    <p className="mt-1 text-[14px] text-ink-muted">
                      {c.region || "지역 미지정"}
                      {c.client ? ` · ${c.client}` : ""}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-faint">
                      {c.households != null ? `${c.households.toLocaleString()}세대` : "세대수 –"}
                      {c.area != null ? ` · ${c.area.toLocaleString()}㎡` : ""}
                      {c.period ? ` · ${c.period}` : ""}
                    </p>
                    {c.aliases.length > 0 && (
                      <p className="mt-1 text-[12px] text-ink-faint">별칭: {c.aliases.join(", ")}</p>
                    )}
                    <p className="mt-2 break-all font-mono-num text-[11px] text-ink-faint">
                      /cases/{c.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {c.is_active && (
                      <Link
                        href={`/cases/${c.slug}`}
                        className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
                      >
                        미리보기
                      </Link>
                    )}
                    <form action={toggleComplexActive}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-navy-700 hover:text-navy-700"
                      >
                        {c.is_active ? "과거로" : "현재로"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/content/complexes/${c.id}/edit`}
                      className="inline-flex h-9 items-center rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-navy-800"
                    >
                      수정
                    </Link>
                    <form action={deleteComplex}>
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmButton
                        message={`"${c.name}" 단지를 삭제하시겠습니까? /cases/${c.slug} 주소가 404가 됩니다. 되돌릴 수 없습니다.`}
                        className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-semibold text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        삭제
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="페이지 이동"
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <PageLink href={`/admin/content/complexes${qs({ page: current - 1 })}`} disabled={current === 1}>
              이전
            </PageLink>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - current) <= 2)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-2">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="text-[13px] text-ink-faint">…</span>
                  )}
                  <Link
                    href={`/admin/content/complexes${qs({ page: p })}`}
                    aria-current={p === current ? "page" : undefined}
                    className={
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 font-mono-num text-[13px] font-semibold transition-colors " +
                      (p === current
                        ? "border-navy-900 bg-navy-900 text-white"
                        : "border-line bg-white text-ink-muted hover:border-ink-strong hover:text-ink-strong")
                    }
                  >
                    {p}
                  </Link>
                </span>
              ))}
            <PageLink
              href={`/admin/content/complexes${qs({ page: current + 1 })}`}
              disabled={current === totalPages}
            >
              다음
            </PageLink>
          </nav>
        )}
      </Container>
    </section>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex h-9 items-center rounded-sm border px-3 text-[13px] font-semibold transition-colors ";
  if (disabled) {
    return (
      <span className={cls + "cursor-not-allowed border-line bg-gray-50 text-ink-placeholder"}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cls + "border-line bg-white text-ink-muted hover:border-ink-strong hover:text-ink-strong"}
    >
      {children}
    </Link>
  );
}
