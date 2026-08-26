import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { settingLabel } from "./labels";

/**
 * 변경 이력(`content_revisions`) 읽기 + 복원 (PLAN B / DAY 9, 지시 9-3).
 *
 * 적재는 각 Server Action 이 저장 **직전** 값으로 한다(DAY 3·4 부터 이미 동작 중).
 * 여기서는 그 스냅샷을 되돌리는 쪽만 다룬다.
 *
 * 복원 규약 — **복원 자체도 새 리비전을 남긴다.** 되돌린 뒤 "역시 아까가 맞았다"고
 * 다시 되돌릴 수 있어야 하기 때문이다(지시 9-3). 그래서 복원은
 * ① 지금 값을 스냅샷으로 적재 → ② 스냅샷 값으로 덮어쓰기 순서로만 실행한다.
 *
 * 대상은 `complexes` · `site_settings` 두 테이블이다. 그 외 table_name 이 들어오면 거부한다.
 * (`content_revisions` 는 table_name 이 text 라 무엇이든 담길 수 있다)
 */

type Supabase = SupabaseClient<Database>;

export const RESTORABLE_TABLES = ["site_settings", "complexes"] as const;
export type RestorableTable = (typeof RESTORABLE_TABLES)[number];

export function isRestorableTable(v: string): v is RestorableTable {
  return (RESTORABLE_TABLES as readonly string[]).includes(v);
}

export const TABLE_LABELS: Record<RestorableTable, string> = {
  site_settings: "사이트 설정",
  complexes: "단지",
};

/** 복원 시 절대 덮어쓰지 않는 컬럼. slug 는 불변(E-1), 나머지는 DB 가 관리한다. */
const COMPLEX_SKIP = new Set(["id", "slug", "created_at", "updated_at"]);

export type RevisionRow = {
  id: string;
  table_name: string;
  record_id: string;
  snapshot: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
};

export type RevisionGroup = {
  table: string;
  recordId: string;
  /** 사람이 읽는 이름 (설정 키 → 한글 라벨, 단지 → 단지명) */
  label: string;
  count: number;
  latestAt: string;
  /** 대상 레코드가 지금도 존재하는가. false = 삭제된 뒤라 복원이 곧 되살리기다. */
  exists: boolean;
};

/* ── 읽기 ──────────────────────────────────────────────────────────────── */

/** 레코드 단위로 묶은 이력 목록. 최근에 바뀐 레코드가 위로 온다. */
export async function listRevisionGroups(
  supabase: Supabase,
): Promise<RevisionGroup[]> {
  const { data } = await supabase
    .from("content_revisions")
    .select("table_name, record_id, created_at, snapshot")
    .order("created_at", { ascending: false });

  const groups = new Map<string, RevisionGroup>();
  for (const r of data ?? []) {
    if (!isRestorableTable(r.table_name)) continue;
    const key = `${r.table_name}::${r.record_id}`;
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      continue;
    }
    groups.set(key, {
      table: r.table_name,
      recordId: r.record_id,
      label: labelOf(r.table_name, r.record_id, r.snapshot as Record<string, unknown>),
      count: 1,
      latestAt: r.created_at,
      exists: true,
    });
  }

  const list = [...groups.values()];
  await markExistence(supabase, list);
  return list;
}

/** 삭제된 레코드는 「복원 = 되살리기」라 화면에서 구분해 보여줘야 한다. */
async function markExistence(supabase: Supabase, groups: RevisionGroup[]) {
  const complexIds = groups.filter((g) => g.table === "complexes").map((g) => g.recordId);
  const settingKeys = groups.filter((g) => g.table === "site_settings").map((g) => g.recordId);

  const [complexes, settings] = await Promise.all([
    complexIds.length
      ? supabase.from("complexes").select("id").in("id", complexIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    settingKeys.length
      ? supabase.from("site_settings").select("key").in("key", settingKeys)
      : Promise.resolve({ data: [] as { key: string }[] }),
  ]);

  const alive = new Set<string>([
    ...(complexes.data ?? []).map((r) => `complexes::${r.id}`),
    ...(settings.data ?? []).map((r) => `site_settings::${r.key}`),
  ]);
  for (const g of groups) g.exists = alive.has(`${g.table}::${g.recordId}`);
}

/** 한 레코드의 스냅샷 목록 (최신순). 트리거가 레코드당 20개로 잘라 둔다. */
export async function listRevisions(
  supabase: Supabase,
  table: RestorableTable,
  recordId: string,
): Promise<RevisionRow[]> {
  const { data } = await supabase
    .from("content_revisions")
    .select("id, table_name, record_id, snapshot, actor_id, created_at")
    .eq("table_name", table)
    .eq("record_id", recordId)
    .order("created_at", { ascending: false });
  return (data ?? []) as RevisionRow[];
}

/** actor_id → 표시명. profiles 를 한 번만 조회해 매핑한다. */
export async function resolveActors(
  supabase: Supabase,
  ids: (string | null)[],
): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((v): v is string => Boolean(v)))];
  if (unique.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .in("id", unique);
  const out: Record<string, string> = {};
  for (const p of data ?? []) out[p.id] = p.display_name || p.email;
  return out;
}

export function labelOf(
  table: string,
  recordId: string,
  snapshot: Record<string, unknown>,
): string {
  if (table === "site_settings") return settingLabel(String(snapshot.key ?? recordId));
  if (table === "complexes") return String(snapshot.name ?? recordId);
  return recordId;
}

/* ── 복원 ──────────────────────────────────────────────────────────────── */

export type RestoreResult = { ok: string } | { error: string };

/**
 * 스냅샷 1건을 되돌린다. 복원 직전 값도 새 리비전으로 남긴다.
 *
 * 대상 레코드가 이미 지워졌으면 원래 id·slug 그대로 다시 넣는다 — 단지를 잘못 지웠을 때의
 * 복구 경로다. 기존 URL(`/cases/[slug]`)까지 그대로 살아난다(E-1).
 */
export async function restoreRevision(
  supabase: Supabase,
  revisionId: string,
  actorId: string,
): Promise<RestoreResult> {
  const { data: rev } = await supabase
    .from("content_revisions")
    .select("id, table_name, record_id, snapshot")
    .eq("id", revisionId)
    .maybeSingle();

  if (!rev) return { error: "복원할 이력을 찾을 수 없습니다." };
  if (!isRestorableTable(rev.table_name))
    return { error: `복원을 지원하지 않는 항목입니다: ${rev.table_name}` };

  const snapshot = rev.snapshot as Record<string, unknown>;

  if (rev.table_name === "site_settings") {
    return restoreSetting(supabase, rev.record_id, snapshot, actorId);
  }
  return restoreComplex(supabase, rev.record_id, snapshot, actorId);
}

async function snapshotCurrent(
  supabase: Supabase,
  table: RestorableTable,
  recordId: string,
  row: Record<string, unknown>,
  actorId: string,
) {
  const { error } = await supabase.from("content_revisions").insert({
    table_name: table,
    record_id: recordId,
    snapshot: row as never,
    actor_id: actorId,
  });
  if (error) console.error("[revisions] 복원 전 스냅샷 적재 실패:", error.message);
}

async function restoreSetting(
  supabase: Supabase,
  key: string,
  snapshot: Record<string, unknown>,
  actorId: string,
): Promise<RestoreResult> {
  if (!("value" in snapshot))
    return { error: "이력에 설정 값이 없어 복원할 수 없습니다." };

  const { data: current } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (current)
    await snapshotCurrent(supabase, "site_settings", key, current as Record<string, unknown>, actorId);

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: snapshot.value as never }, { onConflict: "key" });

  if (error) {
    console.error("[revisions] site_settings 복원 실패:", error.message);
    return { error: "복원 중 오류가 발생했습니다." };
  }
  return { ok: `${settingLabel(key)}을(를) 되돌렸습니다.` };
}

async function restoreComplex(
  supabase: Supabase,
  id: string,
  snapshot: Record<string, unknown>,
  actorId: string,
): Promise<RestoreResult> {
  const { data: current } = await supabase
    .from("complexes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(snapshot)) {
    if (COMPLEX_SKIP.has(k)) continue;
    payload[k] = v;
  }

  if (!current) {
    /* 삭제된 단지 되살리기 — id·slug 를 원래 값으로 넣어야 URL 이 그대로 살아난다. */
    const { error } = await supabase
      .from("complexes")
      .insert({ ...payload, id, slug: snapshot.slug } as never);
    if (error) {
      console.error("[revisions] complexes 복구 실패:", error.message);
      return { error: "삭제된 단지를 되살리지 못했습니다." };
    }
    return { ok: `삭제됐던 단지 「${String(snapshot.name ?? id)}」을(를) 되살렸습니다.` };
  }

  await snapshotCurrent(supabase, "complexes", id, current as Record<string, unknown>, actorId);

  const { error } = await supabase.from("complexes").update(payload as never).eq("id", id);
  if (error) {
    console.error("[revisions] complexes 복원 실패:", error.message);
    return { error: "복원 중 오류가 발생했습니다." };
  }
  return { ok: `단지 「${String(snapshot.name ?? id)}」을(를) 되돌렸습니다.` };
}
