import { PageHero } from "@/components/sections/common/PageHero";
import { CareersValues } from "@/components/sections/careers/CareersValues";
import { CareersWelfare } from "@/components/sections/careers/CareersWelfare";
import { CareersOpenings } from "@/components/sections/careers/CareersOpenings";
import { CareersApply } from "@/components/sections/careers/CareersApply";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import type { SettingValue } from "@/lib/content";
import type { SectionRenderers } from "@/lib/sections/meta";

/** /careers 섹션 레지스트리 (PLAN B / DAY 7). */
export type CareersData = { contact: SettingValue<"contact"> };

export const careersSections: SectionRenderers<"careers", CareersData> = {
  "page-hero": () => (
    <PageHero
      kicker="CAREERS"
      title="함께 신뢰를 키워갈 동료"
      italicWord="동료"
      subtitle="자격증과 경력보다 사람을 우선합니다. 진심을 가진 분과 오래 함께하는 회사를 만들고 있습니다."
      bgImage="/images/hero/pages/careers.png"
      breadcrumb={[
        { label: "HOME", href: "/" },
        { label: "CAREERS" },
      ]}
    />
  ),
  /* 현재 채용 중인 공고를 최상단으로 (클라 요청 2026-06-08) — 선언 순서가 곧 기본 배치다. */
  openings: ({ contact }) => <CareersOpenings contact={contact} />,
  values: () => <CareersValues />,
  welfare: () => <CareersWelfare />,
  apply: ({ contact }) => <CareersApply contact={contact} />,
  "contact-invite": ({ contact }) => (
    <ContactInvite
      contact={contact}
      context="채용·사업 관련 일반 문의는 본사 회선으로 직접 연락 주세요"
      ctaLabel="문의 페이지 이동"
    />
  ),
};
