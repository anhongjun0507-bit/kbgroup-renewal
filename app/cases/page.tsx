import type { Metadata } from "next";
import { CasesHero } from "@/components/sections/cases/CasesHero";
import { CasesStats } from "@/components/sections/cases/CasesStats";
import { CasesGallery } from "@/components/sections/cases/CasesGallery";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "관리현황 | (주)케이비개발",
  description:
    "케이비개발이 함께하는 단지들 — 전국 8개 단지에서 신뢰를 쌓고 있습니다.",
};

export default function CasesPage() {
  return (
    <>
      <CasesHero />
      <CasesStats />
      <CasesGallery />
      <CTA />
    </>
  );
}
