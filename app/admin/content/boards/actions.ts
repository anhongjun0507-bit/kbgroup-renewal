"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { BOARD_CONFIGS, BOARD_ORDER, isBoardType } from "@/lib/boards";
import {
  BOARD_CATEGORIES_KEY,
  type BoardCategoryMap,
  type BoardCategoryOverride,
} from "@/lib/board-categories";

/**
 * 게시판 카테고리 편집 Server Action (PLAN B / DAY 9, ITEM 04).
 *
 * 편집 대상은 **이름·설명 두 가지뿐**이다. 게시판 추가·삭제는 `posts.board_type` CHECK
 * 제약과 첨부 정책·라우트에 묶여 있어 범위 밖이고(지시 9-2 「기존 글이 깨지는 스키마 변경 금지」),
 * 순서·표시숨김은 「메뉴 구성」(`nav_items`)이 이미 갖고 있다 — 두 출처를 만들지 않는다.
 *
 * 저장 형식은 오버레이다. 코드 기본값과 같은 값이면 **키를 아예 넣지 않는다** —
 * 그래야 나중에 코드 문구가 바뀌어도 옛 값이 유령처럼 남지 않는다.
 * 저장 전 직전 값을 `content_revisions` 에 남긴다(롤백 레벨 1, 복구 UI 대상).
 */

export type BoardsFormState = {
  ok: string | null;
  error: string | null;
};

function readOverride(fd: FormData, prefix: string, fallbackLabel: string, fallbackSubtitle: string) {
  const label = String(fd.get(`${prefix}_label`) ?? "").trim();
  const subtitle = String(fd.get(`${prefix}_subtitle`) ?? "").trim();
  const out: BoardCategoryOverride = {};
  if (label && label !== fallbackLabel) out.label = label;
  if (subtitle && subtitle !== fallbackSubtitle) out.subtitle = subtitle;
  return out;
}

export async function saveBoardCategories(
  _prev: BoardsFormState,
  formData: FormData,
): Promise<BoardsFormState> {
  const { supabase, user } = await requireAdmin("/admin/content/boards");

  const next: BoardCategoryMap = {};
  for (const type of BOARD_ORDER) {
    if (!isBoardType(type)) continue;
    const base = BOARD_CONFIGS[type];
    const entry = readOverride(formData, type, base.label, base.subtitle);
    if (Object.keys(entry).length > 0) next[type] = entry;
  }

  for (const type of BOARD_ORDER) {
    const label = next[type]?.label;
    if (label && label.length > 40) {
      return { ok: null, error: "게시판 이름은 40자 이내로 입력해주세요." };
    }
  }

  const { data: current } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .eq("key", BOARD_CATEGORIES_KEY)
    .maybeSingle();

  if (current) {
    const { error: revError } = await supabase.from("content_revisions").insert({
      table_name: "site_settings",
      record_id: BOARD_CATEGORIES_KEY,
      snapshot: current as never,
      actor_id: user.id,
    });
    if (revError)
      console.error("[boards] content_revisions 적재 실패:", revError.message);
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: BOARD_CATEGORIES_KEY, value: next as never }, { onConflict: "key" });

  if (error) {
    console.error("[boards] 저장 실패:", error.message);
    return { ok: null, error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  /* 게시판 이름·설명은 site_settings 행이지만 소비처가 다른 캐시 엔트리를 본다.
     설정 화면(getSettings)과 게시판 오버레이 양쪽을 함께 무효화한다. */
  updateTag(CONTENT_TAGS.boards);
  updateTag(CONTENT_TAGS.settings);

  const changed = Object.keys(next).length;
  return {
    ok:
      changed === 0
        ? "기본값으로 되돌렸습니다."
        : `저장했습니다. (기본값과 다른 게시판 ${changed}개)`,
    error: null,
  };
}
