/**
 * scripts/seed-content.ts — PLAN B / DAY 2
 *
 * data/site-content.ts 의 값을 DB(complexes · site_settings)로 이관한다.
 * 이관 후 원본과 DB 값을 **코드포인트 단위로 딥 비교**해 검증한다 (E-3 / E-10).
 *
 * 실행:
 *   node scripts/seed-content.ts                # 시드 + 검증
 *   node scripts/seed-content.ts --dry-run      # 쓰지 않고 계획 + slug 검증만
 *   node scripts/seed-content.ts --verify-only  # 쓰지 않고 DB ↔ 원본 딥 비교만
 *
 * Node 22 의 타입 스트리핑으로 .ts 를 그대로 실행한다(빌드 단계 없음).
 * 쓰기는 service_role 키로 RLS 를 우회한다. 이 키는 서버 전용이며 NEXT_PUBLIC_ 접두사가 아니다.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import {
  company,
  contact,
  ceoMessage,
  counters,
  businessAreas,
  businessGallery,
  coreValues,
  differentiators,
  processSteps,
  companyStrengths,
  complexes,
  pastComplexes,
  partners,
  collaborators,
  licenses,
  certifications,
  heroSlides,
  history,
  organization,
  relatedCompanies,
  STATS,
  totalCertHolders,
} from "../data/site-content.ts";

// ── 환경변수 (.env.local) ────────────────────────────────────────────────────
function loadEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  let raw = "";
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...loadEnvLocal(), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("[seed] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (.env.local).");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DRY_RUN = process.argv.includes("--dry-run");
const VERIFY_ONLY = process.argv.includes("--verify-only");

// ── 코드포인트 단위 비교 ────────────────────────────────────────────────────
/** 두 문자열이 코드포인트 단위로 완전히 같은지. 다르면 첫 불일치 지점을 문자열로 돌려준다. */
function cpDiff(a: string, b: string): string | null {
  const ca = Array.from(a);
  const cb = Array.from(b);
  if (ca.length !== cb.length) {
    return `길이 ${ca.length} != ${cb.length}`;
  }
  for (let i = 0; i < ca.length; i++) {
    if (ca[i] !== cb[i]) {
      const hex = (s: string) => "U+" + s.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0");
      return `[${i}] ${hex(ca[i])}(${ca[i]}) != ${hex(cb[i])}(${cb[i]})`;
    }
  }
  return null;
}

/** JSON 값 딥 비교. 문자열은 코드포인트 단위. 불일치 경로 목록을 돌려준다. */
function deepDiff(src: unknown, got: unknown, path = "$"): string[] {
  if (typeof src === "string" && typeof got === "string") {
    const d = cpDiff(src, got);
    return d ? [`${path}: ${d}`] : [];
  }
  if (src === null || got === null || typeof src !== "object" || typeof got !== "object") {
    return Object.is(src, got) ? [] : [`${path}: ${JSON.stringify(src)} != ${JSON.stringify(got)}`];
  }
  if (Array.isArray(src) !== Array.isArray(got)) {
    return [`${path}: 배열 여부 불일치`];
  }
  if (Array.isArray(src) && Array.isArray(got)) {
    if (src.length !== got.length) return [`${path}: 배열 길이 ${src.length} != ${got.length}`];
    return src.flatMap((v, i) => deepDiff(v, got[i], `${path}[${i}]`));
  }
  const s = src as Record<string, unknown>;
  const g = got as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(s), ...Object.keys(g)])].sort();
  return keys.flatMap((k) => {
    if (!(k in s)) return [`${path}.${k}: 원본에 없는 키가 DB 에 있음`];
    if (!(k in g)) return [`${path}.${k}: DB 에 키 없음`];
    return deepDiff(s[k], g[k], `${path}.${k}`);
  });
}

/**
 * `data/site-content.ts` 에 원본이 없는 오버레이 전용 키 (PLAN B / DAY 9).
 *
 * `boardCategories` 는 코드(`lib/boards.ts`)가 원본이고 DB 는 관리자가 바꾼 값만 얹는다.
 * 시드 대상이 아니므로 "원본에 없는 키" 로 잡히면 안 된다.
 * 같은 원칙의 `nav_items`·`pages`·`page_sections` 는 아예 다른 테이블이라 이 비교에 안 들어온다.
 */
const OVERLAY_ONLY_KEYS = new Set(["boardCategories"]);

/** undefined 를 떨어뜨려 DB(JSONB) 왕복 후 형태와 맞춘다. */
function jsonNormalize<T>(v: T): unknown {
  return JSON.parse(JSON.stringify(v));
}

// ── 1) complexes 행 생성 ─────────────────────────────────────────────────────
type ComplexRow = {
  slug: string;
  name: string;
  client: string | null;
  region: string;
  households: number | null;
  area: number | null;
  scope: string | null;
  period: string | null;
  kind: string | null;
  type: string | null;
  image: string | null;
  images: string[];
  aliases: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

function toRow(
  c: Record<string, unknown>,
  index: number,
  isActive: boolean,
): ComplexRow {
  return {
    // E-1: 현재 /cases/[slug] 가 만드는 URL 과 코드포인트 단위로 동일해야 한다.
    slug: encodeURIComponent(c.name as string),
    name: c.name as string,
    client: (c.client as string) ?? null,
    region: c.region as string,
    households: (c.households as number) ?? null,
    area: (c.area as number) ?? null,
    scope: (c.scope as string) ?? null,
    period: (c.period as string) ?? null,
    kind: (c.kind as string) ?? null,
    // "민간" 은 데이터에 등장하지 않는다(미지정 = 민간). null 을 그대로 보존한다.
    type: (c.type as string) ?? null,
    image: (c.image as string) ?? null,
    images: (c.images as string[]) ?? [],
    aliases: (c.aliases as string[]) ?? [],
    is_featured: (c.isFeatured as boolean) ?? false,
    is_active: isActive,
    // 배열 순서(지역별 그룹 정렬)가 곧 화면 출력 순서다.
    sort_order: index,
  };
}

const complexRows: ComplexRow[] = [
  ...complexes.map((c, i) => toRow(c as unknown as Record<string, unknown>, i, true)),
  ...pastComplexes.map((c, i) => toRow(c as unknown as Record<string, unknown>, i, false)),
];

// ── 2) site_settings 행 생성 (마이그레이션 DDL 주석의 17 키 + DAY 6 heroSlides) ──
/** STATS 중 "마케팅 표기값"만 담는다. activeComplexes(실제 수)는 complexes 테이블에서 계산한다 (E-7). */
const marketingStats = {
  activeComplexesDisplay: STATS.activeComplexesDisplay,
  lhProjectsDisplay: STATS.lhProjectsDisplay,
  managedHouseholds: STATS.managedHouseholds,
  registeredLicenses: STATS.registeredLicenses,
  certificationTypes: STATS.certificationTypes,
  certifiedProfessionals: STATS.certifiedProfessionals,
  totalCertHolders,
};

const settings: { key: string; value: unknown; description: string }[] = [
  { key: "company", value: company, description: "회사 개요 (상호·대표·자본금·사업자번호·모토·goals·businessFields)" },
  { key: "contact", value: contact, description: "연락처. address 에 non-breaking hyphen U+2011 포함 (E-10)" },
  { key: "ceoMessage", value: ceoMessage, description: "대표 인사말 (작성자·직함·문단 배열)" },
  { key: "counters", value: counters, description: "메인 DataCounter. value(실제) / displayValue·displaySuffix(마케팅 표기) 분리" },
  { key: "businessAreas", value: businessAreas, description: "사업영역 5종" },
  { key: "coreValues", value: coreValues, description: "핵심가치" },
  { key: "differentiators", value: differentiators, description: "차별점" },
  { key: "processSteps", value: processSteps, description: "업무 프로세스 단계" },
  { key: "companyStrengths", value: companyStrengths, description: "회사 강점 (카피에 200+ 표기 포함)" },
  { key: "partners", value: partners, description: "발주처·파트너사" },
  { key: "collaborators", value: collaborators, description: "협력업체" },
  { key: "licenses", value: licenses, description: "인허가" },
  { key: "certifications", value: certifications, description: "기술 인증·자격" },
  { key: "history", value: history, description: "연혁" },
  { key: "organization", value: organization, description: "조직도 트리 { tree, branches }" },
  { key: "relatedCompanies", value: relatedCompanies, description: "계열사" },
  { key: "heroSlides", value: heroSlides, description: "메인 히어로 슬라이드 (영상 5 + 사진 3, 순서가 곧 재생 순서)" },
  { key: "businessGallery", value: businessGallery, description: "사업영역 상세 현장 사진 6장 (5개 영역 공용)" },
  { key: "stats", value: marketingStats, description: "STATS 중 마케팅 표기값만. 실제 단지 수는 complexes 에서 계산 (E-7)" },
];

// ── 3) 시드 ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`[seed] complexes ${complexRows.length}행 (현재 ${complexes.length} / 과거 ${pastComplexes.length}) upsert…`);
  for (let i = 0; i < complexRows.length; i += 100) {
    const chunk = complexRows.slice(i, i + 100);
    const { error } = await db.from("complexes").upsert(chunk, { onConflict: "slug" });
    if (error) throw new Error(`complexes upsert 실패 (${i}~): ${error.message}`);
  }

  console.log(`[seed] site_settings ${settings.length}키 upsert…`);
  const { error } = await db.from("site_settings").upsert(
    settings.map((s) => ({ key: s.key, value: s.value, description: s.description })),
    { onConflict: "key" },
  );
  if (error) throw new Error(`site_settings upsert 실패: ${error.message}`);
}

// ── 4) 검증 ─────────────────────────────────────────────────────────────────
type Problem = string;

async function verify(): Promise<Problem[]> {
  const problems: Problem[] = [];

  // 4-1. slug 가 현재 URL 생성식과 코드포인트 단위로 동일한가 (E-1)
  for (const r of complexRows) {
    const d = cpDiff(encodeURIComponent(r.name), r.slug);
    if (d) problems.push(`slug 불일치 "${r.name}": ${d}`);
  }
  const slugSet = new Set(complexRows.map((r) => r.slug));
  if (slugSet.size !== complexRows.length) {
    problems.push(`slug 중복: ${complexRows.length}행 중 고유 ${slugSet.size}개`);
  }

  // 4-2. complexes DB 딥 비교
  const { data: rows, error } = await db
    .from("complexes")
    .select("slug,name,client,region,households,area,scope,period,kind,type,image,images,aliases,is_featured,is_active,sort_order")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(2000);
  if (error) {
    problems.push(`complexes 조회 실패: ${error.message}`);
    return problems;
  }
  const bySlug = new Map((rows ?? []).map((r) => [r.slug as string, r]));

  if ((rows ?? []).length !== complexRows.length) {
    problems.push(`complexes 건수: DB ${(rows ?? []).length} != 원본 ${complexRows.length}`);
  }
  for (const slug of bySlug.keys()) {
    if (!slugSet.has(slug)) problems.push(`DB 에만 있는 단지: ${decodeURIComponent(slug)} (${slug})`);
  }

  for (const src of complexRows) {
    const got = bySlug.get(src.slug) as Record<string, unknown> | undefined;
    if (!got) {
      problems.push(`DB 에 없는 단지: ${src.name}`);
      continue;
    }
    for (const [k, sv] of Object.entries(src)) {
      let gv = got[k];
      // numeric(14,4) 는 PostgREST 가 문자열로 줄 수 있다.
      if (k === "area" && typeof gv === "string") gv = Number(gv);
      const d = deepDiff(sv, gv ?? null, `${src.name}.${k}`);
      problems.push(...d);
    }
  }

  const activeCount = (rows ?? []).filter((r) => r.is_active).length;
  const pastCount = (rows ?? []).length - activeCount;
  if (activeCount !== complexes.length) problems.push(`is_active=true ${activeCount} != ${complexes.length}`);
  if (pastCount !== pastComplexes.length) problems.push(`is_active=false ${pastCount} != ${pastComplexes.length}`);

  // 4-3. site_settings 딥 비교
  const { data: srows, error: serr } = await db.from("site_settings").select("key,value");
  if (serr) {
    problems.push(`site_settings 조회 실패: ${serr.message}`);
    return problems;
  }
  const byKey = new Map((srows ?? []).map((r) => [r.key as string, r.value]));
  for (const s of settings) {
    if (!byKey.has(s.key)) {
      problems.push(`site_settings 키 없음: ${s.key}`);
      continue;
    }
    problems.push(...deepDiff(jsonNormalize(s.value), byKey.get(s.key), `settings.${s.key}`));
  }
  for (const k of byKey.keys()) {
    if (OVERLAY_ONLY_KEYS.has(k)) continue;
    if (!settings.some((s) => s.key === k)) problems.push(`원본에 없는 site_settings 키가 DB 에 있음: ${k}`);
  }

  // 4-4. E-10 대표 사례 — contact.address 의 U+2011 보존
  const addr = (byKey.get("contact") as { address?: string } | undefined)?.address;
  if (addr === undefined) {
    problems.push("settings.contact.address 없음");
  } else if (!Array.from(addr).some((ch) => ch.codePointAt(0) === 0x2011)) {
    problems.push("settings.contact.address 의 non-breaking hyphen(U+2011) 이 보존되지 않았다");
  }

  // 4-5. 이미지 경로 유효성 (public/ 기준 존재 여부)
  const missing: string[] = [];
  for (const r of complexRows) {
    for (const p of [r.image, ...r.images].filter(Boolean) as string[]) {
      if (!p.startsWith("/")) { missing.push(`${r.name}: 상대경로 ${p}`); continue; }
      try {
        readFileSync(new URL(`../public${p}`, import.meta.url));
      } catch {
        missing.push(`${r.name}: 파일 없음 ${p}`);
      }
    }
  }
  problems.push(...missing.map((m) => `이미지 경로: ${m}`));

  return problems;
}

// ── main ────────────────────────────────────────────────────────────────────
const t0 = Date.now();

if (DRY_RUN) {
  console.log(`[dry-run] complexes ${complexRows.length}행 / site_settings ${settings.length}키. 쓰지 않는다.`);
  const bad = complexRows.filter((r) => cpDiff(encodeURIComponent(r.name), r.slug));
  console.log(`[dry-run] slug 코드포인트 일치: ${complexRows.length - bad.length}/${complexRows.length}`);
  console.log(`[dry-run] 예시 slug: ${complexRows[0].slug}`);
  process.exit(bad.length ? 1 : 0);
}

if (!VERIFY_ONLY) await seed();

const problems = await verify();
const secs = ((Date.now() - t0) / 1000).toFixed(1);

console.log("─".repeat(70));
console.log(`검증 대상: complexes ${complexRows.length}행 (현재 ${complexes.length} / 과거 ${pastComplexes.length}), site_settings ${settings.length}키`);
if (problems.length === 0) {
  console.log(`✅ 전부 일치 — 코드포인트 단위 딥 비교 통과 (${secs}s)`);
  process.exit(0);
}
console.log(`❌ 불일치 ${problems.length}건 (${secs}s)`);
for (const p of problems.slice(0, 100)) console.log("  -", p);
if (problems.length > 100) console.log(`  … 외 ${problems.length - 100}건`);
process.exit(1);
