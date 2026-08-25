import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { LocationMap } from "@/components/sections/about/LocationMap";
import { LocationInfo } from "@/components/sections/about/LocationInfo";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/** /about/location 섹션 레지스트리 (PLAN B / DAY 7). */
export type LocationData = { contact: SettingValue<"contact"> };

export const locationSections: SectionRenderers<"about/location", LocationData> = {
  "page-hero": () => (
    <PageHero
      kicker="LOCATION · 오시는 길"
      title="오시는 길"
      italicWord="오시는"
      subtitle="언제든 편하게 방문해주세요."
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "ABOUT", href: "/about" },
        { label: "오시는 길" },
      ]}
    />
  ),
  "about-nav": () => <AboutNav current="location" />,
  "location-map": ({ contact }) => <LocationMap contact={contact} />,
  "location-info": ({ contact }) => <LocationInfo contact={contact} />,
  "contact-invite": ({ contact }) => (
    <ContactInvite contact={contact} context="본사 방문 상담을 원하시면 사전 예약을 권장드립니다" />
  ),
};
