import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import {
  CeoMessageForm,
  CompanyForm,
  ContactSettingsForm,
  CountersForm,
  StatsForm,
  type CeoMessageValue,
  type CompanyValue,
  type ContactValue,
  type CounterValue,
  type StatsValue,
} from "@/components/admin/SettingsForms";
import { StatsReconciliation, type ReconRow } from "@/components/admin/StatsReconciliation";
import { ListEditor } from "@/components/admin/ListEditor";
import { OrgChartEditor } from "@/components/admin/OrgChartEditor";
import { LIST_SCHEMAS } from "@/components/admin/settings-schema";
import type { SettingValue } from "@/lib/content";
import { requireAdmin } from "@/lib/auth";
import {
  saveCeoMessage,
  saveCompany,
  saveContact,
  saveCounters,
  saveListSetting,
  saveOrganization,
  saveStats,
} from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 사이트 설정 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 사이트 설정 편집 (PLAN B / DAY 4).
 *
 * 관리자 화면은 캐시된 어댑터가 아니라 DB 를 직접 읽는다 — 저장 직후 최신 값과
 * 낙관적 잠금에 쓸 updated_at 이 그대로 보여야 하기 때문이다 (DAY 3 단지 화면과 동일).
 */

/**
 * 연락처가 반영되는 소비처 수. 관리자에게 변경 파급 범위를 알려주는 용도.
 * DAY 5 에서 미전환 7개(히어로·ContactInvite·로그인·채용 등)를 전부 붙여 실측 17개가 됐다.
 * (`grep -rln 'contact\.(phone|email|address|...)' app components` 19건 중
 *  편집기 자신인 actions.ts 와 어디에도 마운트되지 않은 CTA.tsx 를 뺀 수)
 */
const CONTACT_CONSUMER_COUNT = 17;

type SettingRow = { key: string; value: unknown; updated_at: string };

/** 페이지 내 바로가기. FormShell 의 id 규약(`setting-<key>`)을 따른다. */
const TOC = [
  { id: "setting-company", label: "회사 정보" },
  { id: "setting-contact", label: "연락처" },
  { id: "setting-ceoMessage", label: "대표 인사말" },
  { id: "setting-counters", label: "메인 카운터" },
  { id: "setting-stats", label: "마케팅 표기값" },
  ...LIST_SCHEMAS.map((s) => ({ id: `setting-${s.key}`, label: s.title })),
  { id: "setting-organization", label: "조직도" },
];

function pick(rows: SettingRow[], key: string): SettingRow | undefined {
  return rows.find((r) => r.key === key);
}

function Missing({ label, settingKey }: { label: string; settingKey: string }) {
  return (
    <section className="rounded-md border border-amber-300 bg-amber-50 p-6">
      <h2 className="text-[17px] font-bold text-amber-900">{label} — 설정 행이 없습니다</h2>
      <p className="mt-2 text-[13px] leading-[1.7] text-amber-900">
        <code className="font-mono-num">site_settings</code> 테이블에{" "}
        <code className="font-mono-num">{settingKey}</code> 키가 없어 편집할 수 없습니다. 사이트는
        <code className="font-mono-num"> data/site-content.ts</code> 파일 값으로 폴백해 정상
        노출됩니다. 시드 스크립트(<code className="font-mono-num">scripts/seed-content.ts</code>)를
        다시 실행해주세요.
      </p>
    </section>
  );
}

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin("/admin/content/settings");

  const [{ data: settingRows }, { data: complexRows }] = await Promise.all([
    supabase.from("site_settings").select("key, value, updated_at"),
    supabase.from("complexes").select("type, households, is_active").eq("is_active", true),
  ]);

  const rows = (settingRows ?? []) as SettingRow[];
  const actives = complexRows ?? [];

  /* ── 실제값 집계 (E-7 좌변) ───────────────────────────────────────────
     운영 단지 수는 site_settings 가 아니라 complexes 테이블에서 계산한다.
     stats 키에 activeComplexes 를 넣지 않은 이유가 바로 이것이다. */
  const realActiveComplexes = actives.length;
  const realLhProjects = actives.filter((c) => c.type === "LH").length;
  const realHouseholds = actives.reduce((sum, c) => sum + (c.households ?? 0), 0);

  const licenses = (pick(rows, "licenses")?.value ?? []) as unknown[];
  const certifications = (pick(rows, "certifications")?.value ?? []) as { count?: number }[];
  const realCertHolders = certifications.reduce((sum, c) => sum + (c.count ?? 0), 0);

  const companyRow = pick(rows, "company");
  const contactRow = pick(rows, "contact");
  const ceoRow = pick(rows, "ceoMessage");
  const countersRow = pick(rows, "counters");
  const statsRow = pick(rows, "stats");
  const orgRow = pick(rows, "organization");

  const counters = (countersRow?.value ?? []) as CounterValue[];
  const stats = statsRow?.value as StatsValue | undefined;

  /* E-6 — 인덱스가 아니라 key 로 찾는다. 관리자가 순서를 바꿔도 항상 같은 항목을 가리킨다. */
  const complexesCounter = counters.find((c) => c.key === "complexes");

  const recon: ReconRow[] = stats
    ? [
        {
          label: "운영 단지",
          real: realActiveComplexes,
          realNote: "complexes 테이블 is_active = true 건수",
          display: stats.activeComplexesDisplay,
          displayNote: "STATS.activeComplexesDisplay · /cases 통계 카드",
        },
        {
          label: "LH 발주",
          real: realLhProjects,
          realNote: "운영 단지 중 구분 = LH 건수",
          display: stats.lhProjectsDisplay,
          displayNote: "STATS.lhProjectsDisplay · NATIONWIDE PORTFOLIO",
        },
        {
          label: "관리 세대수",
          real: realHouseholds,
          realNote: "운영 단지 세대수 합계",
          display: stats.managedHouseholds,
          displayNote: "STATS.managedHouseholds",
        },
        {
          label: "보유 인허가",
          real: licenses.length,
          realNote: "licenses 설정 항목 수 (/licenses 노출 면허)",
          display: stats.registeredLicenses,
          displayNote: "STATS.registeredLicenses · 법인 설립·기타 등록 포함 정본",
        },
        {
          label: "기술 인증",
          real: certifications.length,
          realNote: "certifications 설정 항목 수",
          display: stats.certificationTypes,
          displayNote: "STATS.certificationTypes",
        },
        {
          label: "자격증 보유 인력",
          real: realCertHolders,
          realNote: "certifications 각 항목 인원 합계",
          display: stats.certifiedProfessionals,
          displayNote: "STATS.certifiedProfessionals",
        },
      ]
    : [];

  /* 카운터의 표기값과 STATS 표기값은 서로 다른 키에 저장되지만 같은 숫자를 노출한다.
     한쪽만 고치면 메인 카운터와 /cases 통계 카드가 서로 다른 숫자를 말하게 된다. */
  const counterStatsMismatch =
    stats &&
    complexesCounter &&
    (complexesCounter.displayValue ?? complexesCounter.value) !== stats.activeComplexesDisplay;

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="settings" />

        <div className="mb-8 border-b border-line pb-8">
          <p className="eyebrow text-accent-deep">ADMIN · 콘텐츠</p>
          <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
            사이트 설정
          </h1>
          <p className="mt-3 text-[14px] text-ink-muted">
            회사 정보 · 연락처 · 대표 인사말 · 메인 카운터 · 마케팅 표기값과 사업영역 · 인허가 ·
            인증 · 연혁 · 파트너 · 조직도를 편집합니다. 저장하면 사이트에 즉시 반영되고, 직전 값은
            변경 이력에 자동 보관됩니다.
          </p>

          {/* 편집 항목이 17개라 페이지가 길다. 바로 이동할 수 있게 목차를 둔다. */}
          <nav aria-label="설정 항목 바로가기" className="mt-6 flex flex-wrap gap-2">
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="rounded-sm border border-line bg-white px-3 py-1.5 text-[13px] text-ink-muted hover:border-navy-700 hover:text-ink-strong"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
          {stats && <StatsReconciliation rows={recon} />}

          {counterStatsMismatch && (
            <div
              role="alert"
              className="rounded-md border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-[14px] text-amber-900"
            >
              <p className="font-semibold">
                메인 카운터 표기값(
                {(complexesCounter!.displayValue ?? complexesCounter!.value).toLocaleString()})과
                STATS 운영 단지 표기값({stats.activeComplexesDisplay.toLocaleString()})이 다릅니다.
              </p>
              <p className="mt-1 text-[13px]">
                두 값은 서로 다른 화면에 같은 숫자로 노출됩니다. 한쪽만 고치면 메인 페이지와
                /cases 페이지가 서로 다른 숫자를 말하게 되니 함께 맞춰주세요.
              </p>
            </div>
          )}

          {companyRow ? (
            <CompanyForm
              action={saveCompany}
              value={companyRow.value as CompanyValue}
              updatedAt={companyRow.updated_at}
            />
          ) : (
            <Missing label="회사 기본 정보" settingKey="company" />
          )}

          {contactRow ? (
            <ContactSettingsForm
              action={saveContact}
              value={contactRow.value as ContactValue}
              updatedAt={contactRow.updated_at}
              consumerCount={CONTACT_CONSUMER_COUNT}
            />
          ) : (
            <Missing label="연락처" settingKey="contact" />
          )}

          {ceoRow ? (
            <CeoMessageForm
              action={saveCeoMessage}
              value={ceoRow.value as CeoMessageValue}
              updatedAt={ceoRow.updated_at}
            />
          ) : (
            <Missing label="대표 인사말" settingKey="ceoMessage" />
          )}

          {countersRow ? (
            <CountersForm
              action={saveCounters}
              value={counters}
              updatedAt={countersRow.updated_at}
              realComplexes={realActiveComplexes}
            />
          ) : (
            <Missing label="메인 카운터" settingKey="counters" />
          )}

          {statsRow ? (
            <StatsForm
              action={saveStats}
              value={statsRow.value as StatsValue}
              updatedAt={statsRow.updated_at}
            />
          ) : (
            <Missing label="마케팅 표기값(STATS)" settingKey="stats" />
          )}

          {/* 목록형 11키 — 필드 정의는 settings-schema.ts 한 곳에 있다. */}
          {LIST_SCHEMAS.map((schema) => {
            const row = pick(rows, schema.key);
            if (!row) return <Missing key={schema.key} label={schema.title} settingKey={schema.key} />;
            return (
              <ListEditor
                key={schema.key}
                schema={schema}
                action={saveListSetting}
                value={(row.value ?? []) as Record<string, unknown>[]}
                updatedAt={row.updated_at}
              />
            );
          })}

          {orgRow ? (
            <OrgChartEditor
              action={saveOrganization}
              value={orgRow.value as SettingValue<"organization">}
              updatedAt={orgRow.updated_at}
            />
          ) : (
            <Missing label="조직도" settingKey="organization" />
          )}
        </div>
      </Container>
    </section>
  );
}
