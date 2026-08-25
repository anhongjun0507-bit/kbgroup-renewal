/**
 * HTML → 가시 텍스트 줄 배열 (PLAN B 회귀 검증 공용).
 *
 * `scripts/diff-ssr-text.mjs`(오리진 ↔ 오리진)와 `scripts/snapshot-ssr-text.mjs`
 * (전환 전 ↔ 전환 후)가 같은 규칙을 써야 결과를 비교할 수 있어 여기로 뽑았다.
 */
export function visibleLines(html) {
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

/** 경로 → 파일명 키. `/` 는 home, 나머지는 슬래시를 `-` 로. */
export function pathKey(p) {
  const s = p.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");
  return s === "" ? "home" : s;
}
