import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { CeoPortrait } from "@/components/sections/about/CeoPortrait";
import { CeoMessage } from "@/components/sections/about/CeoMessage";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "대표 메시지 | (주)케이비개발",
  description: "공간을 책임진다는 약속, 그 시작과 의지를 전합니다.",
};

export default function CeoPage() {
  return (
    <>
      <PageHero
        kicker="CEO MESSAGE · 대표 메시지"
        title="대표 인사말"
        italicWord="인사말"
        subtitle="공간을 책임진다는 약속, 그 시작과 의지를 전합니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "ABOUT", href: "/about" },
          { label: "대표 메시지" },
        ]}
      />
      <AboutNav current="ceo" />
      <CeoPortrait />
      <CeoMessage />
      <CTA />
    </>
  );
}
