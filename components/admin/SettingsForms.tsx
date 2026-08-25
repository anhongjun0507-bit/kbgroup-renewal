"use client";

import { useActionState } from "react";
import type { SettingsFormState } from "@/app/admin/content/settings/actions";

/**
 * 사이트 설정 편집 폼 (PLAN B / DAY 4).
 *
 * 5개 키(company·contact·ceoMessage·counters·stats)를 각각 독립된 <form> 으로 둔다.
 * 키마다 updated_at 이 따로 있어 낙관적 잠금(E-8)도 폼 단위로 걸린다 — 연락처를 고치는 중에
 * 다른 관리자가 인사말을 저장해도 서로 충돌하지 않는다.
 */

const INITIAL: SettingsFormState = { ok: null, error: null };

type Action = (prev: SettingsFormState, fd: FormData) => Promise<SettingsFormState>;

/* ── 폼 셸 ─────────────────────────────────────────────────────────────── */

function FormShell({
  title,
  desc,
  action,
  updatedAt,
  children,
}: {
  title: string;
  desc: string;
  action: Action;
  updatedAt: string;
  children: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  return (
    <section className="rounded-md border border-line bg-white p-6 md:p-8">
      <h2 className="text-[19px] font-bold text-ink-strong">{title}</h2>
      <p className="mt-1 text-[13px] text-ink-muted">{desc}</p>

      <form action={formAction} className="mt-6 space-y-6">
        <input type="hidden" name="updatedAt" value={updatedAt} />

        {state.conflict && (
          <div
            role="alert"
            className="rounded-sm border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-[14px] text-amber-900"
          >
            <p className="font-semibold">다른 관리자가 먼저 저장했습니다.</p>
            <p className="mt-1 text-[13px]">
              덮어쓰지 않고 중단했습니다. 이 페이지를 새로고침해 최신 값을 확인한 뒤 다시
              수정해주세요. (입력한 내용은 아직 저장되지 않았습니다)
            </p>
          </div>
        )}

        {state.error && (
          <p
            role="alert"
            className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700"
          >
            {state.error}
          </p>
        )}

        {state.ok && (
          <p
            role="status"
            className="rounded-sm border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-800"
          >
            {state.ok} — 사이트에 즉시 반영됩니다.
          </p>
        )}

        {children}

        <div className="flex items-center justify-end border-t border-line pt-5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent-500 px-8 text-[15px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}

/* ── 필드 프리미티브 ───────────────────────────────────────────────────── */

function Text({
  name,
  label,
  defaultValue,
  type = "text",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={`sf-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={`sf-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
      {hint && <p className="mt-2 text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={`sf-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <textarea
        id={`sf-${name}`}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[15px] leading-[1.7] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
      {hint && <p className="mt-2 text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2";

/* ── company ───────────────────────────────────────────────────────────── */

export type CompanyValue = {
  brandName: string;
  name: string;
  legalName: string;
  domain: string;
  ceo: string;
  founded: string;
  foundedYear: number;
  capital: string;
  businessNumber: string;
  motto: string;
  goals: { en: string; kr: string }[];
  tagline: string;
  intro: string;
  businessFields: string[];
};

export function CompanyForm({
  action,
  value,
  updatedAt,
}: {
  action: Action;
  value: CompanyValue;
  updatedAt: string;
}) {
  return (
    <FormShell
      title="회사 기본 정보"
      desc="푸터·이용약관·개인정보처리방침·회사소개 전반에 노출되는 법인 정보입니다."
      action={action}
      updatedAt={updatedAt}
    >
      <div className={GRID}>
        <Text name="brandName" label="브랜드명" defaultValue={value.brandName} />
        <Text name="name" label="상호 *" defaultValue={value.name} />
        <Text name="legalName" label="법인 정식 명칭" defaultValue={value.legalName} />
        <Text name="domain" label="도메인" defaultValue={value.domain} />
        <Text name="ceo" label="대표자" defaultValue={value.ceo} />
        <Text name="businessNumber" label="사업자등록번호" defaultValue={value.businessNumber} />
        <Text name="founded" label="설립 연월 (YYYY-MM)" defaultValue={value.founded} />
        <Text
          name="foundedYear"
          label="설립 연도"
          type="number"
          defaultValue={value.foundedYear}
          hint="푸터 저작권 표기 시작 연도로도 쓰입니다."
        />
        <Text name="capital" label="자본금" defaultValue={value.capital} />
        <Text name="motto" label="모토" defaultValue={value.motto} />
      </div>
      <Text name="tagline" label="태그라인" defaultValue={value.tagline} />
      <Area name="intro" label="회사 소개문" defaultValue={value.intro} rows={4} />
      <Area
        name="goals"
        label="경영 목표 (한 줄에 하나 · EN|한글)"
        defaultValue={value.goals.map((g) => `${g.en}|${g.kr}`).join("\n")}
        rows={3}
        hint="예) PLAN|철저한 기획"
      />
      <Area
        name="businessFields"
        label="주요 사업 (한 줄에 하나)"
        defaultValue={value.businessFields.join("\n")}
        rows={7}
      />
    </FormShell>
  );
}

/* ── contact ───────────────────────────────────────────────────────────── */

export type ContactValue = {
  phone: string;
  fax: string;
  email: string;
  careersEmail?: string;
  address: string;
  buildingAlias?: string;
  businessHours?: string;
  privacyOfficer: { name: string; phone: string };
  parking: string;
  nearestStops: string[];
  busRoutes: string[];
};

export function ContactSettingsForm({
  action,
  value,
  updatedAt,
  consumerCount,
}: {
  action: Action;
  value: ContactValue;
  updatedAt: string;
  consumerCount: number;
}) {
  /* U+2011(non-breaking hyphen)이 주소에 들어 있는지 실시간으로 알려준다.
     "왜 하이픈이 다르게 보이지?" 하고 관리자가 일반 하이픈으로 바꿔버리면
     좁은 컨테이너에서 번지수가 줄바꿈으로 쪼개진다 (E-10). */
  const hasNbHyphen = value.address.includes("‑");

  return (
    <FormShell
      title="연락처"
      desc={`전화·팩스·이메일·주소·영업시간. 사이트 ${consumerCount}곳에 동시 반영됩니다.`}
      action={action}
      updatedAt={updatedAt}
    >
      <div className={GRID}>
        <Text name="phone" label="대표 전화 *" defaultValue={value.phone} />
        <Text name="fax" label="팩스" defaultValue={value.fax} />
        <Text name="email" label="대표 이메일 *" defaultValue={value.email} />
        <Text
          name="careersEmail"
          label="채용 문의 이메일"
          defaultValue={value.careersEmail ?? ""}
          hint="비우면 대표 이메일을 사용합니다."
        />
        <Text name="businessHours" label="영업시간" defaultValue={value.businessHours ?? ""} />
        <Text
          name="buildingAlias"
          label="건물 별칭"
          defaultValue={value.buildingAlias ?? ""}
          hint="지도 검색 정확도 보완용."
        />
      </div>

      <div className="rounded-md border border-line bg-bg-soft p-4">
        <Text
          name="address"
          label="주소 *"
          defaultValue={value.address}
          hint="번지수의 하이픈은 non-breaking hyphen(U+2011)입니다. 좁은 화면에서 번지수가 두 줄로 쪼개지지 않게 하려고 일부러 넣은 문자이니, 직접 지우고 일반 하이픈(-)으로 바꾸지 마세요."
        />
        <p
          className={
            "mt-3 text-[12px] font-semibold " +
            (hasNbHyphen ? "text-emerald-700" : "text-amber-700")
          }
        >
          {hasNbHyphen
            ? "현재 주소에 non-breaking hyphen(U+2011)이 포함돼 있습니다 — 정상입니다."
            : "현재 주소에 non-breaking hyphen(U+2011)이 없습니다. 번지수가 줄바꿈으로 쪼개질 수 있습니다."}
        </p>
      </div>

      <div className={GRID}>
        <Text
          name="privacyOfficerName"
          label="개인정보보호책임자"
          defaultValue={value.privacyOfficer?.name ?? ""}
        />
        <Text
          name="privacyOfficerPhone"
          label="개인정보보호책임자 연락처"
          defaultValue={value.privacyOfficer?.phone ?? ""}
        />
      </div>

      <Text name="parking" label="주차 안내" defaultValue={value.parking} />
      <div className={GRID}>
        <Area
          name="nearestStops"
          label="인근 정류장 (한 줄에 하나)"
          defaultValue={(value.nearestStops ?? []).join("\n")}
          rows={3}
        />
        <Area
          name="busRoutes"
          label="경유 버스 (한 줄에 하나)"
          defaultValue={(value.busRoutes ?? []).join("\n")}
          rows={6}
        />
      </div>
    </FormShell>
  );
}

/* ── ceoMessage ────────────────────────────────────────────────────────── */

export type CeoMessageValue = {
  authorName: string;
  authorTitle: string;
  paragraphs: string[];
};

export function CeoMessageForm({
  action,
  value,
  updatedAt,
}: {
  action: Action;
  value: CeoMessageValue;
  updatedAt: string;
}) {
  return (
    <FormShell
      title="대표 인사말"
      desc="/about/ceo 페이지 본문입니다."
      action={action}
      updatedAt={updatedAt}
    >
      <div className={GRID}>
        <Text name="authorName" label="작성자" defaultValue={value.authorName} />
        <Text name="authorTitle" label="직함" defaultValue={value.authorTitle} />
      </div>
      <Area
        name="paragraphs"
        label={`본문 (한 줄 = 한 문단 · 현재 ${value.paragraphs.length}문단)`}
        defaultValue={value.paragraphs.join("\n")}
        rows={12}
        hint="빈 줄은 무시됩니다. 문단을 나누려면 줄을 바꾸세요."
      />
    </FormShell>
  );
}

/* ── counters ──────────────────────────────────────────────────────────── */

export type CounterValue = {
  key: string;
  label: string;
  caption: string;
  value: number;
  suffix?: string;
  isPlaceholder?: boolean;
  context?: string;
  displayValue?: number;
  displaySuffix?: string;
};

export function CountersForm({
  action,
  value,
  updatedAt,
  realComplexes,
}: {
  action: Action;
  value: CounterValue[];
  updatedAt: string;
  realComplexes: number;
}) {
  return (
    <FormShell
      title="메인 카운터"
      desc="메인 페이지 DataCounter · 회사소개 WhyNumbers 에 노출되는 숫자 4종입니다."
      action={action}
      updatedAt={updatedAt}
    >
      <input type="hidden" name="count" value={value.length} />

      {value.map((c, i) => (
        <fieldset key={c.key} className="rounded-md border border-line bg-bg-soft p-4">
          <legend className="eyebrow px-2">
            {i + 1}. {c.label} <span className="font-mono-num text-ink-faint">({c.key})</span>
          </legend>
          <input type="hidden" name={`key_${i}`} value={c.key} />

          <div className="mt-2 space-y-5">
            <div className={GRID}>
              <Text name={`label_${i}`} label="라벨 (국문)" defaultValue={c.label} />
              <Text name={`caption_${i}`} label="캡션 (영문)" defaultValue={c.caption} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <Text
                name={`value_${i}`}
                label="실제값"
                type="number"
                defaultValue={c.value}
                hint={
                  c.key === "complexes"
                    ? `DB 실제 운영 단지 ${realComplexes.toLocaleString()}건`
                    : undefined
                }
              />
              <Text name={`suffix_${i}`} label="실제값 접미사" defaultValue={c.suffix ?? ""} />
              <Text
                name={`displayValue_${i}`}
                label="표기값"
                type="number"
                defaultValue={c.displayValue ?? ""}
                hint="비우면 실제값을 그대로 노출합니다."
              />
              <Text
                name={`displaySuffix_${i}`}
                label="표기값 접미사"
                defaultValue={c.displaySuffix ?? ""}
              />
            </div>

            <Text name={`context_${i}`} label="설명 한 줄" defaultValue={c.context ?? ""} />

            <label className="flex cursor-pointer items-center gap-3 text-[13px] text-ink-muted">
              <input
                type="checkbox"
                name={`isPlaceholder_${i}`}
                defaultChecked={c.isPlaceholder ?? false}
                className="h-5 w-5 shrink-0 accent-[var(--color-accent-500)]"
              />
              임시 값(placeholder)으로 표시
            </label>
          </div>
        </fieldset>
      ))}

      <p className="text-[12px] text-ink-faint">
        카운터 항목의 추가·삭제·순서 변경은 이 화면에서 지원하지 않습니다. 표기 순서는 위에서부터
        화면 순서와 같습니다.
      </p>
    </FormShell>
  );
}

/* ── stats ─────────────────────────────────────────────────────────────── */

export type StatsValue = {
  activeComplexesDisplay: number;
  lhProjectsDisplay: number;
  managedHouseholds: number;
  registeredLicenses: number;
  certificationTypes: number;
  certifiedProfessionals: number;
  totalCertHolders: number;
};

export function StatsForm({
  action,
  value,
  updatedAt,
}: {
  action: Action;
  value: StatsValue;
  updatedAt: string;
}) {
  return (
    <FormShell
      title="마케팅 표기값 (STATS)"
      desc="/cases · /licenses 통계 카드에 노출되는 수기 표기값입니다. 실제 DB 집계와는 별개로 관리됩니다."
      action={action}
      updatedAt={updatedAt}
    >
      <div className={GRID}>
        <Text
          name="activeComplexesDisplay"
          label="운영 단지 표기값"
          type="number"
          defaultValue={value.activeComplexesDisplay}
        />
        <Text
          name="lhProjectsDisplay"
          label="LH 발주 표기값"
          type="number"
          defaultValue={value.lhProjectsDisplay}
        />
        <Text
          name="managedHouseholds"
          label="관리 세대수 표기값"
          type="number"
          defaultValue={value.managedHouseholds}
        />
        <Text
          name="registeredLicenses"
          label="보유 인허가 표기값"
          type="number"
          defaultValue={value.registeredLicenses}
        />
        <Text
          name="certificationTypes"
          label="기술 인증 종수"
          type="number"
          defaultValue={value.certificationTypes}
        />
        <Text
          name="certifiedProfessionals"
          label="자격증 보유 인력"
          type="number"
          defaultValue={value.certifiedProfessionals}
        />
        <Text
          name="totalCertHolders"
          label="자격증 총 보유자"
          type="number"
          defaultValue={value.totalCertHolders}
        />
      </div>
    </FormShell>
  );
}
