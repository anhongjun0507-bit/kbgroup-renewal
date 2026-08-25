import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { CeoPortrait } from "@/components/sections/about/CeoPortrait";
import { CeoMessage } from "@/components/sections/about/CeoMessage";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/** /about/ceo 섹션 레지스트리 (PLAN B / DAY 7). */
export type CeoData = {
  ceoMessage: SettingValue<"ceoMessage">;
  contact: SettingValue<"contact">;
};

export const ceoSections: SectionRenderers<"about/ceo", CeoData> = {
  "page-hero": () => (
    <PageHero
      kicker="CEO MESSAGE"
      title="대표이사 인사말"
      italicWord="인사말"
      subtitle="공간을 책임진다는 약속, 그 시작과 의지를 전합니다."
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "ABOUT", href: "/about" },
        { label: "CEO MESSAGE" },
      ]}
    />
  ),
  "about-nav": () => <AboutNav current="ceo" />,
  "ceo-portrait": ({ ceoMessage }) => <CeoPortrait ceoMessage={ceoMessage} />,
  "ceo-message": ({ ceoMessage }) => <CeoMessage ceoMessage={ceoMessage} />,
  "contact-invite": ({ contact }) => (
    <ContactInvite contact={contact} context="대표 메시지에 공감하셨다면 함께 시작해 주세요" />
  ),
};
