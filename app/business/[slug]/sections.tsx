import { PageHero } from "@/components/sections/common/PageHero";
import { BusinessOverview } from "@/components/sections/business/BusinessOverview";
import { BusinessSubServices } from "@/components/sections/business/BusinessSubServices";
import { BusinessProcess } from "@/components/sections/business/BusinessProcess";
import { BusinessFAQ } from "@/components/sections/business/BusinessFAQ";
import { BusinessRelatedCases } from "@/components/sections/business/BusinessRelatedCases";
import { BusinessCTA } from "@/components/sections/business/BusinessCTA";
import type { ContentComplex, SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/**
 * /business/[slug] 섹션 레지스트리 (PLAN B / DAY 7).
 * 5개 슬러그가 같은 레지스트리를 공유한다 — 오버레이 page_key 도 `business/[slug]` 하나다.
 */
export type BusinessDetailData = {
  area: SettingValue<"businessAreas">[number];
  gallery: SettingValue<"businessGallery">;
  processSteps: SettingValue<"processSteps">;
  contact: SettingValue<"contact">;
  relatedComplexes: ContentComplex[];
};

export const businessDetailSections: SectionRenderers<
  "business/[slug]",
  BusinessDetailData
> = {
  "page-hero": ({ area }) => (
    <PageHero
      kicker={area.englishName}
      title={`${area.name} 서비스`}
      italicWord="서비스"
      subtitle={area.tagline}
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "BUSINESS", href: "/business" },
        { label: area.englishName },
      ]}
    />
  ),
  overview: ({ area }) => <BusinessOverview area={area} />,
  "sub-services": ({ area, gallery }) => <BusinessSubServices area={area} gallery={gallery} />,
  process: ({ processSteps }) => <BusinessProcess processSteps={processSteps} />,
  faq: ({ area }) => <BusinessFAQ areaId={area.id} />,
  "related-cases": ({ relatedComplexes }) => (
    <BusinessRelatedCases complexes={relatedComplexes} />
  ),
  cta: ({ area, contact }) => <BusinessCTA area={area} contact={contact} />,
};
