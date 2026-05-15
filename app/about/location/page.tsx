import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { LocationMap } from "@/components/sections/about/LocationMap";
import { LocationInfo } from "@/components/sections/about/LocationInfo";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "오시는 길 | (주)케이비개발",
  description: "본사 위치와 교통 안내. 광주광역시 광산구 월계로 223-22.",
};

export default function LocationPage() {
  return (
    <>
      <AboutHero
        kicker="LOCATION · 오시는 길"
        title="오시는 길"
        italicWord="오시는"
        subtitle="언제든 편하게 방문해주세요."
        breadcrumbCurrent="오시는 길"
      />
      <AboutNav current="location" />
      <LocationMap />
      <LocationInfo />
      <CTA />
    </>
  );
}
