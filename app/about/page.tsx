import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { WhyValues } from "@/components/sections/about/WhyValues";
import { WhyDifferentiators } from "@/components/sections/about/WhyDifferentiators";
import { WhyNumbers } from "@/components/sections/about/WhyNumbers";
import { CompanyOffice } from "@/components/sections/about/CompanyOffice";
import { CompanyStrengths } from "@/components/sections/about/CompanyStrengths";
import { EquipmentShowcase } from "@/components/sections/about/EquipmentShowcase";
import { RelatedCompaniesGrid } from "@/components/sections/about/RelatedCompaniesGrid";
import { CollaboratorsTable } from "@/components/sections/about/CollaboratorsTable";
import { ContactForm } from "@/components/sections/common/ContactForm";

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
        title="왜 케이비개발인가"
        italicWord="케이비개발"
        subtitle="단순한 시설관리를 넘어, 공간을 책임지는 파트너로."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "ABOUT", href: "/about" },
          { label: "왜 케이비개발" },
        ]}
      />
      <AboutNav current="why" />
      <CompanyOffice />
      <WhyValues />
      <WhyDifferentiators />
      <CompanyStrengths />
      <WhyNumbers />
      <EquipmentShowcase />
      <RelatedCompaniesGrid />
      <CollaboratorsTable />
      <ContactForm context="회사소개 — 사업 상담 문의" />
    </>
  );
}
