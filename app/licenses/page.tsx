import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { WorkforceStats } from "@/components/sections/licenses/WorkforceStats";
import { LicensesKPI } from "@/components/sections/licenses/LicensesKPI";
import { LicensesOverview } from "@/components/sections/licenses/LicensesOverview";
import { LicensesGrid } from "@/components/sections/licenses/LicensesGrid";
import { CertificationsGrid } from "@/components/sections/licenses/CertificationsGrid";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import { getSettings, getYearsOfOperation } from "@/lib/content";

export const metadata: Metadata = {
  title: "인허가 · 기술 자격 | (주)케이비개발",
  description:
    "11종의 보유 인허가와 27종의 기술 인증서. 1,575명의 자격증 보유 전문 인력이 함께합니다.",
};

export default async function LicensesPage() {
  const [settings, yearsOfOperation] = await Promise.all([
    getSettings(),
    getYearsOfOperation(),
  ]);

  return (
    <>
      <PageHero
        kicker="LICENSES & CERTIFICATIONS"
        title="검증된 자격, 보장된 신뢰"
        italicWord="신뢰"
        subtitle="11종의 보유 인허가와 1,575명의 자격증 보유 전문 인력이 케이비개발의 기술 자산입니다."
        bgImage="/images/hero/pages/licenses.png"
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "LICENSES" },
        ]}
      />
      <WorkforceStats stats={settings.stats} yearsOfOperation={yearsOfOperation} />
      <LicensesKPI licenses={settings.licenses} stats={settings.stats} />
      <LicensesOverview
        certifications={settings.certifications}
        stats={settings.stats}
      />
      <LicensesGrid licenses={settings.licenses} />
      <CertificationsGrid certifications={settings.certifications} />
      <ContactInvite
        contact={settings.contact}
        context="인허가·기술 인증 기반의 안전한 운영을 약속드립니다"
      />
    </>
  );
}
