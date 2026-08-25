import { Hero } from "@/components/sections/Hero";
import { TrustSignals } from "@/components/sections/TrustSignals";
import { DataCounter } from "@/components/sections/DataCounter";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { Cases } from "@/components/sections/Cases";
import { Partners } from "@/components/sections/Partners";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { ContentComplex, getSettings } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/**
 * 메인(/) 섹션 레지스트리 (PLAN B / DAY 7).
 *
 * 히어로를 제외한 6개 섹션의 `<FadeIn as="div" distance={32} duration={800}>` 래핑은
 * 레지스트리 메타의 `fade: true` 로 옮겨 렌더러가 감싼다 — 마크업은 전환 전과 동일하다.
 */
export type HomeData = {
  settings: Awaited<ReturnType<typeof getSettings>>;
  complexes: ContentComplex[];
};

export const homeSections: SectionRenderers<"home", HomeData> = {
  hero: ({ settings }) => <Hero contact={settings.contact} slides={settings.heroSlides} />,
  "trust-signals": ({ settings }) => <TrustSignals partners={settings.partners} />,
  "data-counter": ({ settings }) => <DataCounter counters={settings.counters} />,
  "service-categories": ({ settings }) => (
    <ServiceCategories businessAreas={settings.businessAreas} />
  ),
  cases: ({ complexes }) => <Cases complexes={complexes} />,
  partners: ({ settings }) => <Partners partners={settings.partners} />,
  "contact-invite": ({ settings }) => (
    <ContactInvite
      contact={settings.contact}
      context="단지·시설 운영에 관한 모든 문의를 환영합니다"
    />
  ),
};
