import { PageHero } from "@/components/sections/common/PageHero";
import { AboutNav } from "@/components/sections/about/AboutNav";
import { HistoryTimeline } from "@/components/sections/about/HistoryTimeline";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/** /about/history 섹션 레지스트리 (PLAN B / DAY 7). */
export type HistoryData = {
  history: SettingValue<"history">;
  contact: SettingValue<"contact">;
};

export const historySections: SectionRenderers<"about/history", HistoryData> = {
  "page-hero": () => (
    <PageHero
      kicker="HISTORY · 연혁"
      title="우리의 발자취"
      italicWord="발자취"
      subtitle="2013년 설립 이래 쌓아온 신뢰의 기록입니다."
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "ABOUT", href: "/about" },
        { label: "연혁" },
      ]}
    />
  ),
  "about-nav": () => <AboutNav current="history" />,
  "history-timeline": ({ history }) => <HistoryTimeline history={history} />,
  "contact-invite": ({ contact }) => (
    <ContactInvite contact={contact} context="13년 운영의 신뢰를 단지에서 직접 경험해 보세요" />
  ),
};
