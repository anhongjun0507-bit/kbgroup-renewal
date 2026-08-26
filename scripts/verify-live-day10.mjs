/**
 * DAY 10 라이브(프로덕션) 검증 — 배포 직후 체크리스트 (`docs/DEPLOY.md` §3).
 *
 * **프로덕션에 실제로 쓴다.** 모든 쓰기는 왕복이고, 마지막에 잔존물 0 을 확인한다.
 * 특히 §11-5 잔여 항목 —「`updateTag` 무효화가 Vercel 의 정적 sitemap 캐시까지 전파되는가」—
 * 는 로컬에서 드러나지 않는 항목이라 여기서만 판정할 수 있다.
 *
 *   BASE_URL=https://kbgroup-renewal.vercel.app \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-live-day10.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openAdminBrowser, loadEnvLocal } from "./lib/admin-session.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

loadEnvLocal(readFileSync);

const BASE = process.env.BASE_URL || "https://kbgroup-renewal.vercel.app";
const ADMIN_EMAIL = process.env.INSPECT_ADMIN_EMAIL || "inspect-admin@kbgroup.kr";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}
function note(label, detail) {
  console.log(`NOTE  ${label}${detail ? ` — ${detail}` : ""}`);
}

/** 캐시를 우회하지 않는 순수 방문자 요청. 라이브 CDN 상태를 그대로 본다. */
async function anon(path) {
  return fetch(`${BASE}${path}`, { headers: { "user-agent": "kb-live-check" } });
}
async function sitemapCount() {
  const xml = await (await anon("/sitemap.xml")).text();
  return (xml.match(/<loc>/g) ?? []).length;
}
async function status(path) {
  return (await anon(path)).status;
}
async function text(path) {
  return (await anon(path)).text();
}
async function until(fn, timeout = 60_000) {
  const started = Date.now();
  let last;
  for (;;) {
    last = await fn();
    if (last) return last;
    if (Date.now() - started > timeout) return last;
    await new Promise((r) => setTimeout(r, 2000));
  }
}

const { browser, page } = await openAdminBrowser({
  base: BASE,
  adminEmail: ADMIN_EMAIL,
  supabase,
});

/** 중간에 죽어도 프로덕션에 흔적을 남기지 않기 위한 원복 정보. */
const restore = { licensesHidden: false, faxOriginal: null };

try {
  /* ── ④ 관리자 진입 ─────────────────────────────────────────────────── */
  let res = await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  check("④ /admin 진입", res.status() === 200, `HTTP ${res.status()}`);
  const tabs = await page.locator('nav[aria-label="관리자 메뉴"] a').allTextContents();
  check("④ 관리자 탭 11개", tabs.length === 11, tabs.join(" / "));

  for (const p of ["/admin/content/boards", "/admin/content/revisions"]) {
    res = await page.goto(`${BASE}${p}`, { waitUntil: "domcontentloaded" });
    check(`④ 신규 관리자 화면 ${p}`, res.status() === 200, `HTTP ${res.status()}`);
  }

  /* ── ①②③⑧ 공개 페이지 렌더 ────────────────────────────────────────── */
  const home = await text("/");
  check("① 메인 카운터 200+ 표기", home.includes("200"), "");
  const slides = (home.match(/슬라이드 \d+(?:번)?(?:으로 이동)?/g) ?? []).length;
  note("② 히어로 인디케이터 추정 개수", String(slides));

  const cases = await text("/cases");
  check("③ 관리현황 현재 153", cases.includes("153"));
  check("③ 관리현황 과거 19", cases.includes("19"));

  const openings = await text("/careers/openings");
  const openCount = (openings.match(/careers\/openings\/[0-9a-f-]{36}/g) ?? []).length;
  check("⑧ 채용 공고 3건", new Set(openings.match(/careers\/openings\/[0-9a-f-]{36}/g) ?? []).size === 3, `링크 ${openCount}개`);

  /* ── ⑥ sitemap ─────────────────────────────────────────────────────── */
  const before = await sitemapCount();
  check("⑥ sitemap 191 URL", before === 191, `${before} URL`);
  const xml = await text("/sitemap.xml");
  check("⑥ 활성 단지 153 · 과거 누출 0", (xml.match(/\/cases\//g) ?? []).length === 153,
    `${(xml.match(/\/cases\//g) ?? []).length}건`);

  /* ── ⑦ updateTag 즉시 반영 (§11-5 잔여 항목) ───────────────────────── */
  console.log("\n─── ⑦ updateTag 프로덕션 전파 판정 ───");
  await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
  const row = page.locator("li[id^='page-']").filter({ hasText: "인허가" }).first();
  await row.getByRole("button", { name: "공개" }).click();
  await page.waitForLoadState("networkidle");
  restore.licensesHidden = true;

  const t0 = Date.now();
  const s404 = await until(async () => ((await status("/licenses")) === 404 ? true : null), 60_000);
  check("⑦-1 비공개 → /licenses 404 (즉시)", s404 === true,
    `${Math.round((Date.now() - t0) / 1000)}초`);

  const homeHidden = await text("/");
  check("⑦-2 헤더 메뉴에서 「인허가」 제외", !homeHidden.includes(">인허가<"), "");

  const after = await sitemapCount();
  if (after === before - 1) {
    check("⑦-3 sitemap 즉시 반영 (191 → 190)", true, `${after} URL`);
  } else {
    check("⑦-3 sitemap 즉시 반영", false,
      `${after} URL — 태그 전파가 Vercel 정적 캐시에 닿지 않음. 최대 1h 뒤 자동 갱신 (docs/DEPLOY.md §3-3)`);
  }

  // 원복
  await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
  await page.locator("li[id^='page-']").filter({ hasText: "인허가" }).first()
    .getByRole("button", { name: "비공개" }).click();
  await page.waitForLoadState("networkidle");
  const back200 = await until(async () => ((await status("/licenses")) === 200 ? true : null), 60_000);
  check("⑦-4 공개 원복 → /licenses 200", back200 === true);
  restore.licensesHidden = back200 !== true;
  const backCount = await until(async () => ((await sitemapCount()) === 191 ? true : null), 60_000);
  check("⑦-5 sitemap 191 복귀", backCount === true, `${await sitemapCount()} URL`);

  /* ── ⑤ 편집 → 반영 1건 실측 (팩스 번호 왕복) ───────────────────────── */
  console.log("\n─── ⑤ 편집 → 반영 실측 ───");
  const { data: contactRow } = await supabase
    .from("site_settings").select("value").eq("key", "contact").single();
  const originalFax = contactRow.value.fax;
  restore.faxOriginal = originalFax;
  const testFax = `${originalFax.slice(0, -1)}${originalFax.slice(-1) === "9" ? "8" : "9"}`;

  await page.goto(`${BASE}/admin/content/settings#setting-contact`, { waitUntil: "domcontentloaded" });
  const form = page.locator("#setting-contact");
  await form.locator('input[name="fax"]').fill(testFax);
  await form.getByRole("button", { name: "저장" }).click();
  await page.waitForLoadState("networkidle");

  const reflected = await until(async () =>
    (await text("/contact")).includes(testFax) ? true : null, 60_000);
  check("⑤ 팩스 변경 → /contact 반영", reflected === true, `${originalFax} → ${testFax}`);

  await page.goto(`${BASE}/admin/content/settings#setting-contact`, { waitUntil: "domcontentloaded" });
  await page.locator("#setting-contact").locator('input[name="fax"]').fill(originalFax);
  await page.locator("#setting-contact").getByRole("button", { name: "저장" }).click();
  await page.waitForLoadState("networkidle");
  const reverted = await until(async () =>
    (await text("/contact")).includes(originalFax) ? true : null, 60_000);
  check("⑤ 팩스 원복 → /contact 복귀", reverted === true, originalFax);
  if (reverted === true) restore.faxOriginal = null;

  /* ── 잔존물 ────────────────────────────────────────────────────────── */
  console.log("\n─── 잔존물 확인 ───");
  const { count: hidden } = await supabase
    .from("pages").select("path", { count: "exact", head: true }).eq("is_published", false);
  check("비공개 잔존 페이지 0건", (hidden ?? 0) === 0, `${hidden}건`);
  const { data: finalContact } = await supabase
    .from("site_settings").select("value").eq("key", "contact").single();
  check("팩스 원복 확인", finalContact.value.fax === originalFax, finalContact.value.fax);
} finally {
  if (restore.licensesHidden) {
    await supabase.from("pages").update({ is_published: true }).eq("path", "/licenses");
    console.log("⚠ /licenses 를 DB 에서 직접 공개로 되돌렸다 (스크립트 중단 대비)");
  }
  if (restore.faxOriginal) {
    const { data: c } = await supabase.from("site_settings").select("value").eq("key", "contact").single();
    await supabase.from("site_settings")
      .update({ value: { ...c.value, fax: restore.faxOriginal } }).eq("key", "contact");
    console.log("⚠ 팩스를 DB 에서 직접 되돌렸다 (스크립트 중단 대비)");
  }
  await browser.close();
}

console.log(`\n${failures === 0 ? "✅ 라이브 검증 전 항목 통과" : `❌ 실패 ${failures}건`}`);
process.exit(failures === 0 ? 0 : 1);
