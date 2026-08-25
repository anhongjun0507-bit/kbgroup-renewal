import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { contactSections } from "./sections";

/* Phase 6.2 A-5 — /contact 라우트 신설 (Header/Footer/CTAs에서 참조) */

export const metadata: Metadata = {
  title: "상담 문의 | (주)케이비개발",
  description:
    "단지 규모·관리 범위·운영 형태에 맞춰 견적을 산정합니다. 영업일 기준 평균 4시간 안에 회신드립니다.",
};

export default async function ContactPage() {
  const contact = await getSetting("contact");

  return <PageSections page="contact" data={{ contact }} sections={contactSections} />;
}
