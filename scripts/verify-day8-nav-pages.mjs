/**
 * DAY 8 메뉴·페이지 관리 실동작 검증 (PLAN B / ITEM 03).
 *
 * 실제 브라우저로 관리자 화면 버튼을 **클릭**하고, 공개 페이지·사이트맵을 HTTP 로 다시 읽어
 * 확인한 뒤 **원복까지** 돈다. 원복 후에는 전환 전 스냅샷과 한 줄도 다르지 않아야 한다.
 *
 *  1) 관리 화면 렌더 — /admin/content/nav · /admin/content/pages
 *  2) 헤더 동작 — 스크롤 로고 모핑 · 투명↔불투명 · 드롭다운 · 모바일 햄버거
 *  3) 메뉴 왕복 — 이름 변경 / 순서 이동 / 표시·숨김 각각 반영 후 원복
 *  4) 페이지 공개·비공개 — 404 / 메뉴 제외 / sitemap 제외 / 관리자 미리보기 배너, 그리고 원복
 *  5) sitemap URL 건수 — 활성 단지 유지 · 과거 단지 미포함
 *
 * playwright 는 이 저장소의 의존성이 아니다. PLAYWRIGHT_PATH 로 주입한다.
 *   BASE_URL=http://localhost:3210 \
 *   BASELINE=docs/regression/ssr/after \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-day8-nav-pages.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openAdminBrowser, loadEnvLocal } from "./lib/admin-session.mjs";
import { visibleLines } from "./lib/visible-text.mjs";
import { PUBLIC_PAGES } from "../lib/pages/registry.ts";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

loadEnvLocal(readFileSync);

const BASE = process.env.BASE_URL || "http://localhost:3210";
const BASELINE = process.env.BASELINE || "docs/regression/ssr/after";
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

/** 쿠키 없는 방문자 시점 요청. 관리자 미리보기와 구분하려면 반드시 이쪽으로 읽는다. */
async function anon(path) {
  return fetch(`${BASE}${path}`, { headers: { "user-agent": "kb-regression" } });
}
async function lines(path) {
  const res = await anon(path);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return visibleLines(await res.text());
}
function baseline(key) {
  return readFileSync(`${BASELINE}/${key}.txt`, "utf8").split("\n").filter(Boolean);
}
function firstDiff(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return `[${i}] ${a[i] ?? "(없음)"} != ${b[i] ?? "(없음)"}`;
  }
  return null;
}
async function until(fn, label, timeout = 60_000) {
  const started = Date.now();
  for (;;) {
    if (await fn()) return;
    if (Date.now() - started > timeout) throw new Error(`대기 시간 초과: ${label}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}
async function sitemapUrls() {
  const res = await anon("/sitemap.xml");
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
/** 헤더 GNB 의 한글 라벨 순서 — 클라이언트 하이드레이션 없이 SSR HTML 로도 읽힌다. */
async function headerLabels(p) {
  return p.locator('header nav[aria-label="주 메뉴"] > div > a').allTextContents();
}

/** 서버 액션 직후의 헤더 GNB — 새 SSR 응답을 받아야 하므로 홈을 다시 연다. */
async function headerLabelsFresh() {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  return headerLabels(page);
}

const { browser, page } = await openAdminBrowser({ base: BASE, adminEmail: ADMIN_EMAIL, supabase });

try {
  /* ── 1) 관리 화면 렌더 ─────────────────────────────────────────────── */
  let res = await page.goto(`${BASE}/admin/content/nav`, { waitUntil: "domcontentloaded" });
  check("/admin/content/nav 200", res.status() === 200, `HTTP ${res.status()}`);
  const headerRows = await page.locator("#nav-header li[id^='nav-']").count();
  const footerRows = await page.locator("#nav-footer li[id^='nav-']").count();
  check("헤더 메뉴 행", headerRows === 12, `${headerRows}행 (상위 6 + 하위 6)`);
  check("푸터 메뉴 행", footerRows === 6, `${footerRows}행`);

  res = await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
  check("/admin/content/pages 200", res.status() === 200, `HTTP ${res.status()}`);
  const pageRows = await page.locator("li[id^='page-']").count();
  const locked = await page.getByText("공개 고정", { exact: true }).count();
  check("페이지 행", pageRows === PUBLIC_PAGES.length, `${pageRows}행 (레지스트리 ${PUBLIC_PAGES.length})`);
  check("메인 비공개 잠금", locked === 1, `공개 고정 ${locked}개`);

  /* ── 2) 헤더 동작 (전환 전과 동일해야 한다) ────────────────────────── */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const header = page.locator("header.site-header");
  /* 헤더 DOM 은 모바일 블록(lg:hidden) → 데스크탑 블록(hidden lg:block) 순이다.
     둘 다 KBLogoMark 를 하나씩 갖고 있으므로 데스크탑 로고는 nth(1) 이다. */
  const logoTop = page.locator("header.site-header .font-display").nth(1);
  const surface0 = await header.getAttribute("data-surface");
  const size0 = await logoTop.evaluate((el) => getComputedStyle(el).fontSize);
  check("히어로 위 — 헤더 투명(dark surface)", surface0 === "dark", `data-surface=${surface0}`);
  check("히어로 위 — 로고 확대(2단)", size0 === "28px", `fontSize=${size0}`);

  await page.evaluate(() => window.scrollTo(0, 600));
  await until(async () => (await header.getAttribute("data-scrolled")) === "true", "스크롤 컴팩트 전환");
  await page.waitForTimeout(700);
  const surface1 = await header.getAttribute("data-surface");
  const size1 = await logoTop.evaluate((el) => getComputedStyle(el).fontSize);
  const bg1 = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
  check("스크롤 후 — 불투명 전환", surface1 === null && bg1 !== "rgba(0, 0, 0, 0)", `bg=${bg1}`);
  check("스크롤 후 — 로고 축소(1단 모핑)", size1 === "17px", `fontSize=${size1}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await until(async () => (await header.getAttribute("data-scrolled")) === null, "스크롤 복귀");
  await page.waitForTimeout(700);
  const size2 = await logoTop.evaluate((el) => getComputedStyle(el).fontSize);
  check("스크롤 복귀 — 2단 로고로 원복", size2 === "28px", `fontSize=${size2}`);

  const labels = await headerLabels(page);
  check(
    "GNB 항목 — 전환 전과 동일",
    labels.join(",") === "회사소개,사업영역,관리현황,인허가,채용,소식",
    labels.join(","),
  );

  await page.locator('header nav[aria-label="주 메뉴"] a[href="/business"]').hover();
  await page.waitForTimeout(400);
  const dd = await page
    .locator('header nav[aria-label="주 메뉴"] div.absolute a')
    .allTextContents();
  check("BUSINESS 드롭다운 — 사업영역 5종", dd.length === 5, dd.join(" / "));
  await page.mouse.move(0, 0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.locator('button[aria-controls="mobile-menu"]').click();
  await page.waitForTimeout(500);
  const mobileOpacity = await page
    .locator("#mobile-menu")
    .evaluate((el) => getComputedStyle(el).opacity);
  const mobileItems = await page.locator("#mobile-menu nav > div.border-b").count();
  check("모바일 햄버거 — 오버레이 열림", mobileOpacity === "1", `opacity=${mobileOpacity}`);
  check("모바일 메뉴 항목 6개", mobileItems === 6, `${mobileItems}개`);
  await page.setViewportSize({ width: 1440, height: 900 });

  /* ── 3) 메뉴 왕복 ─────────────────────────────────────────────────── */
  const homeBefore = baseline("home");
  const homeLive = await lines("/");
  check("사전 상태 — / 가 전환 전 스냅샷과 동일", firstDiff(homeBefore, homeLive) === null,
    firstDiff(homeBefore, homeLive) ?? "diff 0줄");

  const { data: navRows } = await supabase
    .from("nav_items")
    .select("id, location, label, href, parent_id, sort_order")
    .is("parent_id", null)
    .eq("location", "header")
    .order("sort_order");
  const about = navRows.find((r) => r.href === "/about");
  const licenses = navRows.find((r) => r.href === "/licenses");

  /* 3-1) 이름 변경 */
  await page.goto(`${BASE}/admin/content/nav`, { waitUntil: "domcontentloaded" });
  const aboutRow = page.locator(`#nav-${about.id}`);
  await aboutRow.locator('input[name="kr_label"]').fill("회사안내");
  await aboutRow.locator('button[type="submit"]', { hasText: "저장" }).first().click();
  await until(
    async () => (await lines("/")).includes("회사안내"),
    "메뉴 이름 변경 반영",
  );
  const renamed = await lines("/");
  check("이름 변경 반영 — 헤더에 「회사안내」", renamed.includes("회사안내") && !renamed.includes("회사소개"));

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(`#nav-${about.id} input[name="kr_label"]`).fill("회사소개");
  await page.locator(`#nav-${about.id} button[type="submit"]`).first().click();
  await until(async () => (await lines("/")).includes("회사소개"), "메뉴 이름 원복");
  check("이름 왕복 — 원래 화면으로 정확히 복귀",
    firstDiff(homeBefore, await lines("/")) === null);

  /* 3-2) 순서 이동 */
  await page.goto(`${BASE}/admin/content/nav`, { waitUntil: "domcontentloaded" });
  await page.locator(`#nav-${about.id} button[aria-label="ABOUT 아래로"]`).click();
  await until(async () => {
    const l = await lines("/");
    return l.indexOf("사업영역") < l.indexOf("회사소개");
  }, "메뉴 순서 변경 반영");
  const moved = await lines("/");
  check("순서 반영 — 사업영역이 회사소개보다 앞", moved.indexOf("사업영역") < moved.indexOf("회사소개"));
  check("순서 변경은 줄 수를 바꾸지 않는다", moved.length === homeBefore.length,
    `${moved.length}줄 (기준 ${homeBefore.length})`);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(`#nav-${about.id} button[aria-label="ABOUT 위로"]`).click();
  await until(async () => firstDiff(homeBefore, await lines("/")) === null, "메뉴 순서 원복");
  check("순서 왕복 — 원래 배치로 정확히 복귀", true, "diff 0줄");

  /* 3-3) 표시·숨김 */
  await page.goto(`${BASE}/admin/content/nav`, { waitUntil: "domcontentloaded" });
  await page.locator(`#nav-${licenses.id} button`, { hasText: "표시" }).last().click();
  await until(async () => !(await headerLabelsFresh()).includes("인허가"), "메뉴 숨김 반영");
  const afterHide = await headerLabelsFresh();
  check("숨김 반영 — 헤더 GNB 에서 「인허가」 제외",
    !afterHide.includes("인허가") && afterHide.length === 5, afterHide.join(","));

  await page.goto(`${BASE}/admin/content/nav`, { waitUntil: "domcontentloaded" });
  await page.locator(`#nav-${licenses.id} button`, { hasText: "숨김" }).last().click();
  await until(async () => firstDiff(homeBefore, await lines("/")) === null, "메뉴 숨김 원복");
  check("숨김 왕복 — 원래 배치로 정확히 복귀", true, "diff 0줄");

  /* ── 4) 페이지 공개·비공개 ─────────────────────────────────────────── */
  const licBefore = baseline("licenses");
  const urlsBefore = await sitemapUrls();
  check("사전 상태 — /licenses 가 전환 전 스냅샷과 동일",
    firstDiff(licBefore, await lines("/licenses")) === null);

  await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
  await page.locator("#page--licenses button[type='submit']").click();
  await until(async () => (await anon("/licenses")).status === 404, "비공개 → 404");

  const licRes = await anon("/licenses");
  check("① 방문자에게 404", licRes.status === 404, `HTTP ${licRes.status}`);

  const homeHidden = await lines("/");
  check("② 헤더·푸터 메뉴에서 자동 제외",
    !homeHidden.includes("인허가") && !homeHidden.includes("LICENSES"),
    `헤더 ${homeHidden.includes("인허가") ? "잔존" : "제외"}`);

  const urlsHidden = await sitemapUrls();
  check("③ sitemap.xml 에서 제외",
    !urlsHidden.some((u) => u.endsWith("/licenses")) &&
      urlsBefore.some((u) => u.endsWith("/licenses")),
    `${urlsBefore.length}개 → ${urlsHidden.length}개`);

  await page.goto(`${BASE}/licenses`, { waitUntil: "domcontentloaded" });
  const bannerCount = await page.getByText("이 페이지는 현재 비공개입니다", { exact: false }).count();
  const adminSees = await page.getByText("인허가", { exact: false }).count();
  check("④ 관리자는 미리보기 가능 + 배너", bannerCount === 1 && adminSees > 0,
    `배너 ${bannerCount}개`);

  await page.goto(`${BASE}/admin/content/pages`, { waitUntil: "domcontentloaded" });
  await page.locator("#page--licenses button[type='submit']").click();
  await until(async () => (await anon("/licenses")).status === 200, "공개 복귀");
  check("공개 왕복 — /licenses 원상복구",
    firstDiff(licBefore, await lines("/licenses")) === null);
  check("공개 왕복 — 메뉴 복귀", firstDiff(homeBefore, await lines("/")) === null);
  const urlsRestored = await sitemapUrls();
  check("공개 왕복 — sitemap 복귀", urlsRestored.length === urlsBefore.length,
    `${urlsRestored.length}개 (기준 ${urlsBefore.length})`);

  /* ── 5) sitemap 구성 대조 ─────────────────────────────────────────── */
  const { data: active } = await supabase
    .from("complexes").select("slug").eq("is_active", true);
  const { data: past } = await supabase
    .from("complexes").select("slug").eq("is_active", false);
  const caseUrls = urlsBefore.filter((u) => u.includes("/cases/"));
  const pastLeaked = past.filter((c) => urlsBefore.some((u) => u.endsWith(`/cases/${c.slug}`)));
  check("활성 단지 URL 유지", caseUrls.length === active.length,
    `sitemap ${caseUrls.length}건 / DB ${active.length}건`);
  check("과거 단지 URL 미포함", pastLeaked.length === 0,
    `과거 ${past.length}건 중 누출 ${pastLeaked.length}건`);
  check("정적 경로 14건", PUBLIC_PAGES.every((p) =>
    urlsBefore.some((u) => u.replace(/\/$/, "").endsWith(p.path === "/" ? "" : p.path))), "");

  /* ── 6) DB 최종 상태 ───────────────────────────────────────────────── */
  const { data: navFinal } = await supabase
    .from("nav_items").select("label, href, sort_order, is_visible, kr_label, parent_id");
  const { data: pagesFinal } = await supabase.from("pages").select("path, is_published");
  check("nav_items 최종 — 전 행 표시", navFinal.every((r) => r.is_visible),
    `${navFinal.length}행`);
  check("pages 최종 — 전 행 공개", pagesFinal.every((r) => r.is_published),
    `${pagesFinal.length}행`);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\n전 항목 통과" : `\n실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
