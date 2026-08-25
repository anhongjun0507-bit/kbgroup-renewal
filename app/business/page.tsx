import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { businessSections } from "./sections";

export const metadata: Metadata = {
  title: "사업영역 | (주)케이비개발",
  description:
    "케이비개발의 다섯 가지 전문 사업영역 — 주택관리, 위생청소, 경비보안, 시행건설, 기타.",
};

export default async function BusinessIndexPage() {
  const settings = await getSettings();

  return <PageSections page="business" data={{ settings }} sections={businessSections} />;
}
