import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";
import { businessSections } from "./sections";

export const metadata: Metadata = {
  title: "사업영역 | (주)케이비개발",
  description:
    "케이비개발의 다섯 가지 전문 사업영역 — 주택관리, 위생청소, 경비보안, 시행건설, 기타.",
};

export default async function BusinessIndexPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/business");

  const settings = await getSettings();

  return (
    <>
      {preview && <UnpublishedNotice path="/business" />}
      <PageSections page="business" data={{ settings }} sections={businessSections} />
    </>
  );
}
