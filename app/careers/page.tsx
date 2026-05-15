import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { CareersValues } from "@/components/sections/careers/CareersValues";
import { CareersWelfare } from "@/components/sections/careers/CareersWelfare";
import { CareersOpenings } from "@/components/sections/careers/CareersOpenings";
import { CareersApply } from "@/components/sections/careers/CareersApply";

export const metadata: Metadata = {
  title: "채용 | (주)케이비개발",
  description:
    "신뢰를 쌓아가는 케이비개발과 함께 새로운 길을 열어갈 동료를 찾습니다.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        kicker="CAREERS"
        title="함께 신뢰를 키워갈 동료"
        italicWord="동료"
        subtitle="자격증과 경력보다 사람을 우선합니다. 진심을 가진 분과 오래 함께하는 회사를 만들고 있습니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "CAREERS" },
        ]}
      />
      <CareersValues />
      <CareersWelfare />
      <CareersOpenings />
      <CareersApply />
    </>
  );
}
