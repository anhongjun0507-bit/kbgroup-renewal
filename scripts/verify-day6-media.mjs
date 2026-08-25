/**
 * DAY 6 이미지·영상 업로더 + 히어로 교체 실동작 검증 (PLAN B).
 *
 * 실제 브라우저로 관리자 화면을 열고, 실제 파일을 Supabase Storage 에 올린 뒤
 * **저장 → 공개 페이지 즉시 반영 → 원복** 까지 돈다. 검증 후 DB 값은 전부 원래대로 돌린다.
 *
 *  1) 이미지 업로드 — 계열사 로고 1건을 Storage 에 올리고 /about 반영 확인
 *  2) 영상 업로드   — 20MB 히어로 영상을 site-videos 에 올리고 메인 반영 확인 (50MB 상한 실측)
 *  3) remotePatterns — Storage URL 이미지가 next/image 최적화(/_next/image)로 200 인지 (E-4)
 *  4) 히어로 슬라이드 — 추가·삭제·순서 변경 후 카운터·전환 동작
 *  5) 원복 — heroSlides·relatedCompanies 를 원래 값으로 되돌리고 대조
 *
 * playwright 는 이 저장소의 의존성이 아니다. PLAYWRIGHT_PATH 로 주입한다.
 *   BASE_URL=http://localhost:3210 \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-day6-media.mjs
 */
import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { openAdminBrowser, loadEnvLocal } from "./lib/admin-session.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

loadEnvLocal(readFileSync);

const BASE = process.env.BASE_URL || "http://localhost:3210";
const ADMIN_EMAIL = process.env.INSPECT_ADMIN_EMAIL || "inspect-admin@kbgroup.kr";

/** 실제로 올릴 파일. 히어로 영상 중 가장 큰 것(약 20MB)으로 50MB 상한을 실측한다. */
const TEST_IMAGE = "public/images/hero/slide-06.png";
const TEST_VIDEO = "public/images/hero/7644032-uhd_2160_4096_25fps.mp4";

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

const settingsRow = async (key) => {
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).single();
  return data.value;
};
const restore = async (key, value) => {
  const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
  if (error) throw new Error(`${key} 원복 실패: ${error.message}`);
  const after = await settingsRow(key);
  check(`${key} 원복 — 원본과 완전 일치`, JSON.stringify(after) === JSON.stringify(value));
};

async function html(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.text();
}

const ORIGINAL_HERO = await settingsRow("heroSlides");
const ORIGINAL_RELATED = await settingsRow("relatedCompanies");

const MB = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
console.log(`업로드 대상 — 이미지 ${MB(TEST_IMAGE)}MB · 영상 ${MB(TEST_VIDEO)}MB\n`);

const { browser, page } = await openAdminBrowser({ base: BASE, adminEmail: ADMIN_EMAIL, supabase });

await page.goto(`${BASE}/admin/content/settings`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#setting-heroSlides", { timeout: 120_000 });
check("관리자 설정 화면 진입", !page.url().includes("/login"), page.url());

/* ── 0) 새 편집기 렌더 ─────────────────────────────────────────────────── */

const heroRows = await page.locator("[data-list-row=heroSlides]").count();
check(
  `히어로 슬라이드 ${ORIGINAL_HERO.length}개 렌더`,
  heroRows === ORIGINAL_HERO.length,
  `${heroRows}개 (영상 ${ORIGINAL_HERO.filter((s) => s.type === "video").length} · 사진 ${ORIGINAL_HERO.filter((s) => s.type === "image").length})`,
);
const galleryRows = await page.locator("[data-list-row=businessGallery]").count();
check("사업영역 현장 사진 6장 렌더", galleryRows === 6, `${galleryRows}장`);
check(
  "업로더 위젯 렌더 (히어로 src·poster + 갤러리 + 로고 + 인허가 + 대표 사진)",
  (await page.locator("[data-media-uploader]").count()) > 0,
  `${await page.locator("[data-media-uploader]").count()}개`,
);

/* ── 1) 이미지 업로드 — 계열사 1번 로고 ─────────────────────────────────── */

async function uploadInto(rowSelector, fieldName, filePath) {
  const uploader = page.locator(`${rowSelector} [data-media-uploader="${fieldName}"]`);
  await uploader.locator('input[type=file]').setInputFiles(filePath);
  await uploader.locator("[data-upload-status]").waitFor({ timeout: 180_000 });
  return uploader.locator(`input[data-media-value="${fieldName}"]`).inputValue();
}

{
  const url = await uploadInto("#setting-relatedCompanies fieldset:nth-of-type(1)", "logo_0", TEST_IMAGE);
  check(
    "이미지 업로드 — site-images 공개 URL 획득",
    url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/related-companies/0/`),
    url,
  );

  const head = await fetch(url, { method: "HEAD" });
  check("업로드한 이미지 직접 접근 200", head.status === 200, `HTTP ${head.status}`);

  await page.click("#setting-relatedCompanies button[type=submit]");
  await page.waitForSelector("#setting-relatedCompanies [role=status]", { timeout: 120_000 });

  const saved = await settingsRow("relatedCompanies");
  check("저장 후 DB 포인터 교체", saved[0].logo === url, saved[0].logo);
  check(
    "나머지 계열사 3건 무변경",
    JSON.stringify(saved.slice(1)) === JSON.stringify(ORIGINAL_RELATED.slice(1)),
  );

  const about = await html("/about");
  check("/about 에 새 로고 URL 반영 (재빌드 없이)", about.includes(encodeURI(url).replace(/&/g, "&amp;")) || about.includes(url.split("/").pop()), "");

  // E-4 — next/image 최적화 경로가 Storage 호스트를 실제로 통과하는지
  const opt = `${BASE}/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`;
  const optRes = await fetch(opt);
  check(
    "E-4 remotePatterns — /_next/image 로 Storage 이미지 최적화 200",
    optRes.status === 200,
    `HTTP ${optRes.status} · ${optRes.headers.get("content-type")}`,
  );
}

/* ── 2) 영상 업로드 — 히어로 1번 슬라이드 교체 ──────────────────────────── */

{
  const url = await uploadInto("#setting-heroSlides fieldset:nth-of-type(1)", "src_0", TEST_VIDEO);
  check(
    `영상 업로드 (${MB(TEST_VIDEO)}MB) — site-videos 공개 URL 획득`,
    url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-videos/hero/0/`),
    url,
  );
  const head = await fetch(url, { method: "HEAD" });
  check(
    "업로드한 영상 직접 접근 200 · 크기 일치",
    head.status === 200 && Number(head.headers.get("content-length")) === statSync(TEST_VIDEO).size,
    `HTTP ${head.status} · ${head.headers.get("content-length")} bytes`,
  );

  await page.click("#setting-heroSlides button[type=submit]");
  await page.waitForSelector("#setting-heroSlides [role=status]", { timeout: 120_000 });

  const saved = await settingsRow("heroSlides");
  check("저장 후 heroSlides[0].src 교체", saved[0].src === url, saved[0].src);
  check("슬라이드 수 유지", saved.length === ORIGINAL_HERO.length, `${saved.length}개`);
  check(
    "나머지 7슬라이드 무변경",
    JSON.stringify(saved.slice(1)) === JSON.stringify(ORIGINAL_HERO.slice(1)),
  );

  const home = await html("/");
  check("메인 HTML 에 Storage 영상 URL 반영 (재빌드 없이)", home.includes(url));
}

/* ── 3) 히어로 슬라이드 동작 — 카운터·전환 ─────────────────────────────── */

async function heroCounter() {
  const home = await page.context().newPage();
  await home.goto(BASE, { waitUntil: "domcontentloaded" });
  await home.waitForSelector('section[aria-label="히어로"]');
  const spans = home.locator('section[aria-label="히어로"] .tabular-nums');
  const total = (await spans.nth(1).innerText()).trim();
  await home.click('section[aria-label="히어로"] button[aria-label="다음 슬라이드"]');
  const current = (await spans.nth(0).innerText()).trim();
  const videos = await home.locator('section[aria-label="히어로"] video').count();
  const images = await home.locator('section[aria-label="히어로"] img').count();
  await home.close();
  return { total, current, videos, images };
}

{
  const c = await heroCounter();
  check(
    `슬라이드 카운터 총 개수 = ${ORIGINAL_HERO.length}`,
    c.total === String(ORIGINAL_HERO.length).padStart(2, "0"),
    c.total,
  );
  check("다음 슬라이드 버튼 → 카운터 02", c.current === "02", c.current);
  check(
    "영상 5 · 사진 3 요소 렌더",
    c.videos === 5 && c.images === 3,
    `video ${c.videos} · img ${c.images}`,
  );
}

/* ── 4) 슬라이드 추가 → 삭제 → 순서 변경 ───────────────────────────────── */

{
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.click("#setting-heroSlides button:has-text('슬라이드 추가')");
  const n = await page.locator("[data-list-row=heroSlides]").count();
  check("슬라이드 추가 — 행 +1", n === ORIGINAL_HERO.length + 1, `${n}행`);

  const last = `#setting-heroSlides fieldset:nth-of-type(${n})`;
  await page.fill(`${last} input[name=alt_${n - 1}]`, "DAY6 검증 슬라이드");
  await page.selectOption(`${last} select[name=type_${n - 1}]`, "image");
  const url = await uploadInto(last, `src_${n - 1}`, TEST_IMAGE);
  await page.click("#setting-heroSlides button[type=submit]");
  await page.waitForSelector("#setting-heroSlides [role=status]", { timeout: 120_000 });

  const saved = await settingsRow("heroSlides");
  check("추가한 슬라이드 DB 반영", saved.length === ORIGINAL_HERO.length + 1, `${saved.length}개`);
  check("추가 슬라이드 값", saved.at(-1).alt === "DAY6 검증 슬라이드" && saved.at(-1).src === url);

  const c = await heroCounter();
  check(`카운터가 ${ORIGINAL_HERO.length + 1}로 자동 증가`, c.total === String(ORIGINAL_HERO.length + 1).padStart(2, "0"), c.total);

  // 순서 변경 — 마지막 슬라이드를 한 칸 위로
  await page.reload({ waitUntil: "domcontentloaded" });
  const rows = await page.locator("[data-list-row=heroSlides]").count();
  await page.click(`#setting-heroSlides fieldset:nth-of-type(${rows}) button[aria-label='${rows}번 항목 위로']`);
  await page.click("#setting-heroSlides button[type=submit]");
  await page.waitForSelector("#setting-heroSlides [role=status]", { timeout: 120_000 });
  const moved = await settingsRow("heroSlides");
  check(
    "순서 변경 — 마지막이 한 칸 위로, 슬라이드 수·이름 집합 불변",
    moved.length === saved.length &&
      moved.at(-2).alt === "DAY6 검증 슬라이드" &&
      JSON.stringify(moved.map((s) => s.alt).sort()) === JSON.stringify(saved.map((s) => s.alt).sort()),
    moved.map((s) => s.alt).join(" · "),
  );

  // 삭제 — 검증 슬라이드 제거
  await page.reload({ waitUntil: "domcontentloaded" });
  const idx = moved.findIndex((s) => s.alt === "DAY6 검증 슬라이드") + 1;
  page.once("dialog", (d) => d.accept());
  await page.click(`#setting-heroSlides fieldset:nth-of-type(${idx}) button[data-row-delete]`);
  await page.click("#setting-heroSlides button[type=submit]");
  await page.waitForSelector("#setting-heroSlides [role=status]", { timeout: 120_000 });
  const afterDelete = await settingsRow("heroSlides");
  check(
    "삭제 — 슬라이드 수 원래대로",
    afterDelete.length === ORIGINAL_HERO.length,
    `${afterDelete.length}개`,
  );
}

/* ── 5) 원복 ───────────────────────────────────────────────────────────── */

await restore("heroSlides", ORIGINAL_HERO);
await restore("relatedCompanies", ORIGINAL_RELATED);

/* 원복은 service_role 로 DB 를 직접 고친 것이라 캐시 태그가 무효화되지 않는다
   (updateTag 는 Server Action 안에서만 부른다 — §10-1 규약). 관리자 화면에서 무변경 저장을
   한 번 돌려 태그를 무효화하고, 그때 값이 1바이트도 안 바뀌는지도 함께 확인한다. */
for (const key of ["heroSlides", "relatedCompanies"]) {
  const before = await settingsRow(key);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.click(`#setting-${key} button[type=submit]`);
  await page.waitForSelector(`#setting-${key} [role=status]`, { timeout: 120_000 });
  const after = await settingsRow(key);
  check(`무변경 왕복 — ${key} 저장 전후 완전 일치 (캐시 무효화 겸용)`, JSON.stringify(before) === JSON.stringify(after));
}

{
  const home = await html("/");
  check(
    "원복 후 메인이 로컬 히어로 영상 경로로 복귀",
    home.includes(ORIGINAL_HERO[0].src) && !home.includes("/storage/v1/object/public/site-videos/"),
  );
  const about = await html("/about");
  check("원복 후 /about 이 원래 로고 경로로 복귀", about.includes(ORIGINAL_RELATED[0].logo));
}

await browser.close();
console.log(failures === 0 ? "\n✅ DAY 6 전 항목 통과" : `\n❌ ${failures}건 실패`);
process.exit(failures === 0 ? 0 : 1);
