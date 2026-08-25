import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { requireAdmin } from "@/lib/auth";
import { BUSINESS_NAV_HREF } from "@/lib/nav/types";
import { moveNavItem, renameNavItem, toggleNavVisibility } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 메뉴 구성 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 메뉴 구성 관리 (PLAN B / DAY 8, ITEM 03).
 *
 * 헤더 상단 메뉴와 푸터 SITEMAP 열이 같은 `nav_items` 테이블을 본다.
 * 할 수 있는 것: 이름 변경(영문 label / 한글 kr_label) · 위·아래 순서 · 표시·숨김.
 * 하지 않는 것: 경로(href) 편집 · 항목 추가·삭제 · 자유 DnD — 전부 계약 범위 밖(PROGRESS §3).
 *
 * 관리자 화면은 캐시된 어댑터가 아니라 DB 를 직접 읽는다 — 저장 직후 최신 값이 보여야 한다.
 */

type Row = {
  id: string;
  parent_id: string | null;
  location: string;
  label: string;
  kr_label: string | null;
  href: string | null;
  sort_order: number;
  is_visible: boolean;
};

const LOCATIONS = [
  {
    key: "header",
    title: "헤더 상단 메뉴",
    desc: "사이트 최상단 GNB. 하위 항목은 드롭다운으로 나옵니다.",
  },
  {
    key: "footer",
    title: "푸터 SITEMAP",
    desc: "푸터 가운데 SITEMAP 열. 회사 정보·연락처는 「사이트 설정」에서, 개인정보처리방침·이용약관 링크는 「페이지 공개」에서 관리합니다.",
  },
] as const;

const ARROW_BTN =
  "inline-flex h-7 w-7 items-center justify-center rounded border border-line text-[12px] text-ink-strong transition-colors hover:border-accent-500 disabled:cursor-not-allowed disabled:opacity-30";
const INPUT =
  "h-8 rounded border border-line px-2 text-[13px] text-ink-strong focus:border-accent-500 focus:outline-none";

export default async function AdminNavPage() {
  const { supabase } = await requireAdmin("/admin/content/nav");

  const { data, error } = await supabase
    .from("nav_items")
    .select("id, parent_id, location, label, kr_label, href, sort_order, is_visible")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  const rows = (data ?? []) as Row[];

  function renderRow(row: Row, index: number, siblings: Row[], depth: number) {
    const hidden = !row.is_visible;
    return (
      <li
        key={row.id}
        id={`nav-${row.id}`}
        data-visible={row.is_visible ? "true" : "false"}
        className={
          "flex flex-wrap items-center gap-2 px-5 py-3 " + (hidden ? "bg-slate-50 " : "")
        }
        style={{ paddingLeft: 20 + depth * 24 }}
      >
        <span className="font-mono-num w-6 text-[12px] text-ink-muted">{index + 1}</span>

        <form action={renameNavItem} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={row.id} />
          <input
            name="label"
            defaultValue={row.label}
            required
            maxLength={100}
            aria-label="메뉴 이름 (영문)"
            className={`${INPUT} w-[150px] font-semibold uppercase`}
          />
          <input
            name="kr_label"
            defaultValue={row.kr_label ?? ""}
            maxLength={100}
            placeholder="한글 라벨 (선택)"
            aria-label="메뉴 이름 (한글)"
            className={`${INPUT} w-[150px]`}
          />
          <span className="font-mono-num text-[12px] text-ink-muted">{row.href}</span>
          <button
            type="submit"
            className="h-8 rounded border border-line px-3 text-[12px] font-semibold text-ink-strong transition-colors hover:border-accent-500"
          >
            저장
          </button>
        </form>

        <span className="flex items-center gap-1">
          <form action={moveNavItem}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="direction" value="up" />
            <button type="submit" className={ARROW_BTN} disabled={index === 0} aria-label={`${row.label} 위로`}>
              ▲
            </button>
          </form>
          <form action={moveNavItem}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="direction" value="down" />
            <button
              type="submit"
              className={ARROW_BTN}
              disabled={index === siblings.length - 1}
              aria-label={`${row.label} 아래로`}
            >
              ▼
            </button>
          </form>
          <form action={toggleNavVisibility}>
            <input type="hidden" name="id" value={row.id} />
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
        </span>
      </li>
    );
  }

  return (
    <main className="py-10">
      <Container>
        <AdminTabs active="nav" />

        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-ink-strong">메뉴 구성</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-ink-muted">
            상단 메뉴와 푸터 링크의 이름·순서·표시 여부를 바꿉니다. 저장 즉시 반영됩니다.
            <br />
            연결 경로(주소)는 바꿀 수 없습니다 — 실제로 존재하는 페이지만 가리키게 하기 위해서입니다.
            비공개로 돌린 페이지를 가리키는 항목은 자동으로 메뉴에서 빠집니다.
          </p>
        </header>

        {error && (
          <p className="mb-6 rounded-md border border-red-300 bg-red-50 px-5 py-4 text-[14px] text-red-700">
            메뉴를 불러오지 못했습니다: {error.message}
          </p>
        )}

        {!error && rows.length === 0 && (
          <p className="mb-6 rounded-md border border-line bg-bg-soft px-5 py-4 text-[14px] text-ink-muted">
            등록된 메뉴 행이 없습니다. 이 경우 사이트는 코드 기본값(전환 전과 동일한 메뉴)으로
            표시됩니다. <span className="font-mono-num">node scripts/seed-nav-pages.ts</span> 로
            기본 메뉴를 넣으면 여기서 편집할 수 있습니다.
          </p>
        )}

        <div className="space-y-6">
          {LOCATIONS.map((loc) => {
            const parents = rows.filter((r) => r.location === loc.key && !r.parent_id);
            return (
              <section
                key={loc.key}
                id={`nav-${loc.key}`}
                className="rounded-md border border-line bg-white"
              >
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-[17px] font-bold text-ink-strong">{loc.title}</h2>
                  <p className="mt-1 text-[13px] text-ink-muted">{loc.desc}</p>
                </div>

                <ul className="divide-y divide-line">
                  {parents.map((parent, i) => {
                    const children = rows.filter((r) => r.parent_id === parent.id);
                    return (
                      <Fragment key={parent.id}>
                        {renderRow(parent, i, parents, 0)}
                        {parent.href === BUSINESS_NAV_HREF && (
                          <li className="px-5 py-2 pl-12 text-[12px] text-ink-muted">
                            하위 항목(사업영역 5종)은{" "}
                            <Link
                              href="/admin/content/settings"
                              className="underline underline-offset-2 hover:text-ink-strong"
                            >
                              사이트 설정 · 사업영역
                            </Link>{" "}
                            에서 관리합니다. 같은 목록을 두 곳에 두지 않기 위해서입니다.
                          </li>
                        )}
                        {children.map((child, ci) => renderRow(child, ci, children, 1))}
                      </Fragment>
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
