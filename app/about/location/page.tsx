import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";
import { locationSections } from "./sections";

export const metadata: Metadata = {
  title: "오시는 길 | (주)케이비개발",
  description: "본사 위치와 교통 안내. 전남광주특별시 광산구 월계로 223-22.",
};

export default async function LocationPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/about/location");

  const contact = await getSetting("contact");

  return (
    <>
      {preview && <UnpublishedNotice path="/about/location" />}
      <PageSections page="about/location" data={{ contact }} sections={locationSections} />

    </>
  );
}
