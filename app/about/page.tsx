import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { WhyValues } from "@/components/sections/about/WhyValues";
import { WhyDifferentiators } from "@/components/sections/about/WhyDifferentiators";
import { WhyNumbers } from "@/components/sections/about/WhyNumbers";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "회사소개 | (주)케이비개발",
  description:
    "단순한 시설관리를 넘어, 공간을 책임지는 파트너로. 케이비개발이 추구하는 가치와 차별점.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="ABOUT US · 회사소개"
        title="왜 케이비개발인가"
        italicWord="케이비개발"
        subtitle="단순한 시설관리를 넘어, 공간을 책임지는 파트너로."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "ABOUT", href: "/about" },
          { label: "왜 케이비개발" },
        ]}
      />
      <AboutNav current="why" />
      <WhyValues />
      <WhyDifferentiators />
      <WhyNumbers />
      <CTA />
    </>
  );
}
