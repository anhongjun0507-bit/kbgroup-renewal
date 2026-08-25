import type { Metadata } from "next";
import { getSettings, getYearsOfOperation } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { licensesSections } from "./sections";

export const metadata: Metadata = {
  title: "인허가 · 기술 자격 | (주)케이비개발",
  description:
    "11종의 보유 인허가와 27종의 기술 인증서. 1,575명의 자격증 보유 전문 인력이 함께합니다.",
};

export default async function LicensesPage() {
  const [settings, yearsOfOperation] = await Promise.all([
    getSettings(),
    getYearsOfOperation(),
  ]);

  return (
    <PageSections
      page="licenses"
      data={{ settings, yearsOfOperation }}
      sections={licensesSections}
    />
  );
}
