/**
 * lib/content 읽기 어댑터 검증 (PLAN B / DAY 3-B).
 *
 * 3모드를 각각 돌려 결과가 서로 같은지 본다:
 *   db     — 기본. Supabase 조회.
 *   file   — CONTENT_SOURCE=file 킬스위치. DB 조회 없음.
 *   broken — DB 호스트를 고의로 깨뜨려 폴백 경로를 강제.
 *
 * 실행:
 *   node --experimental-strip-types --import ./scripts/node-ts-register.mjs \
 *     scripts/verify-content-adapter.ts
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const REAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const mode = (process.argv[2] ?? "all") as "db" | "file" | "broken" | "all";

const { FILE_COMPLEXES, FILE_SETTINGS } = await import("../lib/content/file-source.ts");
const { getAllComplexes, getComplexes, getPastComplexes, getComplexBySlug } =
  await import("../lib/content/complexes.ts");
const { getSettings } = await import("../lib/content/settings.ts");

/** 코드포인트 단위 비교 (E-3/E-10). */
function cpDiff(a: string, b: string): string | null {
  const A = [...a];
  const B = [...b];
  if (A.length !== B.length) return `코드포인트 길이 ${A.length} != ${B.length}`;
  for (let i = 0; i < A.length; i++) {
    if (A[i] !== B[i]) {
      return `[${i}] U+${A[i].codePointAt(0)!.toString(16)} != U+${B[i].codePointAt(0)!.toString(16)}`;
    }
  }
  return null;
}

/** JSONB 왕복은 객체 키 순서를 보존하지 않는다. 키 정렬 후 값만 비교한다. */
function canon(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as object)
        .sort()
        .map((k) => [k, canon((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

/** id·updatedAt 은 DB 에만 있는 값이라 비교 대상이 아니다. */
const IGNORE = new Set(["id", "updatedAt"]);

async function run(label: string) {
  const all = await getAllComplexes();
  const active = await getComplexes();
  const past = await getPastComplexes();
  const origin = all[0].id.startsWith("file:") ? "file" : "db";

  const problems: string[] = [];
  if (all.length !== FILE_COMPLEXES.length) {
    problems.push(`건수 ${all.length} != ${FILE_COMPLEXES.length}`);
  }
  for (let i = 0; i < Math.min(all.length, FILE_COMPLEXES.length); i++) {
    const f = FILE_COMPLEXES[i] as unknown as Record<string, unknown>;
    const d = all[i] as unknown as Record<string, unknown>;
    for (const k of Object.keys(f)) {
      if (IGNORE.has(k)) continue;
      const fv = f[k];
      const dv = d[k];
      if (typeof fv === "string" && typeof dv === "string") {
        const r = cpDiff(fv, dv);
        if (r) problems.push(`#${i} ${String(f.name)}.${k} ${r}`);
      } else if (Array.isArray(fv) && Array.isArray(dv)) {
        if (fv.length !== dv.length) {
          problems.push(`#${i} ${String(f.name)}.${k} 배열길이 ${fv.length} != ${dv.length}`);
        } else {
          fv.forEach((v, j) => {
            if (v !== dv[j]) problems.push(`#${i} ${String(f.name)}.${k}[${j}] ${v} != ${dv[j]}`);
          });
        }
      } else if (!Object.is(fv, dv)) {
        problems.push(`#${i} ${String(f.name)}.${k} ${JSON.stringify(fv)} != ${JSON.stringify(dv)}`);
      }
    }
  }

  const settings = await getSettings();
  for (const k of Object.keys(FILE_SETTINGS)) {
    const a = JSON.stringify(canon((FILE_SETTINGS as Record<string, unknown>)[k]));
    const b = JSON.stringify(canon((settings as Record<string, unknown>)[k]));
    if (a !== b) problems.push(`settings.${k} 불일치`);
  }

  // 과거 단지 slug 는 상세 페이지가 없어야 한다 (PROGRESS §11-5).
  const pastLookup = await getComplexBySlug(past[0].slug);
  if (pastLookup !== undefined) problems.push(`과거 단지 slug 가 상세 조회에 잡힘: ${past[0].slug}`);

  console.log(
    `[${label}] origin=${origin} total=${all.length} active=${active.length} past=${past.length} ` +
      `과거slug404=${pastLookup === undefined ? "OK" : "FAIL"} → ` +
      (problems.length === 0 ? "✅ 파일 원본과 불일치 0건" : `❌ ${problems.length}건`),
  );
  if (problems.length) console.log(problems.slice(0, 20).map((p) => "   " + p).join("\n"));
  return problems.length === 0 && origin === (label === "db" ? "db" : "file");
}

let ok = true;
if (mode === "db" || mode === "all") {
  process.env.CONTENT_SOURCE = "db";
  process.env.NEXT_PUBLIC_SUPABASE_URL = REAL_URL;
  ok = (await run("db")) && ok;
}
if (mode === "file" || mode === "all") {
  process.env.CONTENT_SOURCE = "file";
  process.env.NEXT_PUBLIC_SUPABASE_URL = REAL_URL;
  ok = (await run("file")) && ok;
}
if (mode === "broken" || mode === "all") {
  // DB 모드인데 조회가 실패하는 상황 → 파일 폴백이 자동으로 흡수해야 한다.
  process.env.CONTENT_SOURCE = "db";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://invalid.invalid.invalid";
  ok = (await run("broken")) && ok;
}

console.log(ok ? "\n✅ 3모드 전부 통과" : "\n❌ 실패");
process.exit(ok ? 0 : 1);
