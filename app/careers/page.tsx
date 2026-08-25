import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";
import { careersSections } from "./sections";

export const metadata: Metadata = {
  title: "채용 | (주)케이비개발",
  description:
    "신뢰를 쌓아가는 케이비개발과 함께 새로운 길을 열어갈 동료를 찾습니다.",
};

export default async function CareersPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/careers");

  const contact = await getSetting("contact");

  return (
    <>
      {preview && <UnpublishedNotice path="/careers" />}
      <PageSections page="careers" data={{ contact }} sections={careersSections} />
    </>
  );
}
