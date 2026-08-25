import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";
import { historySections } from "./sections";

export const metadata: Metadata = {
  title: "연혁 | (주)케이비개발",
  description: "2013년 설립 이래 케이비개발이 쌓아온 신뢰의 기록.",
};

export default async function HistoryPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/about/history");

  const [history, contact] = await Promise.all([
    getSetting("history"),
    getSetting("contact"),
  ]);

  return (
    <>
      {preview && <UnpublishedNotice path="/about/history" />}
      <PageSections
        page="about/history"
        data={{ history, contact }}
        sections={historySections}
      />
    </>
  );
}
