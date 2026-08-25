import { PageHero } from "@/components/sections/common/PageHero";
import { CasesStats } from "@/components/sections/cases/CasesStats";
import { CasesGallery } from "@/components/sections/cases/CasesGallery";
import { CasesPhotoGallery } from "@/components/sections/cases/CasesPhotoGallery";
import { PastProjects } from "@/components/sections/cases/PastProjects";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { ContentComplex, SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/**
 * /cases 섹션 레지스트리 (PLAN B / DAY 7).
 * 하위 컴포넌트가 "use client" 라 데이터는 페이지가 읽어 프롭으로 주입한다(DAY 3 과 동일).
 */
export type CasesData = {
  complexes: ContentComplex[];
  pastComplexes: ContentComplex[];
  stats: SettingValue<"stats">;
  contact: SettingValue<"contact">;
};

export const casesSections: SectionRenderers<"cases", CasesData> = {
  "page-hero": () => (
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
  ),
  "cases-stats": ({ complexes, stats }) => (
    <CasesStats
      complexes={complexes}
      stats={{
        activeComplexesDisplay: stats.activeComplexesDisplay,
        lhProjectsDisplay: stats.lhProjectsDisplay,
      }}
    />
  ),
  "photo-gallery": () => <CasesPhotoGallery />,
  "cases-gallery": ({ complexes, pastComplexes }) => (
    <CasesGallery complexes={complexes} pastComplexes={pastComplexes} />
  ),
  "past-projects": ({ pastComplexes }) => <PastProjects pastComplexes={pastComplexes} />,
  "contact-invite": ({ contact }) => (
    <ContactInvite contact={contact} context="우리 단지의 운영 상담을 시작해 보세요" />
  ),
};
