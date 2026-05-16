import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { LocationMap } from "@/components/sections/about/LocationMap";
import { LocationInfo } from "@/components/sections/about/LocationInfo";
import { ContactForm } from "@/components/sections/common/ContactForm";

export const metadata: Metadata = {
  title: "오시는 길 | (주)케이비개발",
  description: "본사 위치와 교통 안내. 광주광역시 광산구 월계로 223-22.",
};

export default function LocationPage() {
  return (
    <>
      <PageHero
        kicker="LOCATION · 오시는 길"
        title="오시는 길"
        italicWord="오시는"
        subtitle="언제든 편하게 방문해주세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "ABOUT", href: "/about" },
          { label: "오시는 길" },
        ]}
      />
      <AboutNav current="location" />
      <LocationMap />
      <LocationInfo />
      <ContactForm context="오시는 길 — 방문 상담 문의" />
    </>
  );
}
