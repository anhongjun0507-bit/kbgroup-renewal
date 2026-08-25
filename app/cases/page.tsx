import type { Metadata } from "next";
import { getComplexes, getPastComplexes, getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { casesSections } from "./sections";

export const metadata: Metadata = {
  title: "관리현황 | (주)케이비개발",
  description:
    "케이비개발이 함께하는 단지들 — 전국 단지에서 신뢰를 쌓고 있습니다.",
};

/* PLAN B / DAY 3 — 단지 데이터를 lib/content 어댑터로 읽어 하위 클라 컴포넌트에 주입한다.
   (CasesStats·CasesGallery·PastProjects 는 "use client" 라 어댑터를 직접 호출할 수 없다) */
export default async function CasesPage() {
  const [complexes, pastComplexes, stats, contact] = await Promise.all([
    getComplexes(),
    getPastComplexes(),
    getSetting("stats"),
    getSetting("contact"),
  ]);

  return (
    <PageSections
      page="cases"
      data={{ complexes, pastComplexes, stats, contact }}
      sections={casesSections}
    />
  );
}
