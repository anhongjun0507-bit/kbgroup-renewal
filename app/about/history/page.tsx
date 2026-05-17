import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { HistoryTimeline } from "@/components/sections/about/HistoryTimeline";
import { ContactInvite } from "@/components/sections/common/ContactInvite";

export const metadata: Metadata = {
  title: "연혁 | (주)케이비개발",
  description: "2013년 설립 이래 케이비개발이 쌓아온 신뢰의 기록.",
};

export default function HistoryPage() {
  return (
    <>
      <PageHero
        kicker="HISTORY · 연혁"
        title="우리의 발자취"
        italicWord="발자취"
        subtitle="2013년 설립 이래 쌓아온 신뢰의 기록입니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "ABOUT", href: "/about" },
          { label: "연혁" },
        ]}
      />
      <AboutNav current="history" />
      <HistoryTimeline />
      <ContactInvite context="13년 운영의 신뢰를 단지에서 직접 경험해 보세요" />
    </>
  );
}
