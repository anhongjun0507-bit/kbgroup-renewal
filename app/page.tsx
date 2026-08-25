import { getComplexes, getSettings } from "@/lib/content";
import { PageSections } from "@/lib/sections/PageSections";
import { homeSections } from "./sections";

export default async function Home() {
  const [settings, complexes] = await Promise.all([getSettings(), getComplexes()]);

  return <PageSections page="home" data={{ settings, complexes }} sections={homeSections} />;
}
