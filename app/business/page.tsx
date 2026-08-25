import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { BusinessIntroAlternating } from "@/components/sections/business/BusinessIntroAlternating";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "사업영역 | (주)케이비개발",
  description:
    "케이비개발의 다섯 가지 전문 사업영역 — 주택관리, 위생청소, 경비보안, 시행건설, 기타.",
};

export default async function BusinessIndexPage() {
  const settings = await getSettings();

  return (
    <>
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
      <BusinessIntroAlternating businessAreas={settings.businessAreas} />
      <ContactInvite
        contact={settings.contact}
        context="다섯 가지 사업영역 중 필요한 서비스를 함께 설계해 드립니다"
      />
    </>
  );
}
