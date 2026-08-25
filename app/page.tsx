import { Hero } from "@/components/sections/Hero";
import { TrustSignals } from "@/components/sections/TrustSignals";
import { DataCounter } from "@/components/sections/DataCounter";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { Cases } from "@/components/sections/Cases";
import { Partners } from "@/components/sections/Partners";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import { FadeIn } from "@/components/ui";
import { getComplexes, getSettings } from "@/lib/content";

export default async function Home() {
  const [settings, complexes] = await Promise.all([getSettings(), getComplexes()]);

  return (
    <>
      <Hero contact={settings.contact} />
      <FadeIn as="div" distance={32} duration={800}>
        <TrustSignals partners={settings.partners} />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <DataCounter counters={settings.counters} />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <ServiceCategories businessAreas={settings.businessAreas} />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <Cases complexes={complexes} />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <Partners partners={settings.partners} />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <ContactInvite
          contact={settings.contact}
          context="단지·시설 운영에 관한 모든 문의를 환영합니다"
        />
      </FadeIn>
    </>
  );
}
