import { PageHero } from "@/components/sections/common/PageHero";
import { BusinessIntroAlternating } from "@/components/sections/business/BusinessIntroAlternating";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { getSettings } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/** /business 섹션 레지스트리 (PLAN B / DAY 7). */
export type BusinessIndexData = { settings: Awaited<ReturnType<typeof getSettings>> };

export const businessSections: SectionRenderers<"business", BusinessIndexData> = {
  "page-hero": () => (
    <PageHero
      kicker="핵심 가치"
      title="다섯 가지 사업 영역"
      italicWord="영역"
      subtitle="고객의 다양한 니즈를 반영하여 최적의 솔루션을 제공합니다."
      bgImage="/images/hero/pages/business.png"
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "BUSINESS" },
      ]}
    />
  ),
  "business-intro": ({ settings }) => (
    <BusinessIntroAlternating businessAreas={settings.businessAreas} />
  ),
  "contact-invite": ({ settings }) => (
    <ContactInvite
      contact={settings.contact}
      context="다섯 가지 사업영역 중 필요한 서비스를 함께 설계해 드립니다"
    />
  ),
};
