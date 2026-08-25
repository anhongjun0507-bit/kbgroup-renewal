import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { requireAdmin } from "@/lib/auth";
import { PUBLIC_PAGES } from "@/lib/pages/registry";
import { togglePagePublished } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 페이지 공개 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 페이지 공개·비공개 관리 (PLAN B / DAY 8, ITEM 03).
 *
 * 목록은 코드 레지스트리(`lib/pages/registry.ts`)가 갖고, DB(`pages`)는 `is_published` 만 얹는다.
 * 비공개로 돌리면 ① 방문자에게 404 ② 헤더·푸터 메뉴에서 제외 ③ sitemap.xml 에서 제외 —
 * 세 가지가 함께 일어난다. 관리자는 그대로 열어볼 수 있고 상단에 배너가 뜬다.
 *
 * 관리자 화면은 캐시된 어댑터가 아니라 DB 를 직접 읽는다 — 저장 직후 최신 값이 보여야 한다.
 */
export default async function AdminPagesPage() {
  const { supabase } = await requireAdmin("/admin/content/pages");

  const { data, error } = await supabase.from("pages").select("path, is_published");

  const published: Record<string, boolean> = {};
  for (const row of data ?? []) published[row.path] = row.is_published;

  const hiddenCount = PUBLIC_PAGES.filter(
    (p) => p.togglable && published[p.path] === false,
  ).length;

  return (
    <main className="py-10">
      <Container>
        <AdminTabs active="pages" />

        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-ink-strong">페이지 공개</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-ink-muted">
            페이지를 비공개로 돌리면 방문자에게는 <strong className="text-ink-strong">404</strong>
            로 보이고, 헤더·푸터 메뉴와 사이트맵(sitemap.xml)에서도 함께 빠집니다. 다시 공개로
            돌리면 그대로 복구됩니다.
            <br />
            관리자는 비공개 페이지도 열어볼 수 있으며 화면 상단에 안내 배너가 표시됩니다.
            현재 비공개 페이지는 <strong className="text-ink-strong">{hiddenCount}개</strong>입니다.
          </p>
        </header>

        {error && (
          <p className="mb-6 rounded-md border border-red-300 bg-red-50 px-5 py-4 text-[14px] text-red-700">
            페이지 목록을 불러오지 못했습니다: {error.message}
          </p>
        )}

        <section className="rounded-md border border-line bg-white">
          <ul className="divide-y divide-line">
            {PUBLIC_PAGES.map((page) => {
              const isPublic = published[page.path] ?? true;
              return (
                <li
                  key={page.path}
                  id={`page-${page.path.replace(/[^a-zA-Z0-9]/g, "-")}`}
                  data-published={isPublic ? "true" : "false"}
                  className={
                    "flex flex-wrap items-center gap-3 px-5 py-3 " +
                    (isPublic ? "" : "bg-slate-50")
                  }
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={
                        "text-[14px] font-semibold " +
                        (isPublic ? "text-ink-strong" : "text-ink-muted line-through")
                      }
                    >
                      {page.label}
                    </span>
                    <Link
                      href={page.path}
                      target="_blank"
                      className="font-mono-num ml-2 text-[12px] text-ink-muted underline-offset-4 hover:text-ink-strong hover:underline"
                    >
                      {page.path} ↗
                    </Link>
                    {!page.togglable && (
                      <span className="ml-2 rounded bg-navy-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        필수
                      </span>
                    )}
                  </span>

                  {page.togglable ? (
                    <form action={togglePagePublished}>
                      <input type="hidden" name="path" value={page.path} />
                      <button
                        type="submit"
                        className={
                          "inline-flex h-7 min-w-[64px] items-center justify-center rounded border px-2 text-[12px] font-semibold transition-colors " +
                          (isPublic
                            ? "border-accent-500 text-ink-strong"
                            : "border-line text-ink-muted hover:border-accent-500")
                        }
                      >
                        {isPublic ? "공개" : "비공개"}
                      </button>
                    </form>
                  ) : (
                    <span className="inline-flex h-7 min-w-[64px] items-center justify-center rounded border border-dashed border-line px-2 text-[12px] text-ink-muted">
                      공개 고정
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </Container>
    </main>
  );
}
