import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { careersSections } from "./sections";

export const metadata: Metadata = {
  title: "채용 | (주)케이비개발",
  description:
    "신뢰를 쌓아가는 케이비개발과 함께 새로운 길을 열어갈 동료를 찾습니다.",
};

export default async function CareersPage() {
  const contact = await getSetting("contact");

  return <PageSections page="careers" data={{ contact }} sections={careersSections} />;
}
