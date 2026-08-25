import type { Metadata } from "next";
import { getSettings, getYearsOfOperation } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";
import { aboutSections } from "./sections";

export const metadata: Metadata = {
  title: "회사소개 | (주)케이비개발",
  description:
    "단순한 시설관리를 넘어, 공간을 책임지는 파트너로. 케이비개발이 추구하는 가치와 차별점.",
};

export default async function AboutPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/about");

  const [settings, yearsOfOperation] = await Promise.all([
    getSettings(),
    getYearsOfOperation(),
  ]);

  return (
    <>
      {preview && <UnpublishedNotice path="/about" />}
      <PageSections
        page="about"
        data={{ settings, yearsOfOperation }}
        sections={aboutSections}
      />
    </>
  );
}
