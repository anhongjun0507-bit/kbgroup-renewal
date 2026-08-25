import "server-only";
import { unstable_cache } from "next/cache";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { createContentReadClient, isKillSwitchOn, logFallback } from "@/lib/content/source";
import { PAGE_SECTIONS, type PageKey, type SectionMeta } from "./meta";

/**
 * `page_sections` 오버레이 읽기 (PLAN B / DAY 7).
 *
 * 레지스트리(코드)가 원본이고 DB 는 그 위에 얹는 표시·순서 오버레이다.
 * 행이 없으면 레지스트리 선언 순서 그대로, 전부 표시 — 즉 **전환 전과 동일한 화면**이다.
 * 조회 실패·킬스위치(`CONTENT_SOURCE=file`)도 같은 기본값으로 떨어진다.
 *
 * 테이블 전체가 수십 행 수준이라 페이지별로 캐시를 쪼개지 않고 한 엔트리로 잡는다.
 * 무효화는 `content:sections` 태그 하나 (E-12).
 */

export type SectionOverlayRow = { is_visible: boolean; sort_order: number };
export type PageOverlay = Record<string, SectionOverlayRow>;

const fetchOverlayFromDb = unstable_cache(
  async (): Promise<Record<string, PageOverlay>> => {
    const supabase = createContentReadClient();
    const { data, error } = await supabase
      .from("page_sections")
      .select("page_key, section_key, is_visible, sort_order");

    if (error) throw new Error(error.message);

    const out: Record<string, PageOverlay> = {};
    /* 빈 결과는 오류가 아니다 — 아직 아무것도 커스터마이즈하지 않은 정상 상태다. */
    for (const row of data ?? []) {
      (out[row.page_key] ??= {})[row.section_key] = {
        is_visible: row.is_visible,
        sort_order: row.sort_order,
      };
    }
    return out;
  },
  ["content", "sections", "all"],
  { tags: [CONTENT_TAGS.sections], revalidate: 3600 },
);

export async function getPageOverlay(page: PageKey): Promise<PageOverlay> {
  if (isKillSwitchOn()) return {};
  try {
    return (await fetchOverlayFromDb())[page] ?? {};
  } catch (e) {
    logFallback(`page_sections.${page}`, e);
    return {};
  }
}

/**
 * 레지스트리 + 오버레이 → 정렬된 섹션 목록(숨김 포함). 관리자 화면이 쓴다.
 *
 *  · 오버레이에 없는 섹션은 선언 순서(index)를 sort_order 로 본다.
 *  · 정렬 동률은 선언 순서로 깬다(안정 정렬 보장).
 */
export function orderSections(
  page: PageKey,
  overlay: PageOverlay,
): { section: SectionMeta; visible: boolean }[] {
  return PAGE_SECTIONS[page].sections
    .map((section, index) => ({ section, index, row: overlay[section.key] }))
    .sort(
      (a, b) =>
        (a.row?.sort_order ?? a.index) - (b.row?.sort_order ?? b.index) ||
        a.index - b.index,
    )
    .map(({ section, row }) => ({
      section,
      /* removable: false 는 is_visible=false 행이 있어도 무조건 표시한다. */
      visible: !section.removable || (row?.is_visible ?? true),
    }));
}

/** 실제로 그릴 섹션 목록. */
export function resolveSections(page: PageKey, overlay: PageOverlay): SectionMeta[] {
  return orderSections(page, overlay)
    .filter((s) => s.visible)
    .map((s) => s.section);
}
