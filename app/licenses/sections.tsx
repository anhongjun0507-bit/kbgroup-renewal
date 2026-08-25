import { PageHero } from "@/components/sections/common/PageHero";
import { WorkforceStats } from "@/components/sections/licenses/WorkforceStats";
import { LicensesKPI } from "@/components/sections/licenses/LicensesKPI";
import { LicensesOverview } from "@/components/sections/licenses/LicensesOverview";
import { LicensesGrid } from "@/components/sections/licenses/LicensesGrid";
import { CertificationsGrid } from "@/components/sections/licenses/CertificationsGrid";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { getSettings } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/** /licenses 섹션 레지스트리 (PLAN B / DAY 7). */
export type LicensesData = {
  settings: Awaited<ReturnType<typeof getSettings>>;
  yearsOfOperation: number;
};

export const licensesSections: SectionRenderers<"licenses", LicensesData> = {
  "page-hero": () => (
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
  ),
  "workforce-stats": ({ settings, yearsOfOperation }) => (
    <WorkforceStats stats={settings.stats} yearsOfOperation={yearsOfOperation} />
  ),
  "licenses-kpi": ({ settings }) => (
    <LicensesKPI licenses={settings.licenses} stats={settings.stats} />
  ),
  "licenses-overview": ({ settings }) => (
    <LicensesOverview certifications={settings.certifications} stats={settings.stats} />
  ),
  "licenses-grid": ({ settings }) => <LicensesGrid licenses={settings.licenses} />,
  "certifications-grid": ({ settings }) => (
    <CertificationsGrid certifications={settings.certifications} />
  ),
  "contact-invite": ({ settings }) => (
    <ContactInvite
      contact={settings.contact}
      context="인허가·기술 인증 기반의 안전한 운영을 약속드립니다"
    />
  ),
};
