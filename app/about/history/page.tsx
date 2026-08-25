import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { historySections } from "./sections";

export const metadata: Metadata = {
  title: "연혁 | (주)케이비개발",
  description: "2013년 설립 이래 케이비개발이 쌓아온 신뢰의 기록.",
};

export default async function HistoryPage() {
  const [history, contact] = await Promise.all([
    getSetting("history"),
    getSetting("contact"),
  ]);

  return (
    <PageSections
      page="about/history"
      data={{ history, contact }}
      sections={historySections}
    />
  );
}
