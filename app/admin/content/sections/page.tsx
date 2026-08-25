import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { requireAdmin } from "@/lib/auth";
import { PAGE_KEYS, PAGE_PATHS, PAGE_SECTIONS } from "@/lib/sections/meta";
import { orderSections, type PageOverlay } from "@/lib/sections/overlay";
import { moveSection, toggleSectionVisibility } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 섹션 구성 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 섹션 구성 관리 (PLAN B / DAY 7, ITEM 02).
 *
 * 무엇을 그릴지는 코드 레지스트리(`lib/sections/meta.ts` + 각 페이지 `sections.tsx`)가 갖고,
 * 이 화면은 표시·숨김과 순서만 DB(`page_sections`)에 얹는다.
 * 순서 변경은 위/아래 화살표뿐이다 — 자유 DnD 는 범위 밖(PROGRESS §3).
 *
 * 관리자 화면은 캐시된 어댑터가 아니라 DB 를 직접 읽는다 — 저장 직후 최신 값이 보여야 한다.
 */

type Row = { page_key: string; section_key: string; is_visible: boolean; sort_order: number };

const ARROW_BTN =
  "inline-flex h-7 w-7 items-center justify-center rounded border border-line text-[12px] text-ink-strong transition-colors hover:border-accent-500 disabled:cursor-not-allowed disabled:opacity-30";

export default async function AdminSectionsPage() {
  const { supabase } = await requireAdmin("/admin/content/sections");

  const { data } = await supabase
    .from("page_sections")
    .select("page_key, section_key, is_visible, sort_order");

  const overlays: Record<string, PageOverlay> = {};
  for (const row of (data ?? []) as Row[]) {
    (overlays[row.page_key] ??= {})[row.section_key] = {
      is_visible: row.is_visible,
      sort_order: row.sort_order,
    };
  }

  const totalHidden = PAGE_KEYS.reduce(
    (n, page) =>
      n +
      PAGE_SECTIONS[page].sections.filter(
        (s) => s.removable && overlays[page]?.[s.key]?.is_visible === false,
      ).length,
    0,
  );

  return (
    <main className="py-10">
      <Container>
        <AdminTabs active="sections" />

        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-ink-strong">섹션 구성</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-ink-muted">
            페이지별로 섹션을 숨기거나 순서를 바꿉니다. 저장 즉시 공개 페이지에 반영됩니다.
            <br />
            <strong className="text-ink-strong">필수</strong> 표시된 섹션은 페이지가 성립하지
            않으므로 숨길 수 없습니다. 현재 숨김 처리된 섹션은 총{" "}
            <strong className="text-ink-strong">{totalHidden}개</strong>입니다.
          </p>
        </header>

        <div className="space-y-6">
          {PAGE_KEYS.map((page) => {
            const overlay = overlays[page] ?? {};
            const rows = orderSections(page, overlay);

            return (
              <section
                key={page}
                id={`page-${page.replace(/[^a-zA-Z0-9]/g, "-")}`}
                className="rounded-md border border-line bg-white"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
                  <h2 className="text-[17px] font-bold text-ink-strong">
                    {PAGE_SECTIONS[page].label}
                  </h2>
                  <Link
                    href={PAGE_PATHS[page]}
                    target="_blank"
                    className="font-mono-num text-[12px] text-ink-muted underline-offset-4 hover:text-ink-strong hover:underline"
                  >
                    {PAGE_PATHS[page]} ↗
                  </Link>
                </div>

                <ul className="divide-y divide-line">
                  {rows.map(({ section }, i) => {
                    const hidden =
                      section.removable && overlay[section.key]?.is_visible === false;

                    return (
                      <li
                        key={section.key}
                        className={
                          "flex flex-wrap items-center gap-3 px-5 py-3 " +
                          (hidden ? "bg-slate-50" : "")
                        }
                      >
                        <span className="font-mono-num w-6 text-[12px] text-ink-muted">
                          {i + 1}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={
                              "text-[14px] font-semibold " +
                              (hidden ? "text-ink-muted line-through" : "text-ink-strong")
                            }
                          >
                            {section.label}
                          </span>
                          <span className="font-mono-num ml-2 text-[11px] text-ink-muted">
                            {section.key}
                          </span>
                          {!section.removable && (
                            <span className="ml-2 rounded bg-navy-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                              필수
                            </span>
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          <form action={moveSection}>
                            <input type="hidden" name="page" value={page} />
                            <input type="hidden" name="section" value={section.key} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              className={ARROW_BTN}
                              disabled={i === 0}
                              aria-label={`${section.label} 위로`}
                            >
                              ▲
                            </button>
                          </form>
                          <form action={moveSection}>
                            <input type="hidden" name="page" value={page} />
                            <input type="hidden" name="section" value={section.key} />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              className={ARROW_BTN}
                              disabled={i === rows.length - 1}
                              aria-label={`${section.label} 아래로`}
                            >
                              ▼
                            </button>
                          </form>

                          {section.removable ? (
                            <form action={toggleSectionVisibility}>
                              <input type="hidden" name="page" value={page} />
                              <input type="hidden" name="section" value={section.key} />
                              <button
                                type="submit"
                                className={
                                  "ml-2 inline-flex h-7 min-w-[56px] items-center justify-center rounded border px-2 text-[12px] font-semibold transition-colors " +
                                  (hidden
                                    ? "border-line text-ink-muted hover:border-accent-500"
                                    : "border-accent-500 text-ink-strong")
                                }
                              >
                                {hidden ? "숨김" : "표시"}
                              </button>
                            </form>
                          ) : (
                            <span className="ml-2 inline-flex h-7 min-w-[56px] items-center justify-center rounded border border-dashed border-line px-2 text-[12px] text-ink-muted">
                              표시 고정
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
