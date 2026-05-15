import type { Metadata } from "next";
import { LicensesHero } from "@/components/sections/licenses/LicensesHero";
import { WorkforceStats } from "@/components/sections/licenses/WorkforceStats";
import { LicensesOverview } from "@/components/sections/licenses/LicensesOverview";
import { LicensesGrid } from "@/components/sections/licenses/LicensesGrid";
import { CertificationsGrid } from "@/components/sections/licenses/CertificationsGrid";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "인허가 · 기술 자격 | (주)케이비개발",
  description:
    "11종의 보유 인허가와 27종의 기술 인증서. 1,575명의 자격증 보유 전문 인력이 함께합니다.",
};

export default function LicensesPage() {
  return (
    <>
      <LicensesHero />
      <WorkforceStats />
      <LicensesOverview />
      <LicensesGrid />
      <CertificationsGrid />
      <CTA />
    </>
  );
}
