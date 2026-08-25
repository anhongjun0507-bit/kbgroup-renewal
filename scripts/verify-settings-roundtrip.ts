/**
 * 사이트 설정 편집 폼 왕복 검증 (PLAN B / DAY 4 · E-10).
 *
 * 확인 대상은 contact.address 의 non-breaking hyphen(U+2011)이다.
 * 입력 → HTTP multipart 전송 → FormData 파싱 → 액션 파싱 → JSONB 저장 → 재조회 왕복에서
 * 이 문자가 일반 하이픈(U+002D)으로 조용히 치환되지 않아야 한다.
 *
 * 검증 단계:
 *   1) 정적 가드   — actions.ts 에 유니코드 정규화·하이픈 치환 코드가 없는지
 *   2) 전송 왕복   — 브라우저 폼과 동일한 multipart/form-data 인코딩·디코딩
 *   3) DB 왕복     — 실제 UPDATE → SELECT 후 코드포인트 단위 비교
 *   4) SQL 직접 확인 — position(chr(8209)) / position('-')
 *   5) 원복        — 검증용으로 바꾼 값을 원래대로 되돌린다
 *
 * 실행:
 *   node --experimental-strip-types --import ./scripts/node-ts-register.mjs \
 *     scripts/verify-settings-roundtrip.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const NBH = "‑"; // non-breaking hyphen
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const projectRef = new URL(url).hostname.split(".")[0];

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

function codepoints(s: string): string {
  return [...s].map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`).join(" ");
}

function cpEqual(a: string, b: string): boolean {
  const A = [...a];
  const B = [...b];
  return A.length === B.length && A.every((c, i) => c === B[i]);
}

/* ── 1) 정적 가드 ───────────────────────────────────────────────────────── */

/* 주석에는 "normalize 를 쓰지 말 것" 같은 설명이 들어 있으므로 주석을 걷어내고 실제 코드만 본다. */
const actionsSrc = readFileSync("app/admin/content/settings/actions.ts", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");
check(
  "actions.ts 에 유니코드 정규화(normalize) 호출 없음",
  !/\.normalize\s*\(/.test(actionsSrc),
);
/* DAY 5 — 문자 클래스 안의 하이픈은 범위 표기(`[^a-z0-9]`)라 치환 대상이 아니다.
   업로드 파일 확장자 정리(`.replace(/[^a-z0-9]/g, "")`)가 여기에 걸려 오탐이 났다.
   문자 클래스를 지운 뒤 검사하면 진짜 하이픈 치환(`.replace(/‑/g, "-")`)만 걸린다. */
const actionsSrcNoClass = actionsSrc.replace(/\[[^\]]*\]/g, "[]");
check(
  "actions.ts 에 하이픈 치환(replace) 호출 없음",
  !/replace\s*\(\s*\/[^/]*[-‑][^/]*\//.test(actionsSrcNoClass),
);

/* ── 2) 전송 왕복 (브라우저 폼과 동일한 multipart 인코딩) ───────────────── */

const { data: before, error: readError } = await supabase
  .from("site_settings")
  .select("value, updated_at")
  .eq("key", "contact")
  .single();

if (readError || !before) {
  console.error("contact 설정을 읽지 못했습니다:", readError?.message);
  process.exit(1);
}

const original = before.value as Record<string, unknown>;
const originalAddress = String(original.address);

check(
  "저장 전 DB 주소에 U+2011 포함",
  originalAddress.includes(NBH),
  codepoints(originalAddress.slice(15, 25)),
);

/* ContactSettingsForm 이 실제로 만들어 보내는 필드 구성 그대로 채운다. */
const fd = new FormData();
fd.set("updatedAt", String(before.updated_at));
fd.set("phone", String(original.phone));
fd.set("fax", String(original.fax));
fd.set("email", String(original.email));
fd.set("careersEmail", String(original.careersEmail ?? ""));
fd.set("address", originalAddress);
fd.set("buildingAlias", String(original.buildingAlias ?? ""));
fd.set("businessHours", String(original.businessHours ?? ""));
const officer = original.privacyOfficer as { name: string; phone: string };
fd.set("privacyOfficerName", officer.name);
fd.set("privacyOfficerPhone", officer.phone);
fd.set("parking", String(original.parking));
fd.set("nearestStops", (original.nearestStops as string[]).join("\n"));
fd.set("busRoutes", (original.busRoutes as string[]).join("\n"));

/* Request 로 감쌌다 풀면 브라우저가 하는 multipart/form-data 인코딩·디코딩을 그대로 거친다. */
const decoded = await new Request("http://local/roundtrip", { method: "POST", body: fd }).formData();
const transported = String(decoded.get("address") ?? "").trim(); // ← 액션이 주소에 하는 처리 전부

check("multipart 전송 왕복 후 주소 코드포인트 동일", cpEqual(originalAddress, transported));
check("multipart 전송 왕복 후 U+2011 보존", transported.includes(NBH));
check("multipart 전송 왕복 후 ASCII 하이픈 미혼입", !transported.includes("-"));

/* ── 3) DB 왕복 ─────────────────────────────────────────────────────────── */

/* 실제로 값이 바뀌는 저장을 한 번 태워야 왕복 검증이 된다.
   주소는 그대로 두고 buildingAlias 에 표식을 붙여 UPDATE 를 강제한다. */
const probe = `${String(original.buildingAlias ?? "")} [roundtrip]`.trim();
const saved: Record<string, unknown> = {
  phone: transportedField("phone"),
  fax: transportedField("fax"),
  email: transportedField("email"),
  address: transported,
  privacyOfficer: {
    name: transportedField("privacyOfficerName"),
    phone: transportedField("privacyOfficerPhone"),
  },
  parking: transportedField("parking"),
  nearestStops: transportedLines("nearestStops"),
  busRoutes: transportedLines("busRoutes"),
  buildingAlias: probe,
};
if (transportedField("careersEmail")) saved.careersEmail = transportedField("careersEmail");
if (transportedField("businessHours")) saved.businessHours = transportedField("businessHours");

function transportedField(name: string): string {
  return String(decoded.get(name) ?? "").trim();
}
function transportedLines(name: string): string[] {
  return String(decoded.get(name) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

const { error: writeError } = await supabase
  .from("site_settings")
  .update({ value: saved })
  .eq("key", "contact")
  .eq("updated_at", before.updated_at);
check("낙관적 잠금 조건부 UPDATE 성공", !writeError, writeError?.message ?? "");

const { data: after } = await supabase
  .from("site_settings")
  .select("value, updated_at")
  .eq("key", "contact")
  .single();
const afterValue = (after?.value ?? {}) as Record<string, unknown>;
const afterAddress = String(afterValue.address ?? "");

check("DB 왕복 후 주소 코드포인트 동일", cpEqual(originalAddress, afterAddress));
check("DB 왕복 후 U+2011 보존", afterAddress.includes(NBH));
check("DB 왕복 후 ASCII 하이픈 미혼입", !afterAddress.includes("-"));
check("낙관적 잠금 토큰 갱신됨", after?.updated_at !== before.updated_at);
check("표식 필드가 실제로 저장됨 (UPDATE 가 실행된 증거)", afterValue.buildingAlias === probe);

/* ── 4) SQL 직접 확인 ───────────────────────────────────────────────────── */

async function sql(query: string) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const [row] = await sql(`
  select
    position(chr(8209) in (value->>'address')) as nb_hyphen_pos,
    position('-'       in (value->>'address')) as ascii_hyphen_pos,
    length(value->>'address')                  as len
  from public.site_settings where key = 'contact';
`);
console.log("   SQL:", JSON.stringify(row));
check("SQL position(chr(8209)) > 0", Number(row.nb_hyphen_pos) > 0);
check("SQL position('-') = 0", Number(row.ascii_hyphen_pos) === 0);

/* ── 5) 원복 ────────────────────────────────────────────────────────────── */

const { error: restoreError } = await supabase
  .from("site_settings")
  .update({ value: original })
  .eq("key", "contact");
check("원래 값으로 원복", !restoreError, restoreError?.message ?? "");

const { data: restored } = await supabase
  .from("site_settings")
  .select("value")
  .eq("key", "contact")
  .single();
const restoredAddress = String((restored?.value as Record<string, unknown>).address ?? "");
check("원복 후 주소 코드포인트 동일", cpEqual(originalAddress, restoredAddress));
check(
  "원복 후 표식 제거됨",
  (restored?.value as Record<string, unknown>).buildingAlias === original.buildingAlias,
);

console.log(failures === 0 ? "\n✅ 전부 통과" : `\n❌ 실패 ${failures}건`);
process.exit(failures === 0 ? 0 : 1);
