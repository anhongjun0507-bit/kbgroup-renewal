import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { LocationMap } from "@/components/sections/about/LocationMap";
import { LocationInfo } from "@/components/sections/about/LocationInfo";
import { ContactInvite } from "@/components/sections/common/ContactInvite";

export const metadata: Metadata = {
  title: "오시는 길 | (주)케이비개발",
  description: "본사 위치와 교통 안내. 전남광주특별시 광산구 월계로 223-22.",
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
      <ContactInvite context="본사 방문 상담을 원하시면 사전 예약을 권장드립니다" />
    </>
  );
}
