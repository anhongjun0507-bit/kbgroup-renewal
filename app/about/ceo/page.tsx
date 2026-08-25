import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { ceoSections } from "./sections";

export const metadata: Metadata = {
  title: "대표 메시지 | (주)케이비개발",
  description: "공간을 책임진다는 약속, 그 시작과 의지를 전합니다.",
};

export default async function CeoPage() {
  const [ceoMessage, contact] = await Promise.all([
    getSetting("ceoMessage"),
    getSetting("contact"),
  ]);

  return (
    <PageSections page="about/ceo" data={{ ceoMessage, contact }} sections={ceoSections} />
  );
}
