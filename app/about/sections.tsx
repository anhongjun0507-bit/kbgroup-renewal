import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { WhyValues } from "@/components/sections/about/WhyValues";
import { WhyDifferentiators } from "@/components/sections/about/WhyDifferentiators";
import { WhyNumbers } from "@/components/sections/about/WhyNumbers";
import { CompanyOffice } from "@/components/sections/about/CompanyOffice";
import { OrganizationChart } from "@/components/sections/about/OrganizationChart";
import { EquipmentShowcase } from "@/components/sections/about/EquipmentShowcase";
import { RelatedCompaniesGrid } from "@/components/sections/about/RelatedCompaniesGrid";
import { CollaboratorsTable } from "@/components/sections/about/CollaboratorsTable";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { getSettings } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/**
 * /about 섹션 레지스트리 (PLAN B / DAY 7).
 * `AboutNav current` 는 페이지마다 다른 하드코딩 프롭이라 각 페이지의 레지스트리가 따로 등록한다.
 */
export type AboutData = {
  settings: Awaited<ReturnType<typeof getSettings>>;
  yearsOfOperation: number;
};

export const aboutSections: SectionRenderers<"about", AboutData> = {
  "page-hero": () => (
    <PageHero
      kicker="ABOUT US · 회사소개"
      title="가치의 실현"
      italicWord="실현"
      subtitle="단순한 시설관리를 넘어, 공간을 책임지는 파트너로."
      bgImage="/images/hero/pages/about.png"
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "ABOUT", href: "/about" },
        { label: "가치의 실현" },
      ]}
    />
  ),
  "about-nav": () => <AboutNav current="why" />,
  "company-office": ({ settings }) => (
    <CompanyOffice company={settings.company} contact={settings.contact} />
  ),
  "why-values": ({ settings }) => <WhyValues coreValues={settings.coreValues} />,
  "why-differentiators": ({ settings, yearsOfOperation }) => (
    <WhyDifferentiators
      differentiators={settings.differentiators}
      yearsOfOperation={yearsOfOperation}
    />
  ),
  /* Phase 14-C C-2 — CompanyStrengths 제거 (WhyDifferentiators와 "5개 카드" 형식·메시지 중복).
     핵심 정보(1,575명·106 단지)는 이미 WhyNumbers에서 데이터 형태로 강조 노출 중.
     컴포넌트는 보존 — 다른 페이지에서 재사용 가능 */
  "why-numbers": ({ settings }) => <WhyNumbers counters={settings.counters} />,
  organization: ({ settings }) => <OrganizationChart organization={settings.organization} />,
  equipment: () => <EquipmentShowcase />,
  "related-companies": ({ settings }) => (
    <RelatedCompaniesGrid relatedCompanies={settings.relatedCompanies} />
  ),
  collaborators: ({ settings }) => (
    <CollaboratorsTable collaborators={settings.collaborators} />
  ),
  "contact-invite": ({ settings }) => (
    <ContactInvite
      contact={settings.contact}
      context="(주)케이비개발과 단지 운영을 함께할 준비가 되었습니다"
    />
  ),
};
