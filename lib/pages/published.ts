import "server-only";
import { unstable_cache } from "next/cache";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  createContentReadClient,
  isKillSwitchOn,
  logFallback,
} from "@/lib/content/source";
import { PUBLIC_PAGE_PATHS } from "./registry";

/**
 * `pages` 공개 여부 읽기 (PLAN B / DAY 8).
 *
 * 레지스트리(코드)가 원본, DB 는 `is_published` 오버레이다.
 * 행이 없으면 공개 — 조회 실패·킬스위치(`CONTENT_SOURCE=file`)도 같은 기본값으로 떨어진다.
 * 테이블이 14행 수준이라 경로별로 쪼개지 않고 한 엔트리로 캐시한다. 태그는 `content:pages` 하나.
 *
 * **미들웨어에서는 쓰지 않는다.** 엣지에서 전 요청마다 DB 를 때리게 되고,
 * 페이지 레벨 `notFound()` 로 충분하다(§8-3 지시).
 */
const fetchPagesFromDb = unstable_cache(
  async (): Promise<Record<string, boolean>> => {
    const supabase = createContentReadClient();
    const { data, error } = await supabase.from("pages").select("path, is_published");
    if (error) throw new Error(error.message);

    const out: Record<string, boolean> = {};
    /* 빈 결과는 오류가 아니다 — 아직 아무것도 닫지 않은 정상 상태다. */
    for (const row of data ?? []) out[row.path] = row.is_published;
    return out;
  },
  ["content", "pages", "all"],
  { tags: [CONTENT_TAGS.pages], revalidate: 3600 },
);

/** 경로 → 공개 여부. 레지스트리에 없는 경로는 담기지 않는다(= 항상 공개로 취급). */
export async function getPublishedMap(): Promise<Record<string, boolean>> {
  if (isKillSwitchOn()) return {};
  try {
    return await fetchPagesFromDb();
  } catch (e) {
    logFallback("pages", e);
    return {};
  }
}

/** 메뉴·사이트맵 필터용. 레지스트리 밖 경로(상세 라우트 등)는 true. */
export function isPublished(
  map: Record<string, boolean>,
  path: string,
): boolean {
  if (!PUBLIC_PAGE_PATHS.has(path)) return true;
  return map[path] ?? true;
}
