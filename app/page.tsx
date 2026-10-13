import type { Metadata } from "next";
import { getComplexes, getSettings } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { homeSections } from "./sections";

/* canonical 은 페이지마다 둔다 — 루트 layout 에 두면 하위 페이지가 전부 메인을 가리키게 상속된다. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [settings, complexes] = await Promise.all([getSettings(), getComplexes()]);

  return <PageSections page="home" data={{ settings, complexes }} sections={homeSections} />;
}
