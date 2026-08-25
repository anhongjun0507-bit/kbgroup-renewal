/**
 * DAY 8 페이지 공개·비공개 **전수** 왕복 (PLAN B / ITEM 03).
 *
 * `verify-day8-nav-pages.mjs` 는 `/licenses` 한 경로를 깊게(404·메뉴·sitemap·배너) 본다.
 * 이 스크립트는 반대로 **레지스트리의 토글 가능 13경로 전부**를 얕게 한 바퀴 돈다 —
 * 게이트를 붙이지 않고 빠뜨린 페이지가 있으면 여기서 잡힌다.
 *
 * 각 경로마다: 관리자 UI 클릭 → 방문자 404 → 관리자 미리보기 배너 → 다시 클릭 → 200.
 * 프로덕션 DB 를 실제로 쓰므로 **반드시 원복까지 돈다**(PROGRESS §11-4).
 *
 *   BASE_URL=http://localhost:3210 \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-day8-pages-sweep.mjs
 *
 * 13경로 × (토글 2회 + 페이지 3회 로드) 라 로컬 프로덕션 빌드 기준 12~15분 걸린다.
 * ONLY=/privacy,/terms 로 일부만 돌릴 수 있다.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openAdminBrowser, loadEnvLocal } from "./lib/admin-session.mjs";
import { PUBLIC_PAGES } from "../lib/pages/registry.ts";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

loadEnvLocal(readFileSync);

const BASE = process.env.BASE_URL || "http://localhost:3210";
const ADMIN_EMAIL = process.env.INSPECT_ADMIN_EMAIL || "inspect-admin@kbgroup.kr";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const anon = (p) => fetch(`${BASE}${p}`, { headers: { "user-agent": "kb-regression" } });

async function until(fn, label, timeout = 60_000) {
  const started = Date.now();
  for (;;) {
    if (await fn()) return;
    if (Date.now() - started > timeout) throw new Error(`대기 시간 초과: ${label}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

const targets = PUBLIC_PAGES.filter(
  (p) => p.togglable && (!ONLY || ONLY.includes(p.path)),
);

const { browser, page } = await openAdminBrowser({ base: BASE, adminEmail: ADMIN_EMAIL, supabase });
let failures = 0;

try {
  for (const p of targets) {
    const id = "#page-" + p.path.replace(/[^a-zA-Z0-9]/g, "-");

    await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
    await page.locator(`${id} button[type='submit']`).click();
    await until(async () => (await anon(p.path)).status === 404, `${p.path} 비공개`);
    const hidden = (await anon(p.path)).status;

    await page.goto(`${BASE}${p.path}`, { waitUntil: "domcontentloaded" });
    const banner = await page
      .getByText("이 페이지는 현재 비공개입니다", { exact: false })
      .count();

    await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
    await page.locator(`${id} button[type='submit']`).click();
    await until(async () => (await anon(p.path)).status === 200, `${p.path} 공개 복귀`);
    const restored = (await anon(p.path)).status;

    const ok = hidden === 404 && banner === 1 && restored === 200;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${p.path.padEnd(20)} 비공개=${hidden} 배너=${banner} 복귀=${restored}`,
    );
  }
} finally {
  await browser.close();
}

/* 원복 확인 — 중간에 죽었더라도 남은 비공개 행이 있으면 여기서 드러난다. */
const { data } = await supabase.from("pages").select("path, is_published");
const left = (data ?? []).filter((r) => !r.is_published).map((r) => r.path);
if (left.length) {
  console.error(`\n비공개로 남은 경로: ${left.join(", ")}`);
  failures++;
} else {
  console.log(`\npages ${data?.length ?? 0}행 전부 공개 — 원복 완료`);
}

console.log(failures === 0 ? `${targets.length}경로 전부 통과` : `실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
