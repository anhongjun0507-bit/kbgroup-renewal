/**
 * SSR 가시 텍스트 전문 대조 (PLAN B / DAY 4 에서 쓴 방식을 스크립트로 고정).
 *
 * 두 오리진의 같은 경로를 각각 받아 <script>/<style>/주석을 걷어내고 태그를 제거한 뒤
 * 가시 텍스트만 줄 단위로 비교한다. 스크린샷보다 신뢰도가 높다 —
 * framer-motion 스태거·이미지 파이프라인 차이 같은 캡처 아티팩트에 흔들리지 않는다.
 *
 * 사용법:
 *   BASE_A=https://kbgroup-renewal.vercel.app BASE_B=http://localhost:3210 \
 *     node scripts/diff-ssr-text.mjs / /business /licenses
 *
 * 종료코드: 모든 경로 diff 0줄이면 0, 하나라도 다르면 1.
 */

const BASE_A = process.env.BASE_A || "https://kbgroup-renewal.vercel.app";
const BASE_B = process.env.BASE_B || "http://localhost:3210";
const paths = process.argv.slice(2);

if (paths.length === 0) {
  console.error("사용법: node scripts/diff-ssr-text.mjs <경로...>");
  process.exit(1);
}

/** HTML → 가시 텍스트 줄 배열. */
function visibleLines(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/section|\/tr|\/td)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

async function fetchLines(base, p) {
  const res = await fetch(`${base}${p}`, { headers: { "user-agent": "kb-regression" } });
  if (!res.ok) throw new Error(`${base}${p} → HTTP ${res.status}`);
  return visibleLines(await res.text());
}

/** 최소 편집 거리 기반이 아니라 단순 순차 대조 — 줄 수가 같으면 위치별 비교로 충분하다. */
function diffLines(a, b) {
  const out = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) out.push({ i, a: a[i] ?? "(없음)", b: b[i] ?? "(없음)" });
  }
  return out;
}

let failed = 0;
for (const p of paths) {
  try {
    const [a, b] = await Promise.all([fetchLines(BASE_A, p), fetchLines(BASE_B, p)]);
    const d = diffLines(a, b);
    const mark = d.length === 0 ? "✅" : "❌";
    console.log(`${mark} ${p}  A=${a.length}줄  B=${b.length}줄  diff=${d.length}`);
    for (const x of d.slice(0, 20)) {
      console.log(`   [${x.i}] A: ${x.a}`);
      console.log(`        B: ${x.b}`);
    }
    if (d.length > 20) console.log(`   … 외 ${d.length - 20}건`);
    if (d.length > 0) failed++;
  } catch (e) {
    console.log(`❌ ${p}  ${e.message}`);
    failed++;
  }
}

console.log(failed === 0 ? "\n✅ 전 경로 diff 0줄" : `\n❌ ${failed}개 경로 불일치`);
process.exit(failed === 0 ? 0 : 1);
