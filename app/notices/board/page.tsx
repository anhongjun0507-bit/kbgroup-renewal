import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "자유게시판 | (주)케이비개발",
  description: "회원 누구나 자유롭게 글을 남길 수 있는 자유게시판입니다.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d
    .toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: rawPage, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { user, supabase } = await getViewer();

  let query = supabase
    .from("posts")
    .select(
      "id, post_number, title, author_name, created_at, view_count, is_pinned",
      { count: "exact" },
    )
    .eq("board_type", "free");
  if (q) query = query.ilike("title", `%${q}%`);
  query = query
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: posts, count } = await query;
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const list = posts ?? [];

  const writeHref = user
    ? "/notices/board/new"
    : "/login?next=/notices/board/new";

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/notices/board?${s}` : "/notices/board";
  };

  return (
    <>
      <PageHero
        kicker="COMMUNITY · 자유게시판"
        title="자유게시판"
        italicWord="자유"
        subtitle="회원 누구나 자유롭게 의견을 남길 수 있는 공간입니다. 따뜻한 소통을 부탁드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "BOARD" },
        ]}
      />

      <section className="section bg-white">
        <Container>
          {/* 상단 바 — 검색 + 글쓰기 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] text-ink-muted">
              총{" "}
              <span className="font-semibold text-ink-strong">{total}</span>개의
              글{q && <> · &ldquo;{q}&rdquo; 검색 결과</>}
            </p>

            <div className="flex items-center gap-3">
              <form method="get" action="/notices/board" className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20L16.65 16.65" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="제목 검색"
                  aria-label="게시글 검색"
                  className="h-11 w-full rounded-sm border border-line bg-white pl-10 pr-3 text-[15px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none sm:w-56"
                />
              </form>
              <Link
                href={writeHref}
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-sm bg-accent-500 px-5 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                글쓰기
              </Link>
            </div>
          </div>

          {/* 목록 헤더 (데스크탑) */}
          <div className="mt-8 hidden grid-cols-[72px_1fr_140px_110px_72px] items-center gap-4 border-y-2 border-ink-strong px-2 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted md:grid">
            <span className="text-center">번호</span>
            <span>제목</span>
            <span className="text-center">작성자</span>
            <span className="text-center">날짜</span>
            <span className="text-center">조회</span>
          </div>

          {list.length > 0 ? (
            <ul className="border-t border-line md:border-t-0">
              {list.map((p) => (
                <li
                  key={p.id}
                  className={
                    "border-b border-line " + (p.is_pinned ? "bg-accent-50/40" : "")
                  }
                >
                  <Link
                    href={`/notices/board/${p.id}`}
                    className="group block px-2 py-4 transition-colors hover:bg-gray-50 md:grid md:grid-cols-[72px_1fr_140px_110px_72px] md:items-center md:gap-4 md:py-3.5"
                  >
                    {/* 번호 */}
                    <span className="hidden text-center md:block">
                      {p.is_pinned ? (
                        <span className="inline-flex items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                          공지
                        </span>
                      ) : (
                        <span className="font-mono-num text-[13px] text-ink-faint">
                          {p.post_number}
                        </span>
                      )}
                    </span>

                    {/* 제목 */}
                    <span className="block min-w-0">
                      <span className="flex items-center gap-2">
                        {p.is_pinned && (
                          <span className="inline-flex shrink-0 items-center rounded-sm bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-navy-900 md:hidden">
                            공지
                          </span>
                        )}
                        <span className="truncate font-display text-[16px] font-bold tracking-tight text-ink-strong transition-colors group-hover:text-accent-deep md:text-[15px] md:font-semibold">
                          {p.title}
                        </span>
                      </span>
                      {/* 모바일 메타 */}
                      <span className="mt-1.5 flex items-center gap-2 text-[12px] text-ink-faint md:hidden">
                        <span>{p.author_name ?? "회원"}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">
                          {formatDate(p.created_at)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">조회 {p.view_count}</span>
                      </span>
                    </span>

                    {/* 작성자 (데스크탑) */}
                    <span className="hidden truncate text-center text-[13px] text-ink-muted md:block">
                      {p.author_name ?? "회원"}
                    </span>
                    {/* 날짜 (데스크탑) */}
                    <span className="hidden text-center font-mono-num text-[13px] text-ink-faint md:block">
                      {formatDate(p.created_at)}
                    </span>
                    {/* 조회 (데스크탑) */}
                    <span className="hidden text-center font-mono-num text-[13px] text-ink-faint md:block">
                      {p.view_count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-px rounded-md border border-line bg-gray-50 px-6 py-20 text-center">
              <div className="mx-auto h-10 w-10 text-accent-500" aria-hidden="true">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 10h24v18H18l-6 5v-5H8z" />
                  <path d="M14 17h12M14 22h8" />
                </svg>
              </div>
              <p className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink-strong">
                {q ? "검색 결과가 없습니다" : "아직 작성된 글이 없습니다"}
              </p>
              <p className="mt-3 text-[14px] text-ink-muted">
                {q
                  ? "다른 검색어로 다시 시도해 주세요."
                  : "첫 글의 주인공이 되어보세요!"}
              </p>
              <div className="mt-7">
                <Link
                  href={writeHref}
                  className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-colors hover:bg-accent-600"
                >
                  글쓰기 →
                </Link>
              </div>
            </div>
          )}

          {/* 페이지네이션 */}
          {pageCount > 1 && (
            <nav
              aria-label="게시판 페이지네이션"
              className="mt-10 flex items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  href={pageHref(page - 1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-strong transition-colors hover:border-navy-700"
                  aria-label="이전 페이지"
                >
                  ←
                </Link>
              )}
              {Array.from({ length: pageCount }).map((_, i) => {
                const p = i + 1;
                const active = p === page;
                return (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={active ? "page" : undefined}
                    className={
                      "inline-flex h-10 w-10 items-center justify-center rounded-sm font-mono-num text-[13px] font-semibold transition-colors " +
                      (active
                        ? "bg-navy-800 text-white"
                        : "border border-line text-ink-strong hover:border-navy-700")
                    }
                  >
                    {p}
                  </Link>
                );
              })}
              {page < pageCount && (
                <Link
                  href={pageHref(page + 1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line text-ink-strong transition-colors hover:border-navy-700"
                  aria-label="다음 페이지"
                >
                  →
                </Link>
              )}
            </nav>
          )}
        </Container>
      </section>
    </>
  );
}
