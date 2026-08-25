import { PageHero } from "@/components/sections/common/PageHero";
import { ContactForm } from "@/components/sections/common/ContactForm";
import type { SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/**
 * /contact 섹션 레지스트리 (PLAN B / DAY 7).
 * 컴포넌트 참조와 하드코딩 프롭은 전부 여기에 남는다. DB 는 표시·순서만 갖는다.
 */
export type ContactData = { contact: SettingValue<"contact"> };

export const contactSections: SectionRenderers<"contact", ContactData> = {
  "page-hero": () => (
    <PageHero
      kicker="CONTACT"
      title="상담 문의"
      italicWord="상담"
      subtitle="단지 규모·관리 범위·운영 형태에 맞춰 견적을 드립니다."
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "CONTACT" },
      ]}
    />
  ),
  "contact-form": ({ contact }) => <ContactForm context="CONTACT 페이지" contact={contact} />,
};
