import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComplexes, getSetting, getSettings } from "@/lib/content";
import { PageHero } from "@/components/sections/common/PageHero";
import { BusinessOverview } from "@/components/sections/business/BusinessOverview";
import { BusinessSubServices } from "@/components/sections/business/BusinessSubServices";
import { BusinessProcess } from "@/components/sections/business/BusinessProcess";
import { BusinessFAQ } from "@/components/sections/business/BusinessFAQ";
import { BusinessRelatedCases } from "@/components/sections/business/BusinessRelatedCases";
import { BusinessCTA } from "@/components/sections/business/BusinessCTA";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const businessAreas = await getSetting("businessAreas");
  return businessAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const [{ slug }, businessAreas] = await Promise.all([
    params,
    getSetting("businessAreas"),
  ]);
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
  const [{ slug }, settings, complexes] = await Promise.all([
    params,
    getSettings(),
    getComplexes(),
  ]);
  const areaIndex = settings.businessAreas.findIndex((a) => a.slug === slug);
  if (areaIndex === -1) notFound();
  const area = settings.businessAreas[areaIndex];

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
      <BusinessSubServices area={area} gallery={settings.businessGallery} />
      <BusinessProcess processSteps={settings.processSteps} />
      <BusinessFAQ areaId={area.id} />
      <BusinessRelatedCases complexes={relatedComplexes} />
      <BusinessCTA area={area} contact={settings.contact} />
    </>
  );
}
