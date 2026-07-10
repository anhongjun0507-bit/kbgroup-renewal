import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "회사소개 | (주)케이비개발",
  description:
    "단순한 시설관리를 넘어, 공간을 책임지는 파트너로. 케이비개발이 추구하는 가치와 차별점.",
};

export default function AboutPage() {
  return (
    <>
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
      <AboutNav current="why" />
      <CompanyOffice />
      <WhyValues />
      <WhyDifferentiators />
      {/* Phase 14-C C-2 — CompanyStrengths 제거 (WhyDifferentiators와 "5개 카드" 형식·메시지 중복).
          핵심 정보(1,575명·106 단지)는 이미 WhyNumbers에서 데이터 형태로 강조 노출 중.
          컴포넌트는 보존 — 다른 페이지에서 재사용 가능 */}
      <WhyNumbers />
      <OrganizationChart />
      <EquipmentShowcase />
      <RelatedCompaniesGrid />
      <CollaboratorsTable />
      <ContactInvite context="(주)케이비개발과 단지 운영을 함께할 준비가 되었습니다" />
    </>
  );
}
