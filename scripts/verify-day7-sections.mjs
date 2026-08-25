/**
 * DAY 7 섹션 레지스트리 실동작 검증 (PLAN B).
 *
 * 실제 브라우저로 `/admin/content/sections` 를 열어 **버튼을 클릭**하고, 공개 페이지의
 * SSR 가시 텍스트로 결과를 확인한 뒤 **원복까지** 돈다. 원복 후에는 전환 전 스냅샷과
 * 한 줄도 다르지 않아야 한다.
 *
 *  1) 관리 화면 렌더 — 11개 페이지 / 63개 섹션 / 필수 16개 잠금
 *  2) 숨김 왕복  — /licenses 의 「기술 자격증」 숨김 → 공개 페이지에서 사라짐 → 되돌리면 원상복귀
 *  3) 순서 왕복  — /careers 의 「인재상」을 「채용 중인 공고」 위로 → 순서 반영 → 되돌리면 원상복귀
 *  4) DB 최종 상태 — 전 행 is_visible=true · sort_order = 레지스트리 선언 순서
 *
 * playwright 는 이 저장소의 의존성이 아니다. PLAYWRIGHT_PATH 로 주입한다.
 *   BASE_URL=http://localhost:3300 \
 *   BASELINE=docs/regression/ssr/before-dev \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-day7-sections.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openAdminBrowser, loadEnvLocal } from "./lib/admin-session.mjs";
import { visibleLines } from "./lib/visible-text.mjs";
import { PAGE_SECTIONS } from "../lib/sections/meta.ts";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

loadEnvLocal(readFileSync);

const BASE = process.env.BASE_URL || "http://localhost:3300";
const BASELINE = process.env.BASELINE || "docs/regression/ssr/before-dev";
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

async function lines(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { "user-agent": "kb-regression" } });
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

/** 관리 화면의 현재 섹션 순서(키 배열). 서버 액션 결과를 폴링으로 기다릴 때 쓴다. */
async function rowKeys(page, pageId) {
  /* 행마다 「순번 span」과 「키 span」이 있고, 키 쪽만 ml-2 를 갖는다. */
  return page.locator(`#${pageId} li span.font-mono-num.ml-2`).allTextContents();
}

/** 조건이 만족될 때까지 폴링. 서버 액션은 내비게이션이 없어 waitForLoadState 로는 못 잡는다. */
async function until(fn, label, timeout = 60_000) {
  const started = Date.now();
  for (;;) {
    if (await fn()) return;
    if (Date.now() - started > timeout) throw new Error(`대기 시간 초과: ${label}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

const { browser, page } = await openAdminBrowser({ base: BASE, adminEmail: ADMIN_EMAIL, supabase });

try {
  /* ── 1) 관리 화면 렌더 ─────────────────────────────────────────────── */
  const res = await page.goto(`${BASE}/admin/content/sections`, { waitUntil: "domcontentloaded" });
  check("/admin/content/sections 200", res.status() === 200, `HTTP ${res.status()}`);

  const totalSections = Object.values(PAGE_SECTIONS).reduce((n, p) => n + p.sections.length, 0);
  const lockedCount = Object.values(PAGE_SECTIONS).reduce(
    (n, p) => n + p.sections.filter((s) => !s.removable).length,
    0,
  );
  const cards = await page.locator("section[id^='page-']").count();
  const rows = await page.locator("section[id^='page-'] li").count();
  const locked = await page.getByText("표시 고정", { exact: true }).count();
  check("페이지 카드 수", cards === Object.keys(PAGE_SECTIONS).length, `${cards}개`);
  check("섹션 행 수", rows === totalSections, `${rows}행 (레지스트리 ${totalSections})`);
  check("필수 섹션 숨김 잠금", locked === lockedCount, `표시 고정 ${locked}개 (기대 ${lockedCount})`);

  /* ── 2) 숨김 왕복 (/licenses · 기술 자격증) ────────────────────────── */
  const licBefore = baseline("licenses");
  const licLive = await lines("/licenses");
  check("사전 상태 — /licenses 가 전환 전 스냅샷과 동일", firstDiff(licBefore, licLive) === null,
    firstDiff(licBefore, licLive) ?? "diff 0줄");

  const certRow = page.locator("#page-licenses li").filter({ hasText: "certifications-grid" });
  await certRow.getByRole("button", { name: "표시", exact: true }).click();
  await until(
    async () => (await certRow.getByRole("button", { name: "숨김", exact: true }).count()) === 1,
    "certifications-grid 숨김 반영",
  );

  const licHidden = await lines("/licenses");
  check(
    "숨김 반영 — 「27종의 전문 기술 자격」 사라짐",
    licBefore.includes("27종의 전문 기술 자격") && !licHidden.includes("27종의 전문 기술 자격"),
  );
  check(
    "숨김은 해당 섹션만 — 나머지 줄은 전부 보존",
    licHidden.every((l) => licBefore.includes(l)) && licHidden.length < licBefore.length,
    `${licBefore.length}줄 → ${licHidden.length}줄`,
  );
  check(
    "관리 화면에 숨김 상태 표시",
    (await certRow.getByRole("button", { name: "숨김", exact: true }).count()) === 1,
  );

  await certRow.getByRole("button", { name: "숨김", exact: true }).click();
  await until(
    async () => (await certRow.getByRole("button", { name: "표시", exact: true }).count()) === 1,
    "certifications-grid 표시 복귀",
  );
  const licRestored = await lines("/licenses");
  check("숨김 왕복 — 원래 배치로 정확히 복귀", firstDiff(licBefore, licRestored) === null,
    firstDiff(licBefore, licRestored) ?? "diff 0줄");

  /* ── 3) 순서 왕복 (/careers · 인재상을 채용 공고 위로) ──────────────── */
  const carBefore = baseline("careers");
  const idx = (arr, s) => arr.indexOf(s);
  check(
    "사전 상태 — 공고(OPEN POSITIONS)가 인재상(OUR PEOPLE)보다 위",
    idx(carBefore, "OPEN POSITIONS") < idx(carBefore, "OUR PEOPLE"),
    `${idx(carBefore, "OPEN POSITIONS")} < ${idx(carBefore, "OUR PEOPLE")}`,
  );

  const valuesRow = page.locator("#page-careers li").filter({ hasText: "values" }).first();
  await valuesRow.getByRole("button", { name: "인재상 위로" }).click();
  await until(
    async () => (await rowKeys(page, "page-careers"))[1] === "values",
    "careers 순서 변경 반영",
  );

  const carMoved = await lines("/careers");
  check(
    "순서 반영 — 인재상이 공고보다 위로",
    idx(carMoved, "OUR PEOPLE") < idx(carMoved, "OPEN POSITIONS"),
    `${idx(carMoved, "OUR PEOPLE")} < ${idx(carMoved, "OPEN POSITIONS")}`,
  );
  check(
    "순서 변경은 줄 수를 바꾸지 않는다",
    carMoved.length === carBefore.length,
    `${carMoved.length}줄`,
  );

  await page
    .locator("#page-careers li")
    .filter({ hasText: "values" })
    .first()
    .getByRole("button", { name: "인재상 아래로" })
    .click();
  await until(
    async () => (await rowKeys(page, "page-careers"))[1] === "openings",
    "careers 순서 원복 반영",
  );
  const carRestored = await lines("/careers");
  check("순서 왕복 — 원래 배치로 정확히 복귀", firstDiff(carBefore, carRestored) === null,
    firstDiff(carBefore, carRestored) ?? "diff 0줄");

  /* ── 4) DB 최종 상태 ───────────────────────────────────────────────── */
  const { data } = await supabase
    .from("page_sections")
    .select("page_key, section_key, is_visible, sort_order");
  const problems = [];
  for (const [pageKey, meta] of Object.entries(PAGE_SECTIONS)) {
    meta.sections.forEach((s, i) => {
      const row = (data ?? []).find((r) => r.page_key === pageKey && r.section_key === s.key);
      if (!row) problems.push(`행 없음 ${pageKey}/${s.key}`);
      else if (!row.is_visible) problems.push(`숨김 잔존 ${pageKey}/${s.key}`);
      else if (row.sort_order !== i)
        problems.push(`순서 ${pageKey}/${s.key} DB ${row.sort_order} != ${i}`);
    });
  }
  check("DB 최종 상태 — 전 행 표시 + 레지스트리 순서", problems.length === 0, problems.join(", "));
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\n전 항목 통과" : `\n실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
