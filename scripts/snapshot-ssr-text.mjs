/**
 * SSR 가시 텍스트 스냅샷 — 같은 오리진의 "전환 전 ↔ 전환 후" 대조 (PLAN B / DAY 7).
 *
 * `diff-ssr-text.mjs` 는 두 오리진(프로덕션 ↔ 로컬)을 비교한다. DAY 7 은 11개 page.tsx 를
 * 섹션 레지스트리로 바꾸는 작업이라 "같은 로컬 서버에서 코드 변경 전후" 를 비교해야 한다.
 * 그래야 프로덕션·로컬 환경 차이라는 노이즈가 아예 끼지 않는다.
 *
 * 사용법:
 *   node scripts/snapshot-ssr-text.mjs save before            # 전 경로 저장
 *   node scripts/snapshot-ssr-text.mjs save after /contact    # 일부 경로만 저장
 *   node scripts/snapshot-ssr-text.mjs diff before after      # 저장분끼리 비교
 *   BASE=http://localhost:3000 node scripts/snapshot-ssr-text.mjs save before-dev
 *
 * 저장 위치: docs/regression/ssr/<phase>/<경로키>.txt
 * 종료코드: diff 모드에서 전 경로 0줄이면 0, 아니면 1.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { visibleLines, pathKey } from "./lib/visible-text.mjs";

const BASE = process.env.BASE || "http://localhost:3210";
const OUT_ROOT = path.resolve(process.cwd(), "docs/regression/ssr");

/** DAY 7 전환 대상 11개 + 사업영역 상세 5슬러그 + 대조군 /notices. */
export const PATHS = [
  "/",
  "/about",
  "/about/ceo",
  "/about/history",
  "/about/location",
  "/business",
  "/business/facility",
  "/business/sanitation",
  "/business/security",
  "/business/construction",
  "/business/others",
  "/cases",
  "/licenses",
  "/careers",
  "/contact",
  "/notices",
];

const [mode, ...rest] = process.argv.slice(2);

async function save(phase, paths) {
  const dir = path.join(OUT_ROOT, phase);
  await mkdir(dir, { recursive: true });
  for (const p of paths) {
    const res = await fetch(`${BASE}${p}`, { headers: { "user-agent": "kb-regression" } });
    if (!res.ok) {
      console.log(`❌ ${p} → HTTP ${res.status}`);
      process.exitCode = 1;
      continue;
    }
    const lines = visibleLines(await res.text());
    await writeFile(path.join(dir, `${pathKey(p)}.txt`), lines.join("\n") + "\n", "utf8");
    console.log(`💾 ${p}  ${lines.length}줄`);
  }
}

async function diff(a, b, paths) {
  let failed = 0;
  for (const p of paths) {
    const key = pathKey(p);
    let la, lb;
    try {
      la = (await readFile(path.join(OUT_ROOT, a, `${key}.txt`), "utf8")).split("\n").filter(Boolean);
      lb = (await readFile(path.join(OUT_ROOT, b, `${key}.txt`), "utf8")).split("\n").filter(Boolean);
    } catch (e) {
      console.log(`⏭  ${p}  스냅샷 없음 (${e.code})`);
      continue;
    }
    const d = [];
    for (let i = 0; i < Math.max(la.length, lb.length); i++) {
      if (la[i] !== lb[i]) d.push({ i, a: la[i] ?? "(없음)", b: lb[i] ?? "(없음)" });
    }
    console.log(`${d.length === 0 ? "✅" : "❌"} ${p}  ${a}=${la.length}줄  ${b}=${lb.length}줄  diff=${d.length}`);
    for (const x of d.slice(0, 20)) {
      console.log(`   [${x.i}] ${a}: ${x.a}`);
      console.log(`        ${b}: ${x.b}`);
    }
    if (d.length > 20) console.log(`   … 외 ${d.length - 20}건`);
    if (d.length) failed++;
  }
  console.log(failed === 0 ? "\n✅ 전 경로 diff 0줄" : `\n❌ ${failed}개 경로 불일치`);
  process.exit(failed === 0 ? 0 : 1);
}

if (mode === "save") {
  const [phase, ...only] = rest;
  if (!phase) { console.error("사용법: save <phase> [경로...]"); process.exit(1); }
  await save(phase, only.length ? only : PATHS);
} else if (mode === "diff") {
  const [a, b, ...only] = rest;
  if (!a || !b) { console.error("사용법: diff <phaseA> <phaseB> [경로...]"); process.exit(1); }
  await diff(a, b, only.length ? only : PATHS);
} else {
  console.error("사용법: node scripts/snapshot-ssr-text.mjs <save|diff> …");
  process.exit(1);
}
