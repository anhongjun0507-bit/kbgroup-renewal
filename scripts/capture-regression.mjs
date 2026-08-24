/**
 * 회귀 베이스라인 스크린샷 캡처 (PROGRESS.md §8)
 *
 * DAY 7 섹션 레지스트리 전환 전후를 동일 조건으로 캡처해 픽셀 비교하기 위한 스크립트.
 *
 * 사용법:
 *   node scripts/capture-regression.mjs before          # docs/regression/before/ 에 저장
 *   node scripts/capture-regression.mjs after           # docs/regression/after/ 에 저장
 *   BASE_URL=http://localhost:3000 node scripts/capture-regression.mjs before
 *
 * playwright 는 이 저장소의 의존성이 아니다(계약 범위 밖 의존성 추가 금지).
 * 머신에 이미 설치된 playwright 를 PLAYWRIGHT_PATH 로 지정해 쓴다.
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright node scripts/capture-regression.mjs before
 */

import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const PLAYWRIGHT_PATH = process.env.PLAYWRIGHT_PATH || "playwright";
const { chromium } = require(PLAYWRIGHT_PATH);

const BASE_URL = process.env.BASE_URL || "https://kbgroup-renewal.vercel.app";
const phase = process.argv[2];
if (phase !== "before" && phase !== "after") {
  console.error('사용법: node scripts/capture-regression.mjs <before|after>');
  process.exit(1);
}

const OUT_DIR = path.resolve(process.cwd(), "docs/regression", phase);

/* 공개 페이지 11개 (§8 순서 고정 — 순번이 파일명 prefix 가 된다) */
const PAGES = [
  { n: "01", slugName: "home", url: "/" },
  { n: "02", slugName: "about", url: "/about" },
  { n: "03", slugName: "about-ceo", url: "/about/ceo" },
  { n: "04", slugName: "about-history", url: "/about/history" },
  { n: "05", slugName: "about-location", url: "/about/location" },
  { n: "06", slugName: "business", url: "/business" },
  { n: "07", slugName: "cases", url: "/cases" },
  { n: "08", slugName: "licenses", url: "/licenses" },
  { n: "09", slugName: "careers", url: "/careers" },
  { n: "10", slugName: "contact", url: "/contact" },
  { n: "11", slugName: "notices", url: "/notices" },
];

/**
 * /cases/[slug] 샘플 3건.
 * ※ pastComplexes 는 generateStaticParams 대상이 아니고 app/cases/[slug]/page.tsx:60 에서
 *   notFound() 로 빠지므로 상세 페이지가 존재하지 않는다. 따라서 §8 의 "과거 단지" 자리를
 *   렌더 분기가 다른 "이미지 없는 민간 단지(모노그램 fallback)"로 대체한다.
 */
const CASE_SAMPLES = [
  { n: "12", slugName: "cases-detail-lh", name: "LH시흥 장현 트리플센텀 (A-8블록)" },
  { n: "13", slugName: "cases-detail-private", name: "계림아이파크 SK뷰" },
  { n: "14", slugName: "cases-detail-nophoto", name: "금남로 센텀시티" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

/* 애니메이션 정지 — framer-motion 진입 애니메이션이 캡처 타이밍에 따라 달라지는 것을 막는다. */
const FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
  video { visibility: hidden !important; }
`;

async function capture(page, url, outfile) {
  const res = await page.goto(BASE_URL + url, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  const status = res?.status() ?? 0;

  /* lazy 이미지·IntersectionObserver 섹션을 전부 깨우기 위해 끝까지 스크롤 후 복귀 */
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        y += window.innerHeight;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 120);
        else {
          window.scrollTo(0, 0);
          setTimeout(resolve, 600);
        }
      };
      step();
    });
  });
  await page.waitForTimeout(1200);
  /* /cases 는 153개 카드로 페이지가 매우 길다. 기본 30s 로는 fullPage 캡처가 끊긴다. */
  await page.screenshot({ path: outfile, fullPage: true, timeout: 180_000 });
  return status;
}

const browser = await chromium.launch();
await mkdir(OUT_DIR, { recursive: true });

/* 특정 항목만 다시 찍고 싶을 때: ONLY=07,12 node scripts/capture-regression.mjs before */
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const VIEWPORT_FILTER = process.env.VIEWPORT ? process.env.VIEWPORT.split(",") : null;

const targets = [
  ...PAGES,
  ...CASE_SAMPLES.map((c) => ({
    n: c.n,
    slugName: c.slugName,
    url: `/cases/${encodeURIComponent(c.name)}`,
  })),
].filter((t) => !ONLY || ONLY.has(t.n));

let failures = 0;
for (const vp of VIEWPORTS.filter((v) => !VIEWPORT_FILTER || VIEWPORT_FILTER.includes(v.name))) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => {
    /* CountUp 등 시간 의존 렌더의 흔들림을 줄인다 */
    window.__REGRESSION_CAPTURE__ = true;
  });
  const page = await ctx.newPage();
  await page.addStyleTag({ content: FREEZE_CSS }).catch(() => {});
  await ctx.addInitScript(
    ([css]) => {
      document.addEventListener("DOMContentLoaded", () => {
        const el = document.createElement("style");
        el.textContent = css;
        document.head.appendChild(el);
      });
    },
    [FREEZE_CSS],
  );

  for (const t of targets) {
    const outfile = path.join(OUT_DIR, `${t.n}_${t.slugName}_${vp.name}.png`);
    try {
      const status = await capture(page, t.url, outfile);
      const mark = status === 200 ? "OK " : `HTTP ${status}`;
      if (status !== 200) failures++;
      console.log(`[${mark}] ${vp.name} ${t.url} -> ${path.basename(outfile)}`);
    } catch (err) {
      failures++;
      console.log(`[FAIL] ${vp.name} ${t.url}: ${err.message}`);
    }
  }
  await ctx.close();
}

await browser.close();
console.log(`\n저장 위치: ${OUT_DIR}`);
console.log(failures === 0 ? "전부 성공." : `실패 ${failures}건 — 확인 필요.`);
process.exit(failures === 0 ? 0 : 1);
