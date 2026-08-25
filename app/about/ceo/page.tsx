import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";
import { ceoSections } from "./sections";

export const metadata: Metadata = {
  title: "대표 메시지 | (주)케이비개발",
  description: "공간을 책임진다는 약속, 그 시작과 의지를 전합니다.",
};

export default async function CeoPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/about/ceo");

  const [ceoMessage, contact] = await Promise.all([
    getSetting("ceoMessage"),
    getSetting("contact"),
  ]);

  return (
    <>
      {preview && <UnpublishedNotice path="/about/ceo" />}
      <PageSections page="about/ceo" data={{ ceoMessage, contact }} sections={ceoSections} />

    </>
  );
}
