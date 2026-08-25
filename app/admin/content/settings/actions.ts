"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { findListSchema } from "@/components/admin/settings-schema";
import { buildOrgTree, countOrgNodes, type OutlineRow } from "@/components/admin/org-tree";

/**
 * 사이트 설정(site_settings) 편집 Server Actions (PLAN B / DAY 4).
 *
 * 공통 규약 — DAY 3 단지 CRUD 와 동일:
 *  · 진입부 requireAdmin() — RLS(public.is_admin())와 이중 방어.
 *  · 저장 전 직전 행을 content_revisions 에 스냅샷으로 적재 (롤백 레벨 1).
 *  · updated_at 낙관적 잠금 (E-8). 충돌 시 덮어쓰지 않고 경고만 돌려준다.
 *  · 무효화는 content:settings 태그 하나 (E-12). revalidatePath 는 쓰지 않는다.
 *
 * E-10 (U+2011) — 폼에서 받은 문자열에는 어떤 정규화도 적용하지 않는다.
 *   contact.address 의 non-breaking hyphen(U+2011)은 `normalize("NFKC"|"NFKD")` 를 거치면
 *   일반 하이픈(U+002D)으로 조용히 치환된다. trim() 은 양끝 공백만 없애므로 안전하다.
 *   이 파일에서 normalize()/replace(/-/) 류를 호출하는 코드가 새로 들어오면 안 된다.
 */

export type SettingsFormState = {
  /** 저장 성공 시 사용자에게 보여줄 문구. */
  ok: string | null;
  error: string | null;
  /** 낙관적 잠금 충돌 — 폼 값을 유지한 채 경고만 띄우기 위해 별도 플래그로 둔다. */
  conflict?: boolean;
};

const LABELS: Record<string, string> = {
  company: "회사 기본 정보",
  contact: "연락처",
  ceoMessage: "대표 인사말",
  counters: "메인 카운터",
  stats: "마케팅 표기값(STATS)",
  coreValues: "핵심 가치",
  differentiators: "차별점",
  companyStrengths: "회사 강점",
  history: "연혁",
  partners: "발주처·시공사",
  collaborators: "협력업체",
  relatedCompanies: "계열사",
  licenses: "보유 인허가",
  certifications: "기술 자격증",
  businessAreas: "사업영역",
  processSteps: "서비스 프로세스",
  organization: "조직도",
};

/* ── 공통 헬퍼 ─────────────────────────────────────────────────────────── */

/** 문자열 필드. trim 만 한다 — 유니코드 정규화 금지 (E-10). */
function str(fd: FormData, name: string): string {
  return String(fd.get(name) ?? "").trim();
}

/** 빈 문자열이면 키 자체를 넣지 않기 위해 undefined 로 돌려준다. */
function optionalStr(fd: FormData, name: string): string | undefined {
  const v = str(fd, name);
  return v === "" ? undefined : v;
}

/** 줄 단위 배열. 빈 줄은 버린다. */
function lines(fd: FormData, name: string): string[] {
  return String(fd.get(name) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function num(fd: FormData, name: string, errors: string[], label: string): number {
  const raw = str(fd, name);
  const n = Number(raw);
  if (raw === "" || !Number.isFinite(n)) {
    errors.push(`${label}은(는) 숫자로 입력해주세요.`);
    return 0;
  }
  return n;
}

function optionalNum(fd: FormData, name: string, errors: string[], label: string): number | undefined {
  const raw = str(fd, name);
  if (raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    errors.push(`${label}은(는) 숫자로 입력해주세요.`);
    return undefined;
  }
  return n;
}

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/**
 * 읽기 → 낙관적 잠금 비교 → 스냅샷 → 조건부 UPDATE 를 한 곳에 모은다.
 * 5개 키가 전부 같은 흐름이라 키별로 반복해 쓸 이유가 없다.
 */
async function persist(
  supabase: Supabase,
  actorId: string,
  key: string,
  expectedUpdatedAt: string,
  value: unknown,
): Promise<SettingsFormState> {
  const { data: current, error: readError } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (readError || !current) return { ok: null, error: "설정을 찾을 수 없습니다." };

  // E-8 — 폼을 연 뒤 다른 관리자가 저장했다면 덮어쓰지 않는다.
  if (current.updated_at !== expectedUpdatedAt) {
    return { ok: null, error: null, conflict: true };
  }

  const { error: revError } = await supabase.from("content_revisions").insert({
    table_name: "site_settings",
    record_id: key,
    snapshot: current as never,
    actor_id: actorId,
  });
  if (revError) console.error("[settings] content_revisions 적재 실패:", revError.message);

  const { data: updated, error } = await supabase
    .from("site_settings")
    .update({ value: value as never })
    .eq("key", key)
    .eq("updated_at", expectedUpdatedAt)
    .select("key");

  if (error) {
    console.error(`[settings] ${key} update 실패:`, error.message);
    return { ok: null, error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
  if (!updated || updated.length === 0) return { ok: null, error: null, conflict: true };

  updateTag(CONTENT_TAGS.settings);
  return { ok: `${LABELS[key] ?? key} 저장 완료`, error: null };
}

/** 각 액션의 공통 진입 절차 — 관리자 확인 + updatedAt 존재 확인. */
async function begin(key: string) {
  const { supabase, user } = await requireAdmin("/admin/content/settings");
  return { supabase, actorId: user.id, key };
}

/* ── company ───────────────────────────────────────────────────────────── */

export async function saveCompany(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const { supabase, actorId } = await begin("company");
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  const errors: string[] = [];
  /* goals 는 "EN|한글" 한 줄 = 1항목. 메인·회사소개의 3분할 카피가 이 배열을 그대로 쓴다. */
  const goals = lines(fd, "goals").map((line) => {
    const [en, kr] = line.split("|");
    return { en: (en ?? "").trim(), kr: (kr ?? "").trim() };
  });
  if (goals.some((g) => !g.en || !g.kr)) {
    errors.push('목표(goals)는 "PLAN|철저한 기획" 형식으로 한 줄에 하나씩 입력해주세요.');
  }

  const value = {
    brandName: str(fd, "brandName"),
    name: str(fd, "name"),
    legalName: str(fd, "legalName"),
    domain: str(fd, "domain"),
    ceo: str(fd, "ceo"),
    founded: str(fd, "founded"),
    foundedYear: num(fd, "foundedYear", errors, "설립 연도"),
    capital: str(fd, "capital"),
    businessNumber: str(fd, "businessNumber"),
    motto: str(fd, "motto"),
    goals,
    tagline: str(fd, "tagline"),
    intro: str(fd, "intro"),
    businessFields: lines(fd, "businessFields"),
  };

  if (!value.name) errors.push("상호를 입력해주세요.");
  if (errors.length > 0) return { ok: null, error: errors.join(" ") };

  return persist(supabase, actorId, "company", expected, value);
}

/* ── contact ───────────────────────────────────────────────────────────── */

export async function saveContact(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const { supabase, actorId } = await begin("contact");
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  const errors: string[] = [];
  const value: Record<string, unknown> = {
    phone: str(fd, "phone"),
    fax: str(fd, "fax"),
    email: str(fd, "email"),
    // address — U+2011 을 포함할 수 있다. 정규화·치환 금지 (E-10).
    address: str(fd, "address"),
    privacyOfficer: {
      name: str(fd, "privacyOfficerName"),
      phone: str(fd, "privacyOfficerPhone"),
    },
    parking: str(fd, "parking"),
    nearestStops: lines(fd, "nearestStops"),
    busRoutes: lines(fd, "busRoutes"),
  };

  /* 선택 필드는 값이 있을 때만 키를 넣는다. 빈 문자열을 넣으면 소비처의
     `contact.businessHours ? ...` 분기가 의도와 다르게 참이 된다. */
  const careersEmail = optionalStr(fd, "careersEmail");
  if (careersEmail) value.careersEmail = careersEmail;
  const buildingAlias = optionalStr(fd, "buildingAlias");
  if (buildingAlias) value.buildingAlias = buildingAlias;
  const businessHours = optionalStr(fd, "businessHours");
  if (businessHours) value.businessHours = businessHours;

  if (!value.phone) errors.push("대표 전화를 입력해주세요.");
  if (!value.email) errors.push("대표 이메일을 입력해주세요.");
  if (!value.address) errors.push("주소를 입력해주세요.");
  if (errors.length > 0) return { ok: null, error: errors.join(" ") };

  return persist(supabase, actorId, "contact", expected, value);
}

/* ── ceoMessage ────────────────────────────────────────────────────────── */

export async function saveCeoMessage(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const { supabase, actorId } = await begin("ceoMessage");
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  /* 한 줄 = 한 문단. 빈 줄은 버리므로 문단 사이를 몇 줄 띄우든 결과가 같다. */
  const paragraphs = lines(fd, "paragraphs");
  if (paragraphs.length === 0) return { ok: null, error: "인사말 본문을 입력해주세요." };

  return persist(supabase, actorId, "ceoMessage", expected, {
    authorName: str(fd, "authorName"),
    authorTitle: str(fd, "authorTitle"),
    paragraphs,
  });
}

/* ── counters ──────────────────────────────────────────────────────────── */

export async function saveCounters(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const { supabase, actorId } = await begin("counters");
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  const errors: string[] = [];
  const count = Number(str(fd, "count")) || 0;
  const value = [];
  for (let i = 0; i < count; i++) {
    const key = str(fd, `key_${i}`);
    if (!key) continue;
    const item: Record<string, unknown> = {
      key,
      label: str(fd, `label_${i}`),
      caption: str(fd, `caption_${i}`),
      value: num(fd, `value_${i}`, errors, `${i + 1}번 카운터 실제값`),
      suffix: str(fd, `suffix_${i}`),
    };
    /* displayValue·displaySuffix·context 는 선택 필드다. 비어 있으면 키를 넣지 않는다 —
       소비처가 `displayValue ?? value` 로 표기값 유무를 판단하기 때문이다 (E-7). */
    const displayValue = optionalNum(fd, `displayValue_${i}`, errors, `${i + 1}번 카운터 표기값`);
    if (displayValue !== undefined) item.displayValue = displayValue;
    const displaySuffix = optionalStr(fd, `displaySuffix_${i}`);
    if (displaySuffix !== undefined) item.displaySuffix = displaySuffix;
    const context = optionalStr(fd, `context_${i}`);
    if (context !== undefined) item.context = context;
    if (fd.get(`isPlaceholder_${i}`) === "on") item.isPlaceholder = true;
    value.push(item);
  }

  if (value.length === 0) errors.push("카운터가 하나도 없습니다.");
  if (errors.length > 0) return { ok: null, error: errors.join(" ") };

  return persist(supabase, actorId, "counters", expected, value);
}

/* ── stats (마케팅 표기값) ─────────────────────────────────────────────── */

export async function saveStats(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const { supabase, actorId } = await begin("stats");
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  const errors: string[] = [];
  const value = {
    activeComplexesDisplay: num(fd, "activeComplexesDisplay", errors, "운영 단지 표기값"),
    lhProjectsDisplay: num(fd, "lhProjectsDisplay", errors, "LH 발주 표기값"),
    managedHouseholds: num(fd, "managedHouseholds", errors, "관리 세대수 표기값"),
    registeredLicenses: num(fd, "registeredLicenses", errors, "보유 인허가 표기값"),
    certificationTypes: num(fd, "certificationTypes", errors, "기술 인증 종수"),
    certifiedProfessionals: num(fd, "certifiedProfessionals", errors, "자격증 보유 인력"),
    totalCertHolders: num(fd, "totalCertHolders", errors, "자격증 총 보유자"),
  };
  if (errors.length > 0) return { ok: null, error: errors.join(" ") };

  /* activeComplexes(실제 단지 수)는 여기에 저장하지 않는다. complexes 테이블에서 계산한다 (E-7).
     실제값과 표기값을 한 필드로 합치지 않는 것이 이 설계의 핵심이다. */
  return persist(supabase, actorId, "stats", expected, value);
}

/* ── 목록형 키 공용 저장 (DAY 5) ───────────────────────────────────────── */

/**
 * 11개 목록형 키를 **하나의 액션**으로 처리한다.
 * 필드 정의는 `components/admin/settings-schema.ts` 한 곳에만 있고 폼과 이 액션이 함께 읽는다.
 * 폼이 실어 보낸 settingKey 는 스키마 화이트리스트에 없으면 그대로 거절한다 —
 * 임의 키로 site_settings 를 덮어쓸 수 없어야 하기 때문이다.
 */

/** 업로드한 이미지를 site-images 버킷에 넣고 공개 URL 을 돌려준다 (단지 CRUD 와 같은 규약). */
async function uploadSettingImage(
  supabase: Supabase,
  prefix: string,
  index: number,
  file: File,
): Promise<{ url: string } | { error: string }> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  // 파일명은 ASCII 로만 만든다 — 한글 원본 파일명을 그대로 쓰면 Storage 키가 깨진다.
  const path = `${prefix}/${index}-${Date.now()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `이미지 업로드 실패: ${error.message}` };
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function saveListSetting(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const key = str(fd, "settingKey");
  const schema = findListSchema(key);
  if (!schema) return { ok: null, error: "잘못된 접근입니다." };

  const { supabase, actorId } = await begin(key);
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  const errors: string[] = [];
  const count = Number(str(fd, "count")) || 0;
  const items: Record<string, unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const item: Record<string, unknown> = {};
    /* 이 행에서 나온 오류. 행이 통째로 버려지면(빈 행) 오류도 함께 버린다 —
       "추가"만 누르고 아무것도 입력하지 않은 행 때문에 저장이 막히면 안 된다. */
    const rowErrors: string[] = [];
    let empty = true;

    for (const f of schema.fields) {
      const name = `${f.name}_${i}`;
      const label = `${i + 1}번 항목 ${f.label}`;

      if (f.kind === "checkbox") {
        if (fd.get(name) === "on") item[f.name] = true;
        continue;
      }

      if (f.kind === "number") {
        const n = num(fd, name, rowErrors, label);
        item[f.name] = n;
        if (n !== 0) empty = false;
        continue;
      }

      if (f.kind === "lines") {
        const arr = lines(fd, name);
        item[f.name] = arr;
        if (arr.length > 0) empty = false;
        continue;
      }

      if (f.kind === "pairs") {
        const [ka, kb] = f.pairKeys ?? ["title", "description"];
        const pairs = lines(fd, name).map((line) => {
          const [a, b] = line.split("|");
          return { [ka]: (a ?? "").trim(), [kb]: (b ?? "").trim() };
        });
        if (pairs.some((p) => !p[ka] || !p[kb])) {
          rowErrors.push(`${label}은(는) "제목|설명" 형식으로 한 줄에 하나씩 입력해주세요.`);
        }
        item[f.name] = pairs;
        if (pairs.length > 0) empty = false;
        continue;
      }

      // text · textarea · select · readonly · image — 전부 문자열. 유니코드 정규화 금지 (E-10).
      // 여러 줄 입력은 브라우저가 CRLF 로 보낸다(HTML 폼 규격). 줄바꿈만 LF 로 맞춘다 —
      // 문자 정규화가 아니라 개행 표기 통일이라 U+2011 같은 문자에는 영향이 없다.
      let v = f.kind === "textarea" ? str(fd, name).replace(/\r\n/g, "\n") : str(fd, name);

      if (f.kind === "image") {
        const file = fd.get(`${f.name}File_${i}`);
        if (file instanceof File && file.size > 0) {
          const up = await uploadSettingImage(
            supabase,
            f.uploadPrefix ?? key,
            i,
            file,
          );
          if ("error" in up) return { ok: null, error: up.error };
          v = up.url;
        }
      }

      if (f.required && !v) rowErrors.push(`${label}을(를) 입력해주세요.`);
      if (v) empty = false;
      // 선택 필드는 비면 키 자체를 넣지 않는다 — 빈 문자열은 소비처의 `x ? … : …` 분기를 뒤집는다.
      if (f.optional && !v) continue;
      item[f.name] = v;
    }

    /* 관리자가 "추가"만 누르고 아무것도 입력하지 않은 행은 조용히 버린다.
       빈 항목을 그대로 저장하면 공개 화면에 빈 카드가 생긴다. */
    if (empty) continue;
    errors.push(...rowErrors);
    items.push(item);
  }

  if (!schema.mutable && items.length !== count) {
    return { ok: null, error: "필수 항목이 비어 있습니다. 값을 확인해주세요." };
  }
  if (errors.length > 0) return { ok: null, error: errors.join(" ") };

  return persist(supabase, actorId, key, expected, items);
}

/* ── organization (재귀 트리) ──────────────────────────────────────────── */

/**
 * `<prefix>Count` / `<prefix>Depth_i` / `<prefix>Name_i` / `<prefix>Role_i` → 아웃라인 행.
 *
 * 이름이 빈 노드는 **버리지 않고 오류로 돌려준다.** 조용히 버리면 그 노드의 자식들이
 * 다른 부모 밑으로 옮겨 붙어 "자식 유실 없음" 보장이 깨진다.
 */
function readOutline(
  fd: FormData,
  prefix: string,
  errors: string[],
  label: string,
): OutlineRow[] {
  const count = Number(str(fd, `${prefix}Count`)) || 0;
  const rows: OutlineRow[] = [];
  for (let i = 0; i < count; i++) {
    const name = str(fd, `${prefix}Name_${i}`);
    if (!name) {
      errors.push(`${label} ${i + 1}번 조직명을 입력해주세요.`);
      continue;
    }
    rows.push({
      depth: Math.max(0, Number(str(fd, `${prefix}Depth_${i}`)) || 0),
      name,
      role: str(fd, `${prefix}Role_${i}`),
    });
  }
  return rows;
}

/**
 * 조직도 저장.
 *
 * 아웃라인 행 수 == 저장되는 노드 수. 트리로 세우는 과정에서 노드가 사라지지 않았는지
 * 저장 직전에 다시 세어 확인하고, 어긋나면 **저장하지 않는다**.
 */
export async function saveOrganization(
  _prev: SettingsFormState,
  fd: FormData,
): Promise<SettingsFormState> {
  const { supabase, actorId } = await begin("organization");
  const expected = str(fd, "updatedAt");
  if (!expected) return { ok: null, error: "잘못된 접근입니다." };

  const errors: string[] = [];
  const treeRows = readOutline(fd, "tree", errors, "본사 조직");
  const branchRows = readOutline(fd, "branch", errors, "별도 지사");
  if (errors.length > 0) return { ok: null, error: errors.join(" ") };
  if (treeRows.length === 0) return { ok: null, error: "조직도 최상위 노드가 필요합니다." };

  const roots = buildOrgTree(treeRows);
  if (roots.length !== 1) {
    return {
      ok: null,
      error: "본사 조직도의 최상위는 하나여야 합니다. 들여쓰기를 확인해주세요.",
    };
  }
  const branches = buildOrgTree(branchRows);

  const expectedNodes = treeRows.length + branchRows.length;
  const actualNodes = countOrgNodes(roots) + countOrgNodes(branches);
  if (expectedNodes !== actualNodes) {
    console.error(
      `[settings] organization 노드 수 불일치: 입력 ${expectedNodes} → 변환 ${actualNodes}`,
    );
    return {
      ok: null,
      error: "조직도 변환 중 노드 수가 달라져 저장을 중단했습니다. 다시 시도해주세요.",
    };
  }

  return persist(supabase, actorId, "organization", expected, {
    tree: roots[0],
    branches,
  });
}
