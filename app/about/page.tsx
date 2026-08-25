import type { Metadata } from "next";
import { getSettings, getYearsOfOperation } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { aboutSections } from "./sections";

export const metadata: Metadata = {
  title: "회사소개 | (주)케이비개발",
  description:
    "단순한 시설관리를 넘어, 공간을 책임지는 파트너로. 케이비개발이 추구하는 가치와 차별점.",
};

export default async function AboutPage() {
  const [settings, yearsOfOperation] = await Promise.all([
    getSettings(),
    getYearsOfOperation(),
  ]);

  return (
    <PageSections
      page="about"
      data={{ settings, yearsOfOperation }}
      sections={aboutSections}
    />
  );
}
