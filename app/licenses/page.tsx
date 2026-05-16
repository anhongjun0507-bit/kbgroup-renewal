import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { WorkforceStats } from "@/components/sections/licenses/WorkforceStats";
import { LicensesOverview } from "@/components/sections/licenses/LicensesOverview";
import { LicensesGrid } from "@/components/sections/licenses/LicensesGrid";
import { CertificationsGrid } from "@/components/sections/licenses/CertificationsGrid";
import { ContactForm } from "@/components/sections/common/ContactForm";

export const metadata: Metadata = {
  title: "인허가 · 기술 자격 | (주)케이비개발",
  description:
    "11종의 보유 인허가와 27종의 기술 인증서. 1,575명의 자격증 보유 전문 인력이 함께합니다.",
};

export default function LicensesPage() {
  return (
    <>
      <PageHero
        kicker="LICENSES & CERTIFICATIONS"
        title="검증된 자격, 보장된 신뢰"
        italicWord="신뢰"
        subtitle="11종의 보유 인허가와 1,575명의 자격증 보유 전문 인력이 케이비개발의 기술 자산입니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "LICENSES" },
        ]}
      />
      <WorkforceStats />
      <LicensesOverview />
      <LicensesGrid />
      <CertificationsGrid />
      <ContactForm context="인허가·인증 — 사업 상담 문의" />
    </>
  );
}
