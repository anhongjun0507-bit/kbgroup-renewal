import "server-only";
import { unstable_cache } from "next/cache";
import { CONTENT_TAGS } from "./tags";
import { FILE_SETTINGS, type SettingKey, type SettingValue } from "./file-source";
import { createContentReadClient, isKillSwitchOn, logFallback } from "./source";

/**
 * site_settings 읽기 어댑터.
 *
 * 17키 전체가 수 KB 수준이라 키별로 캐시를 쪼개지 않고 한 엔트리로 잡는다.
 * 무효화도 `content:settings` 태그 하나로 끝난다.
 */

const fetchSettingsFromDb = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const supabase = createContentReadClient();
    const { data, error } = await supabase.from("site_settings").select("key, value");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("site_settings 결과가 비어 있음");

    const map: Record<string, unknown> = {};
    for (const row of data) map[row.key] = row.value;
    return map;
  },
  ["content", "settings", "all"],
  { tags: [CONTENT_TAGS.settings], revalidate: 3600 },
);

async function loadSettings(): Promise<Record<string, unknown>> {
  if (isKillSwitchOn()) return FILE_SETTINGS as unknown as Record<string, unknown>;
  try {
    return await fetchSettingsFromDb();
  } catch (e) {
    logFallback("site_settings", e);
    return FILE_SETTINGS as unknown as Record<string, unknown>;
  }
}

/**
 * 설정 1건. DB 에 해당 키가 없거나 값이 null 이면 파일 값으로 폴백한다 (E-9).
 * 반환 타입은 파일 원본의 타입을 그대로 물려받는다.
 */
export async function getSetting<K extends SettingKey>(
  key: K,
): Promise<SettingValue<K>> {
  const map = await loadSettings();
  const value = map[key];
  if (value === undefined || value === null) {
    if (!isKillSwitchOn()) {
      logFallback(`site_settings.${key}`, "키 없음");
    }
    return FILE_SETTINGS[key];
  }
  return value as SettingValue<K>;
}

/** 17키 전체. 관리자 설정 화면처럼 한 번에 다 필요한 곳에서 쓴다. */
export async function getSettings(): Promise<typeof FILE_SETTINGS> {
  const map = await loadSettings();
  const out = { ...FILE_SETTINGS } as Record<string, unknown>;
  for (const key of Object.keys(FILE_SETTINGS)) {
    const v = map[key];
    if (v !== undefined && v !== null) out[key] = v;
  }
  return out as typeof FILE_SETTINGS;
}

export type { SettingKey, SettingValue };
