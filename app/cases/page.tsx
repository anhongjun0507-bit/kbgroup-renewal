import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { CasesStats } from "@/components/sections/cases/CasesStats";
import { CasesGallery } from "@/components/sections/cases/CasesGallery";
import { CasesPhotoGallery } from "@/components/sections/cases/CasesPhotoGallery";
import { PastProjects } from "@/components/sections/cases/PastProjects";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import { getComplexes, getPastComplexes, getSetting } from "@/lib/content";

export const metadata: Metadata = {
  title: "관리현황 | (주)케이비개발",
  description:
    "케이비개발이 함께하는 단지들 — 전국 단지에서 신뢰를 쌓고 있습니다.",
};

/* PLAN B / DAY 3 — 단지 데이터를 lib/content 어댑터로 읽어 하위 클라 컴포넌트에 주입한다.
   (CasesStats·CasesGallery·PastProjects 는 "use client" 라 어댑터를 직접 호출할 수 없다) */
export default async function CasesPage() {
  const [complexes, pastComplexes, stats, contact] = await Promise.all([
    getComplexes(),
    getPastComplexes(),
    getSetting("stats"),
    getSetting("contact"),
  ]);

  return (
    <>
      <PageHero
        kicker="CASES"
        title="전국 단지의 신뢰 발자취"
        italicWord="발자취"
        subtitle="LH 공공임대부터 민간 단지까지, 케이비개발이 운영하는 단지의 현황입니다."
        bgImage="/images/hero/pages/cases.png"
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "CASES" },
        ]}
      />
      <CasesStats
        complexes={complexes}
        stats={{
          activeComplexesDisplay: stats.activeComplexesDisplay,
          lhProjectsDisplay: stats.lhProjectsDisplay,
        }}
      />
      <CasesPhotoGallery />
      <CasesGallery complexes={complexes} pastComplexes={pastComplexes} />
      <PastProjects pastComplexes={pastComplexes} />
      <ContactInvite contact={contact} context="우리 단지의 운영 상담을 시작해 보세요" />
    </>
  );
}
