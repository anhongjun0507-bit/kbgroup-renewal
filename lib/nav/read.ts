import "server-only";
import { unstable_cache } from "next/cache";
import type { SettingValue } from "@/lib/content";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  createContentReadClient,
  isKillSwitchOn,
  logFallback,
} from "@/lib/content/source";
import { getPublishedMap, isPublished } from "@/lib/pages/published";
import {
  BUSINESS_NAV_HREF,
  FOOTER_LEGAL,
  FOOTER_NAV_DEFAULT,
  HEADER_NAV_DEFAULT,
  type NavChild,
  type NavItem,
} from "./types";

/**
 * `nav_items` 읽기 (PLAN B / DAY 8, ITEM 03).
 *
 * 헤더/푸터 메뉴의 단일 출처. 행이 없거나 조회가 실패하면 `lib/nav/types.ts` 의
 * 기본값으로 떨어진다 — 전환 전 `Header.tsx`/`Footer.tsx` 상수와 같은 값이다.
 * 캐시 태그는 `content:nav` 하나. 루트 레이아웃이 매 요청 읽으므로 캐시가 필수다(E-14).
 */
export type NavRow = {
  id: string;
  parent_id: string | null;
  location: string;
  label: string;
  kr_label: string | null;
  href: string | null;
  sort_order: number;
  is_visible: boolean;
};

const fetchNavRows = unstable_cache(
  async (): Promise<NavRow[]> => {
    const supabase = createContentReadClient();
    const { data, error } = await supabase
      .from("nav_items")
      .select("id, parent_id, location, label, kr_label, href, sort_order, is_visible")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as NavRow[];
  },
  ["content", "nav", "all"],
  { tags: [CONTENT_TAGS.nav], revalidate: 3600 },
);

async function readNavRows(): Promise<NavRow[]> {
  if (isKillSwitchOn()) return [];
  try {
    return await fetchNavRows();
  } catch (e) {
    logFallback("nav_items", e);
    return [];
  }
}

/** 표시 중인 행만 부모/자식으로 조립. href 가 빈 행은 링크를 만들 수 없으므로 버린다. */
function buildFromRows(rows: NavRow[], location: string): NavItem[] {
  const visible = rows.filter((r) => r.is_visible && r.href);
  return visible
    .filter((r) => r.location === location && r.parent_id === null)
    .map((parent) => {
      const children: NavChild[] = visible
        .filter((r) => r.parent_id === parent.id)
        .map((c) => ({ label: c.label, href: c.href! }));
      return {
        label: parent.label,
        krLabel: parent.kr_label ?? parent.label,
        href: parent.href!,
        ...(children.length ? { children } : {}),
      };
    });
}

/** BUSINESS 하위는 항상 businessAreas 설정에서 파생한다(두 출처 방지 — types.ts 주석). */
function applyBusinessChildren(
  items: NavItem[],
  businessAreas: SettingValue<"businessAreas">,
): NavItem[] {
  return items.map((item) =>
    item.href === BUSINESS_NAV_HREF
      ? {
          ...item,
          children: businessAreas.map((b) => ({
            label: b.name,
            href: `/business/${b.slug}`,
          })),
        }
      : item,
  );
}

/** 비공개 페이지로 가는 항목 제거. 부모가 닫히면 하위 드롭다운째로 사라진다. */
function dropUnpublished(
  items: NavItem[],
  map: Record<string, boolean>,
): NavItem[] {
  return items
    .filter((item) => isPublished(map, item.href))
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((c) => isPublished(map, c.href)) }
        : item,
    );
}

/**
 * 루트 레이아웃이 한 번 호출해 Header/Footer 에 프롭으로 넣는다.
 * Header 는 `"use client"` 라 DB 를 직접 읽을 수 없다(E-2 — 내부 로직 무수정 원칙).
 */
export async function getSiteNav(
  businessAreas: SettingValue<"businessAreas">,
): Promise<{ header: NavItem[]; footer: NavItem[]; legal: NavChild[] }> {
  const [rows, published] = await Promise.all([readNavRows(), getPublishedMap()]);

  /* 기본값으로 떨어지는 조건은 "그 location 에 행이 아예 없을 때" 다.
     조립 결과가 비었는지로 판단하면 관리자가 전 항목을 숨겼을 때 기본 메뉴가 되살아난다. */
  const pick = (location: "header" | "footer", fallback: NavItem[]) =>
    rows.some((r) => r.location === location)
      ? buildFromRows(rows, location)
      : fallback;

  return {
    header: dropUnpublished(
      applyBusinessChildren(pick("header", HEADER_NAV_DEFAULT), businessAreas),
      published,
    ),
    footer: dropUnpublished(pick("footer", FOOTER_NAV_DEFAULT), published),
    legal: FOOTER_LEGAL.filter((l) => isPublished(published, l.href)),
  };
}
