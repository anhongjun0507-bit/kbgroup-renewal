import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { CasesStats } from "@/components/sections/cases/CasesStats";
import { CasesMap } from "@/components/sections/cases/CasesMap";
import { CasesGallery } from "@/components/sections/cases/CasesGallery";
import { ContactForm } from "@/components/sections/common/ContactForm";

export const metadata: Metadata = {
  title: "관리현황 | (주)케이비개발",
  description:
    "케이비개발이 함께하는 단지들 — 전국 단지에서 신뢰를 쌓고 있습니다.",
};

export default function CasesPage() {
  return (
    <>
      <PageHero
        kicker="CASES"
        title="전국 단지의 신뢰 발자취"
        italicWord="발자취"
        subtitle="LH 공공임대부터 민간 단지까지, 케이비개발이 운영하는 단지의 현황입니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "CASES" },
        ]}
      />
      <CasesStats />
      <CasesMap />
      <CasesGallery />
      <ContactForm context="관리현황 문의" />
    </>
  );
}
