/**
 * scripts/seed-page-sections.ts — PLAN B / DAY 7
 *
 * 섹션 레지스트리(`lib/sections/meta.ts`)의 **현재 배치 그대로** page_sections 에 시드한다.
 *   is_visible = true, sort_order = 레지스트리 선언 순서(0..n-1)
 *
 * 행이 없어도 렌더러는 같은 결과를 그리므로(오버레이가 없으면 레지스트리 기본값) 이 시드는
 * "관리자 화면이 처음부터 실제 행을 보여주게" 하는 용도다. 재실행해도 안전하다(upsert).
 *
 * 실행:
 *   node scripts/seed-page-sections.ts              # 시드 + 검증
 *   node scripts/seed-page-sections.ts --dry-run    # 쓰지 않고 계획만
 *   node scripts/seed-page-sections.ts --verify-only
 *
 * 쓰기는 service_role 키로 RLS 를 우회한다. 이 키는 서버 전용이며 NEXT_PUBLIC_ 접두사가 아니다.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PAGE_SECTIONS } from "../lib/sections/meta.ts";

function loadEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  let raw = "";
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...loadEnvLocal(), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "[seed] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (.env.local).",
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DRY_RUN = process.argv.includes("--dry-run");
const VERIFY_ONLY = process.argv.includes("--verify-only");

type SeedRow = {
  page_key: string;
  section_key: string;
  is_visible: boolean;
  sort_order: number;
};

const rows: SeedRow[] = Object.entries(PAGE_SECTIONS).flatMap(([page, meta]) =>
  meta.sections.map((s, i) => ({
    page_key: page,
    section_key: s.key,
    is_visible: true,
    sort_order: i,
  })),
);

console.log(`[seed] 페이지 ${Object.keys(PAGE_SECTIONS).length}개 / 섹션 ${rows.length}행`);
for (const [page, meta] of Object.entries(PAGE_SECTIONS)) {
  console.log(`  ${page.padEnd(18)} ${meta.sections.map((s) => s.key).join(" > ")}`);
}

if (!DRY_RUN && !VERIFY_ONLY) {
  const { error } = await db
    .from("page_sections")
    .upsert(rows, { onConflict: "page_key,section_key" });
  if (error) {
    console.error("[seed] 실패:", error.message);
    process.exit(1);
  }
  console.log(`[seed] upsert 완료 — ${rows.length}행`);
}

if (!DRY_RUN) {
  const { data, error } = await db
    .from("page_sections")
    .select("page_key, section_key, is_visible, sort_order");
  if (error) {
    console.error("[verify] 조회 실패:", error.message);
    process.exit(1);
  }
  const got = new Map((data ?? []).map((r) => [`${r.page_key} ${r.section_key}`, r]));
  const problems: string[] = [];
  for (const r of rows) {
    const g = got.get(`${r.page_key} ${r.section_key}`);
    if (!g) problems.push(`행 없음: ${r.page_key} / ${r.section_key}`);
    else if (g.sort_order !== r.sort_order)
      problems.push(
        `순서 불일치: ${r.page_key} / ${r.section_key} — DB ${g.sort_order} != 레지스트리 ${r.sort_order}`,
      );
  }
  const orphans = (data ?? []).filter(
    (r) => !rows.some((x) => x.page_key === r.page_key && x.section_key === r.section_key),
  );
  for (const o of orphans) {
    console.log(`[verify] 레지스트리에 없는 행(렌더러가 무시): ${o.page_key} / ${o.section_key}`);
  }
  if (problems.length) {
    console.error(`[verify] 불일치 ${problems.length}건`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log(`[verify] DB 대조 일치 — ${rows.length}행`);
}
