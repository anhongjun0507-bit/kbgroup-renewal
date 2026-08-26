import "server-only";
import { unstable_cache } from "next/cache";
import { CONTENT_TAGS } from "@/lib/content/tags";
import {
  createContentReadClient,
  isKillSwitchOn,
  logFallback,
} from "@/lib/content/source";
import { BOARD_CONFIGS, BOARD_ORDER, type BoardConfig, type BoardType } from "@/lib/boards";

/**
 * 게시판 카테고리 오버레이 (PLAN B / DAY 9, ITEM 04 「게시판 카테고리 관리」).
 *
 * DAY 7 섹션 · DAY 8 메뉴와 같은 오버레이 원칙이다 — **코드가 원본, DB 는 그 위에 얹는다.**
 * 원본은 `lib/boards.ts` 의 `BOARD_CONFIGS` 4종(공지사항·갤러리·단지소식·자료실)이고,
 * DB 는 `site_settings.boardCategories` 한 행에 이름·설명만 담는다.
 * 값이 없으면 전환 전과 한 글자도 다르지 않다.
 *
 * **게시판 추가·삭제는 없다.** `posts.board_type` 이 CHECK 제약으로 4종에 묶여 있고,
 * 종류를 늘리면 기존 글의 스키마·라우트·첨부 정책까지 함께 건드려야 한다(지시 9-2 전제).
 * **순서·표시숨김도 여기서 다루지 않는다** — 방문자가 보는 게시판 목록은 헤더 「소식」
 * 드롭다운뿐이고 그건 이미 「메뉴 구성」(`nav_items`)이 관리한다. 두 출처를 만들지 않는다.
 *
 * 캐시 태그는 `content:boards` 하나. 게시판 페이지는 전부 `force-dynamic` 이라
 * 매 요청 렌더되므로 이 읽기는 캐시가 있어야 한다.
 */

/** DB 에 저장하는 오버레이 값. 키가 없거나 빈 문자열이면 코드 기본값이다. */
export type BoardCategoryOverride = {
  label?: string;
  subtitle?: string;
};

export type BoardCategoryMap = Partial<Record<BoardType, BoardCategoryOverride>>;

/** `site_settings` 의 키 이름. 어댑터(`lib/content/settings.ts`)의 파일 폴백 대상이 아니다. */
export const BOARD_CATEGORIES_KEY = "boardCategories";

const fetchFromDb = unstable_cache(
  async (): Promise<BoardCategoryMap> => {
    const supabase = createContentReadClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", BOARD_CATEGORIES_KEY)
      .maybeSingle();

    if (error) throw new Error(error.message);
    /* 행이 없는 것은 오류가 아니다 — 아직 아무것도 바꾸지 않은 정상 상태다. */
    return normalize(data?.value);
  },
  ["content", "boards", "all"],
  { tags: [CONTENT_TAGS.boards], revalidate: 3600 },
);

/** JSONB 스키마 드리프트 방어 (E-9) — 아는 게시판·아는 필드만 통과시킨다. */
function normalize(raw: unknown): BoardCategoryMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: BoardCategoryMap = {};
  for (const type of BOARD_ORDER) {
    const v = (raw as Record<string, unknown>)[type];
    if (!v || typeof v !== "object") continue;
    const label = (v as Record<string, unknown>).label;
    const subtitle = (v as Record<string, unknown>).subtitle;
    const entry: BoardCategoryOverride = {};
    if (typeof label === "string" && label.trim()) entry.label = label.trim();
    if (typeof subtitle === "string" && subtitle.trim()) entry.subtitle = subtitle.trim();
    if (Object.keys(entry).length > 0) out[type] = entry;
  }
  return out;
}

/** 오버레이 전체. 킬스위치·조회 실패는 빈 오버레이(= 코드 기본값)로 떨어진다. */
export async function getBoardCategories(): Promise<BoardCategoryMap> {
  if (isKillSwitchOn()) return {};
  try {
    return await fetchFromDb();
  } catch (e) {
    logFallback(BOARD_CATEGORIES_KEY, e);
    return {};
  }
}

/**
 * 오버레이를 얹은 게시판 설정 1건. 소비처는 `getBoardConfig()` 대신 이걸 쓴다.
 *
 * `subtitle` 은 **상세 페이지 히어로 문구**의 기본값이다. 목록 페이지는 페이지마다
 * 자기 문구를 갖고 있어서(공지사항만 다르다) 각 페이지가 `?? "…"` 로 기본값을 준다.
 */
export async function getBoardConfigWithOverride(
  type: BoardType,
): Promise<BoardConfig> {
  const map = await getBoardCategories();
  return applyOverride(BOARD_CONFIGS[type], map[type]);
}

export function applyOverride(
  config: BoardConfig,
  override: BoardCategoryOverride | undefined,
): BoardConfig {
  if (!override) return config;
  return {
    ...config,
    label: override.label ?? config.label,
    subtitle: override.subtitle ?? config.subtitle,
  };
}

/** 관리자가 설정한 설명(없으면 null). 목록 페이지가 자기 기본 문구와 합칠 때 쓴다. */
export async function getBoardSubtitleOverride(
  type: BoardType,
): Promise<string | null> {
  const map = await getBoardCategories();
  return map[type]?.subtitle ?? null;
}
