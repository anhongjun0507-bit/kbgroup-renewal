import type { Metadata } from "next";
import { CareersHero } from "@/components/sections/careers/CareersHero";
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
      <CareersHero />
      <CareersValues />
      <CareersWelfare />
      <CareersOpenings />
      <CareersApply />
    </>
  );
}
