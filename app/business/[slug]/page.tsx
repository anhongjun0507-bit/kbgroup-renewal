import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { businessAreas, complexes } from "@/data/site-content";
import { PageHero } from "@/components/sections/common/PageHero";
import { BusinessOverview } from "@/components/sections/business/BusinessOverview";
import { BusinessSubServices } from "@/components/sections/business/BusinessSubServices";
import { BusinessProcess } from "@/components/sections/business/BusinessProcess";
import { BusinessRelatedCases } from "@/components/sections/business/BusinessRelatedCases";
import { BusinessCTA } from "@/components/sections/business/BusinessCTA";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return businessAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = businessAreas.find((a) => a.slug === slug);
  if (!area) {
    return { title: "사업영역을 찾을 수 없습니다 | (주)케이비개발" };
  }
  return {
    title: `${area.name} | (주)케이비개발`,
    description: area.summary,
  };
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const areaIndex = businessAreas.findIndex((a) => a.slug === slug);
  if (areaIndex === -1) notFound();
  const area = businessAreas[areaIndex];

  const relatedComplexes = complexes.slice(0, 3);

  return (
    <>
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
      <BusinessOverview area={area} />
      <BusinessSubServices area={area} />
      <BusinessProcess />
      <BusinessRelatedCases complexes={relatedComplexes} />
      <BusinessCTA area={area} />
    </>
  );
}
