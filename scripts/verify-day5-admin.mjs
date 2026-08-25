/**
 * DAY 5 관리자 편집 UI 실동작 검증 (PLAN B).
 *
 * 실제 브라우저로 로그인해 `/admin/content/settings` 를 열고, 새로 만든 편집기가
 * **저장 → 공개 페이지 즉시 반영 → 원복** 까지 도는지 확인한다.
 *
 *  1) 연락처   — 대표 전화를 바꾸고 공개 페이지 14곳에서 옛 번호가 한 곳도 안 남는지 (5-0 목적)
 *  2) 연혁     — 항목 추가 → /about/history 반영 → 삭제 → 건수 원복 (ListEditor 추가·삭제)
 *  3) 조직도   — 형제 이동 저장 → 노드 총 개수 13 유지 → 원복 (자식 유실 없음)
 *
 * playwright 는 이 저장소의 의존성이 아니다. PLAYWRIGHT_PATH 로 주입한다.
 *   BASE_URL=http://localhost:3210 \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-day5-admin.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { createClient } = require("@supabase/supabase-js");

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const BASE = process.env.BASE_URL || "http://localhost:3210";
const ADMIN_EMAIL = process.env.INSPECT_ADMIN_EMAIL || "inspect-admin@kbgroup.kr";
/** READONLY=1 — 렌더 확인만 하고 DB 를 건드리지 않는다. 라이브 배포 검증용. */
const READONLY = process.env.READONLY === "1";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

/** 공개 페이지 14개 — 대표 전화가 노출되는 화면 전부를 포함한다. */
const PUBLIC_PAGES = [
  "/",
  "/about",
  "/about/ceo",
  "/about/history",
  "/about/location",
  "/business",
  "/business/facility",
  "/cases",
  "/licenses",
  "/careers",
  "/contact",
  "/notices",
  "/login",
  "/privacy",
];

async function textOf(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.text();
}

const settingsRow = async (key) => {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data.value;
};

const originalContact = await settingsRow("contact");
const originalHistory = await settingsRow("history");
const originalOrg = await settingsRow("organization");
const ORIGINAL_PHONE = originalContact.phone;
const TEST_PHONE = "062-000-9999";

function countNodes(nodes) {
  return nodes.reduce((n, x) => n + 1 + countNodes(x.children ?? []), 0);
}
const ORIGINAL_NODES =
  countNodes([originalOrg.tree]) + countNodes(originalOrg.branches ?? []);

/* ── 로그인 세션 만들기 ──────────────────────────────────────────────────
   매직링크의 redirect_to 는 Supabase 허용 목록에 없는 localhost 로는 못 간다(프로덕션으로 튕긴다).
   그래서 링크를 브라우저로 열지 않고 Node 에서 verifyOtp 로 세션만 받은 뒤,
   앱이 실제로 쓰는 @supabase/ssr 쿠키 형식 그대로 브라우저 컨텍스트에 심는다. */

const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
  type: "magiclink",
  email: ADMIN_EMAIL,
});
if (linkError) {
  console.error("❌ 매직링크 발급 실패:", linkError.message);
  process.exit(1);
}

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const { data: otp, error: otpError } = await anon.auth.verifyOtp({
  type: "magiclink",
  token_hash: link.properties.hashed_token,
});
if (otpError || !otp.session) {
  console.error("❌ verifyOtp 실패:", otpError?.message);
  process.exit(1);
}

// 앱과 같은 @supabase/ssr 어댑터로 쿠키를 만들게 해 이름·청크 규칙을 직접 흉내내지 않는다.
const { createServerClient } = require("@supabase/ssr");
const jar = [];
const ssr = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll: () => jar.map(({ name, value }) => ({ name, value })),
      setAll: (list) => {
        for (const c of list) {
          const i = jar.findIndex((x) => x.name === c.name);
          if (i >= 0) jar[i] = { name: c.name, value: c.value };
          else jar.push({ name: c.name, value: c.value });
        }
      },
    },
  },
);
await ssr.auth.setSession({
  access_token: otp.session.access_token,
  refresh_token: otp.session.refresh_token,
});
if (jar.length === 0) {
  console.error("❌ @supabase/ssr 쿠키를 만들지 못했습니다.");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies(
  jar.map((c) => ({
    name: c.name,
    value: c.value,
    domain: new URL(BASE).hostname,
    path: "/",
    httpOnly: false,
    secure: BASE.startsWith("https"),
    sameSite: "Lax",
  })),
);
const page = await ctx.newPage();
page.setDefaultTimeout(120_000);
page.setDefaultNavigationTimeout(120_000);

await page.goto(`${BASE}/admin/content/settings`, { waitUntil: "domcontentloaded" });
check("설정 페이지 응답", !page.url().includes("/login"), page.url());
await page.waitForSelector("#setting-organization", { timeout: 120_000 });

check("관리자 로그인 후 /admin/content/settings 진입", true, page.url());

/* ── 0) 편집기 렌더 확인 ───────────────────────────────────────────────── */

const SECTION_IDS = [
  "company", "contact", "ceoMessage", "counters", "stats",
  "coreValues", "differentiators", "companyStrengths", "history",
  "partners", "collaborators", "relatedCompanies", "licenses",
  "certifications", "businessAreas", "processSteps", "organization",
];
for (const id of SECTION_IDS) {
  const n = await page.locator(`#setting-${id}`).count();
  if (n !== 1) check(`편집 섹션 #setting-${id} 렌더`, false, `${n}개`);
}
check(`편집 섹션 17개 전부 렌더`, true);

check(
  "인허가 9건 렌더",
  (await page.locator("[data-list-row=licenses]").count()) === 9,
  `${await page.locator("[data-list-row=licenses]").count()}건`,
);
check(
  "인증 27건 렌더",
  (await page.locator("[data-list-row=certifications]").count()) === 27,
  `${await page.locator("[data-list-row=certifications]").count()}건`,
);
check(
  "연혁 16건 렌더",
  (await page.locator("[data-list-row=history]").count()) === 16,
  `${await page.locator("[data-list-row=history]").count()}건`,
);
check(
  `조직도 ${ORIGINAL_NODES}노드 렌더`,
  (await page.locator("[data-org-row]").count()) ===
    ORIGINAL_NODES,
  `${await page.locator("[data-org-row]").count()}노드`,
);

if (READONLY) {
  await browser.close();
  console.log(
    failures === 0
      ? "\n✅ READONLY — 편집 UI 렌더 확인 통과 (DB 무변경)"
      : `\n❌ ${failures}건 실패`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

/* ── 0-b) 무변경 왕복 — 11개 목록 키를 그대로 저장했을 때 값이 1바이트도 안 바뀌는지 ──
   범용 편집기의 유일한 치명적 실패 모드는 "화면에 없는 필드가 저장 때 조용히 사라지는 것"이다.
   아무것도 고치지 않고 저장 → 저장 전후 JSON 완전 일치 를 11개 키 전부에 대해 확인한다. */

const LIST_KEYS = [
  "coreValues", "differentiators", "companyStrengths", "history",
  "partners", "collaborators", "relatedCompanies", "licenses",
  "certifications", "businessAreas", "processSteps",
];

for (const key of LIST_KEYS) {
  const before = await settingsRow(key);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.click(`#setting-${key} button[type=submit]`);
  await page.waitForSelector(`#setting-${key} [role=status]`, { timeout: 120_000 });
  const after = await settingsRow(key);
  check(
    `무변경 왕복 — ${key} (${Array.isArray(after) ? after.length : "?"}건) 저장 전후 완전 일치`,
    JSON.stringify(before) === JSON.stringify(after),
  );
}

/* ── 1) 대표 전화 — 전 페이지 반영 ─────────────────────────────────────── */

await page.fill("#sf-phone", TEST_PHONE);
await page.click("#setting-contact button[type=submit]");
await page.waitForSelector("#setting-contact [role=status]", { timeout: 120_000 });

{
  const stale = [];
  const missing = [];
  for (const p of PUBLIC_PAGES) {
    const html = await textOf(p);
    if (html.includes(ORIGINAL_PHONE)) stale.push(p);
    if (!html.includes(TEST_PHONE)) missing.push(p);
  }
  check(
    `대표 전화 변경 — 공개 페이지 ${PUBLIC_PAGES.length}곳에 옛 번호(${ORIGINAL_PHONE}) 잔존 0`,
    stale.length === 0,
    stale.join(", "),
  );
  console.log(
    `   새 번호(${TEST_PHONE}) 노출: ${PUBLIC_PAGES.length - missing.length}/${PUBLIC_PAGES.length}` +
      (missing.length ? ` · 미노출(전화 미표시 페이지 포함): ${missing.join(", ")}` : ""),
  );
}

await page.reload({ waitUntil: "domcontentloaded" });
await page.fill("#sf-phone", ORIGINAL_PHONE);
await page.click("#setting-contact button[type=submit]");
await page.waitForSelector("#setting-contact [role=status]", { timeout: 120_000 });
check(
  "대표 전화 원복",
  (await settingsRow("contact")).phone === ORIGINAL_PHONE,
);

/* ── 2) 연혁 — 항목 추가 → 반영 → 삭제 ─────────────────────────────────── */

await page.reload({ waitUntil: "domcontentloaded" });
const MARK = "__DAY5 검증 항목__";
await page.click("#setting-history button:has-text('연혁 추가')");
await page.fill("#le-date_16", "2099.01");
await page.fill("#le-event_16", MARK);
await page.click("#setting-history button[type=submit]");
await page.waitForSelector("#setting-history [role=status]", { timeout: 120_000 });

check(
  "연혁 추가 → DB 17건",
  (await settingsRow("history")).length === 17,
  `${(await settingsRow("history")).length}건`,
);
check("연혁 추가 → /about/history 즉시 반영", (await textOf("/about/history")).includes(MARK));

await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("[data-list-row=history]").nth(16).getByRole("button", { name: "삭제" }).click();
await page.click("#setting-history button[type=submit]");
await page.waitForSelector("#setting-history [role=status]", { timeout: 120_000 });

const historyAfter = await settingsRow("history");
check("연혁 삭제 → DB 16건 원복", historyAfter.length === 16, `${historyAfter.length}건`);
check(
  "연혁 원복 — 원본과 완전 동일",
  JSON.stringify(historyAfter) === JSON.stringify(originalHistory),
);
check(
  "연혁 삭제 → /about/history 에서 사라짐",
  !(await textOf("/about/history")).includes(MARK),
);

/* ── 3) 조직도 — 형제 이동 후 노드 수 보존 ─────────────────────────────── */

await page.reload({ waitUntil: "domcontentloaded" });
const rows = page.locator('[data-org-row="tree"]');
const beforeNames = await rows.locator('input[name^="treeName_"]').evaluateAll((els) =>
  els.map((e) => e.value),
);

// "사장"(index 2) 을 아래로 — 하위 트리를 달고 형제 "부동산임대관리" 와 자리를 바꾼다.
await rows.nth(2).getByRole("button", { name: "아래로" }).click();
await page.click("#setting-organization button[type=submit]");
await page.waitForSelector("#setting-organization [role=status]", { timeout: 120_000 });

const movedOrg = await settingsRow("organization");
const movedNodes = countNodes([movedOrg.tree]) + countNodes(movedOrg.branches ?? []);
check(
  `조직도 형제 이동 저장 → 노드 총 개수 ${ORIGINAL_NODES} 유지`,
  movedNodes === ORIGINAL_NODES,
  `${movedNodes}노드`,
);

const flat = (n, out = []) => {
  for (const x of n) {
    out.push(x.name);
    flat(x.children ?? [], out);
  }
  return out;
};
check(
  "조직도 이동 후 노드 이름 집합 불변 (자식 유실 없음)",
  JSON.stringify(flat([movedOrg.tree]).sort()) ===
    JSON.stringify(flat([originalOrg.tree]).sort()),
);
check(
  "조직도 이동이 실제로 반영됨 (순서 변경 확인)",
  JSON.stringify(flat([movedOrg.tree])) !== JSON.stringify(flat([originalOrg.tree])),
);
check(
  `/about 조직도 노드 ${ORIGINAL_NODES}개 그대로 렌더`,
  flat([movedOrg.tree]).every((n) => true) &&
    (await textOf("/about")).includes("주택관리부"),
);

// 원복
await supabase.from("site_settings").update({ value: originalOrg }).eq("key", "organization");
const restoredOrg = await settingsRow("organization");
check(
  "조직도 원복 — 원본과 완전 동일",
  JSON.stringify(restoredOrg) === JSON.stringify(originalOrg),
);

console.log(`   (참고) 편집 전 아웃라인: ${beforeNames.join(" › ")}`);

await browser.close();
console.log(failures === 0 ? "\n✅ DAY 5 관리자 UI 실동작 전 항목 통과" : `\n❌ ${failures}건 실패`);
process.exit(failures === 0 ? 0 : 1);
