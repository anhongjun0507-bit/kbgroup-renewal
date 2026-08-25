import {
  ceoMessage,
  collaborators,
  companyStrengths,
  company,
  complexes as fileComplexes,
  contact,
  coreValues,
  counters,
  businessAreas,
  businessGallery,
  certifications,
  differentiators,
  heroSlides,
  history,
  licenses,
  organization,
  partners,
  pastComplexes as filePastComplexes,
  processSteps,
  relatedCompanies,
  STATS,
  totalCertHolders,
} from "@/data/site-content";
import type { ContentComplex } from "./types";

/**
 * 파일 폴백 소스 (PROGRESS §6 단계 2·3).
 *
 * `data/site-content.ts` 를 어댑터가 반환하는 정규 형태로 변환한다.
 * 매핑 규칙은 `scripts/seed-content.ts` 의 toRow()/settings 와 1:1로 같아야 한다 —
 * 다르면 폴백이 발동한 순간 화면이 조용히 달라진다.
 *
 * 이 파일이 존재하는 한 `data/site-content.ts` 는 삭제하지 않는다.
 */

function toContentComplex(
  c: Record<string, unknown>,
  index: number,
  isActive: boolean,
): ContentComplex {
  const slug = encodeURIComponent(c.name as string);
  return {
    id: `file:${slug}`,
    slug,
    name: c.name as string,
    client: c.client as string | undefined,
    region: c.region as string,
    households: c.households as number | undefined,
    area: c.area as number | undefined,
    scope: c.scope as string | undefined,
    period: c.period as string | undefined,
    kind: c.kind as ContentComplex["kind"],
    type: c.type as ContentComplex["type"],
    image: c.image as string | undefined,
    images: (c.images as string[] | undefined) ?? [],
    aliases: (c.aliases as string[] | undefined) ?? [],
    isFeatured: (c.isFeatured as boolean | undefined) ?? false,
    isActive,
    // 배열 순서(지역별 그룹 정렬)가 곧 화면 출력 순서다.
    sortOrder: index,
    updatedAt: "",
  };
}

/** 172건 (현재 153 + 과거 19). 현재 → 과거 순, 각 그룹 내 원본 배열 순서. */
export const FILE_COMPLEXES: ContentComplex[] = [
  ...fileComplexes.map((c, i) =>
    toContentComplex(c as unknown as Record<string, unknown>, i, true),
  ),
  ...filePastComplexes.map((c, i) =>
    toContentComplex(c as unknown as Record<string, unknown>, i, false),
  ),
];

/** STATS 중 마케팅 표기값만 (E-7). activeComplexes(실제 수)는 단지 목록에서 계산한다. */
export type MarketingStats = {
  activeComplexesDisplay: number;
  lhProjectsDisplay: number;
  managedHouseholds: number;
  registeredLicenses: number;
  certificationTypes: number;
  certifiedProfessionals: number;
  totalCertHolders: number;
};

/* 명시 타입을 붙여 리터럴 타입(200 등)이 새어나가는 것을 막는다.
   DB 값은 관리자가 바꿀 수 있으므로 어댑터 반환 타입이 200 이라고 주장하면 안 된다. */
const marketingStats: MarketingStats = {
  activeComplexesDisplay: STATS.activeComplexesDisplay,
  lhProjectsDisplay: STATS.lhProjectsDisplay,
  managedHouseholds: STATS.managedHouseholds,
  registeredLicenses: STATS.registeredLicenses,
  certificationTypes: STATS.certificationTypes,
  certifiedProfessionals: STATS.certifiedProfessionals,
  totalCertHolders,
};

/** site_settings 19키의 파일 원본. 시드 스크립트의 settings 배열과 동일하다. */
export const FILE_SETTINGS = {
  company,
  contact,
  ceoMessage,
  counters,
  businessAreas,
  coreValues,
  differentiators,
  processSteps,
  companyStrengths,
  partners,
  collaborators,
  licenses,
  certifications,
  history,
  organization,
  relatedCompanies,
  stats: marketingStats,
  heroSlides,
  businessGallery,
};

export type SettingKey = keyof typeof FILE_SETTINGS;
export type SettingValue<K extends SettingKey> = (typeof FILE_SETTINGS)[K];
