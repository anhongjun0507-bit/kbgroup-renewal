import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { BusinessIntroAlternating } from "@/components/sections/business/BusinessIntroAlternating";
import { ContactInvite } from "@/components/sections/common/ContactInvite";

export const metadata: Metadata = {
  title: "사업영역 | (주)케이비개발",
  description:
    "케이비개발의 다섯 가지 전문 사업영역 — 시설관리, 위생청소, 경비보안, 시행건설, 기타.",
};

export default function BusinessIndexPage() {
  return (
    <>
      <PageHero
        kicker="BUSINESS"
        title="다섯 가지 사업 영역"
        italicWord="영역"
        subtitle="케이비개발은 시설관리부터 시행건설까지 다섯 가지 전문 분야에서 단지의 일상을 책임집니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "BUSINESS" },
        ]}
      />
      <BusinessIntroAlternating />
      <ContactInvite context="다섯 가지 사업영역 중 필요한 서비스를 함께 설계해 드립니다" />
    </>
  );
}
