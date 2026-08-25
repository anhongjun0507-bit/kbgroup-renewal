/**
 * scripts/seed-nav-pages.ts — PLAN B / DAY 8 (ITEM 03)
 *
 * `nav_items`(헤더·푸터 메뉴) 와 `pages`(공개 여부) 에 **현재 화면 그대로** 초기값을 넣는다.
 *   · nav_items : `lib/nav/types.ts` 의 기본값 = 전환 전 Header/Footer 상수와 같은 값
 *   · pages     : `lib/pages/registry.ts` 의 14경로, 전부 is_published = true
 *
 * 행이 없어도 사이트는 같은 화면을 그린다(코드 기본값). 이 시드는 "관리자 화면이 처음부터
 * 실제 행을 보여주게" 하는 용도다 — DAY 7 `seed-page-sections.ts` 와 같은 성격이다.
 *
 * **재실행 안전**:
 *   · nav_items 는 (location, href) 자연키가 DB 제약이 아니라 upsert 를 쓸 수 없다.
 *     이미 행이 있으면 **아무것도 쓰지 않고** 검증만 한다. 초기화하려면 --force.
 *   · pages 는 path UNIQUE 이므로 `ignoreDuplicates` 로 **없는 경로만** 넣는다.
 *     이미 비공개로 돌려둔 페이지를 시드가 다시 공개로 되돌리지 않게 하기 위해서다.
 *
 * 실행:
 *   node scripts/seed-nav-pages.ts               # 시드 + 검증
 *   node scripts/seed-nav-pages.ts --dry-run     # 쓰지 않고 계획만
 *   node scripts/seed-nav-pages.ts --verify-only
 *   node scripts/seed-nav-pages.ts --force       # nav_items 전체 삭제 후 재시드
 *
 * 쓰기는 service_role 키로 RLS 를 우회한다. 이 키는 서버 전용이며 NEXT_PUBLIC_ 접두사가 아니다.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  FOOTER_NAV_DEFAULT,
  HEADER_NAV_DEFAULT,
  type NavItem,
} from "../lib/nav/types.ts";
import { PUBLIC_PAGES } from "../lib/pages/registry.ts";

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
const FORCE = process.argv.includes("--force");

/* ── 계획 출력 ─────────────────────────────────────────────────────────── */

function describe(items: NavItem[], location: string) {
  console.log(`  [${location}] 상위 ${items.length}개`);
  for (const it of items) {
    const kids = it.children?.length ? ` (하위 ${it.children.length})` : "";
    console.log(`    ${it.label.padEnd(10)} ${it.krLabel.padEnd(6)} ${it.href}${kids}`);
  }
}

console.log("[seed] nav_items 계획");
describe(HEADER_NAV_DEFAULT, "header");
describe(FOOTER_NAV_DEFAULT, "footer");
console.log(`[seed] pages 계획 — ${PUBLIC_PAGES.length}경로`);

/* BUSINESS 하위는 businessAreas 설정에서 파생하므로 nav_items 에 넣지 않는다
   (lib/nav/types.ts BUSINESS_NAV_HREF 주석). 기본값 배열에도 애초에 없다. */

/* ── nav_items ─────────────────────────────────────────────────────────── */

async function seedNav(): Promise<void> {
  const { count, error: countError } = await db
    .from("nav_items")
    .select("id", { count: "exact", head: true });
  if (countError) throw new Error(countError.message);

  if ((count ?? 0) > 0) {
    if (!FORCE) {
      console.log(`[seed] nav_items 에 이미 ${count}행이 있다 — 쓰지 않는다 (--force 로 초기화)`);
      return;
    }
    const { error } = await db.from("nav_items").delete().not("id", "is", null);
    if (error) throw new Error(error.message);
    console.log(`[seed] --force: nav_items ${count}행 삭제`);
  }

  for (const [location, items] of [
    ["header", HEADER_NAV_DEFAULT],
    ["footer", FOOTER_NAV_DEFAULT],
  ] as const) {
    for (const [i, item] of items.entries()) {
      const { data, error } = await db
        .from("nav_items")
        .insert({
          location,
          label: item.label,
          kr_label: item.krLabel,
          href: item.href,
          sort_order: i,
          is_visible: true,
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "insert 실패");

      for (const [ci, child] of (item.children ?? []).entries()) {
        const { error: childError } = await db.from("nav_items").insert({
          parent_id: data.id,
          location,
          label: child.label,
          kr_label: null,
          href: child.href,
          sort_order: ci,
          is_visible: true,
        });
        if (childError) throw new Error(childError.message);
      }
    }
  }
  console.log("[seed] nav_items 삽입 완료");
}

/* ── pages ─────────────────────────────────────────────────────────────── */

async function seedPages(): Promise<void> {
  const rows = PUBLIC_PAGES.map((p, i) => ({
    path: p.path,
    title: p.label,
    is_published: true,
    sort_order: i,
  }));
  const { error } = await db
    .from("pages")
    /* ignoreDuplicates: 이미 있는 경로는 손대지 않는다 — 비공개 설정을 되돌리면 안 된다. */
    .upsert(rows, { onConflict: "path", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  console.log(`[seed] pages upsert 완료 — 최대 ${rows.length}행 (기존 행 보존)`);
}

/* ── 검증 ──────────────────────────────────────────────────────────────── */

async function verify(): Promise<void> {
  const problems: string[] = [];

  const { data: nav, error: navError } = await db
    .from("nav_items")
    .select("id, parent_id, location, label, kr_label, href, sort_order, is_visible")
    .order("sort_order", { ascending: true });
  if (navError) throw new Error(navError.message);

  for (const [location, items] of [
    ["header", HEADER_NAV_DEFAULT],
    ["footer", FOOTER_NAV_DEFAULT],
  ] as const) {
    const parents = (nav ?? []).filter((r) => r.location === location && !r.parent_id);
    if (parents.length !== items.length) {
      problems.push(`${location}: 상위 ${parents.length}행 != 기본값 ${items.length}개`);
      continue;
    }
    for (const [i, item] of items.entries()) {
      const row = parents[i];
      if (row.label !== item.label || row.href !== item.href)
        problems.push(`${location}[${i}]: ${row.label}/${row.href} != ${item.label}/${item.href}`);
      const kids = (nav ?? []).filter((r) => r.parent_id === row.id);
      const want = item.children ?? [];
      if (kids.length !== want.length)
        problems.push(`${location}[${i}] 하위 ${kids.length}행 != ${want.length}개`);
    }
  }

  const { data: pages, error: pagesError } = await db
    .from("pages")
    .select("path, is_published");
  if (pagesError) throw new Error(pagesError.message);
  for (const p of PUBLIC_PAGES) {
    if (!(pages ?? []).some((r) => r.path === p.path)) problems.push(`pages 행 없음: ${p.path}`);
  }
  const orphans = (pages ?? []).filter(
    (r) => !PUBLIC_PAGES.some((p) => p.path === r.path),
  );
  for (const o of orphans) console.log(`[verify] 레지스트리에 없는 pages 행(무시됨): ${o.path}`);

  const hidden = (pages ?? []).filter((r) => !r.is_published).map((r) => r.path);
  console.log(
    `[verify] nav_items ${nav?.length ?? 0}행 · pages ${pages?.length ?? 0}행` +
      (hidden.length ? ` · 비공개 ${hidden.join(", ")}` : " · 비공개 없음"),
  );

  if (problems.length) {
    console.error(`[verify] 불일치 ${problems.length}건`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log("[verify] 기본값 대조 일치");
}

if (!DRY_RUN && !VERIFY_ONLY) {
  await seedNav();
  await seedPages();
}
if (!DRY_RUN) await verify();
