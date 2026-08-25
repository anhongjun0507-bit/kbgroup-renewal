import type { ReactNode } from "react";

/**
 * 섹션 레지스트리 — 메타데이터 (PLAN B / DAY 7, ITEM 02).
 *
 * 이 파일에는 **컴포넌트를 import 하지 않는다.** 관리자 화면(`/admin/content/sections`)이
 * 페이지·섹션 목록을 이 파일만으로 그릴 수 있어야 하기 때문이다.
 * 실제 렌더는 각 페이지 폴더의 `sections.tsx` 가 이 키에 1:1로 대응하는 렌더 함수를 등록한다.
 *
 * 규약
 *  · **DB 에는 컴포넌트 이름 문자열을 넣지 않는다.** DB(`page_sections`)가 갖는 것은
 *    `page_key` · `section_key` · `is_visible` · `sort_order` 뿐이고,
 *    컴포넌트 참조와 하드코딩 프롭은 전부 코드(`sections.tsx`)에 남는다.
 *  · 배열 순서 = `defaultOrder`. DB 에 행이 없으면 이 순서 그대로 렌더된다(= 전환 전과 동일).
 *    별도의 숫자 필드를 두지 않는 이유는 두 값이 어긋날 여지를 아예 없애기 위해서다.
 *  · `removable: false` 인 섹션은 관리자 화면에서 숨김 토글이 잠기고, 렌더러도 무조건 표시한다.
 *  · 레지스트리에 없는 `section_key` 행은 렌더러가 무시한다(코드 롤백 시 데이터 보존).
 */
export type SectionMeta = {
  key: string;
  label: string;
  removable: boolean;
  /** 렌더러가 `<FadeIn as="div" distance={32} duration={800}>` 로 감싼다.
   *  기존 `app/page.tsx` 의 래핑을 렌더러로 이관한 것이라 메인 페이지에만 쓰인다. */
  fade?: boolean;
};

type PageMeta = { label: string; sections: readonly SectionMeta[] };

export const PAGE_SECTIONS = {
  home: {
    label: "메인",
    sections: [
      { key: "hero", label: "히어로", removable: false },
      { key: "trust-signals", label: "발주처 신뢰 배지", removable: true, fade: true },
      { key: "data-counter", label: "핵심 지표 카운터", removable: true, fade: true },
      { key: "service-categories", label: "사업영역 카드", removable: true, fade: true },
      { key: "cases", label: "관리 단지 미리보기", removable: true, fade: true },
      { key: "partners", label: "발주처·시공사", removable: true, fade: true },
      { key: "contact-invite", label: "상담 안내", removable: true, fade: true },
    ],
  },
  about: {
    label: "회사소개 · 가치의 실현",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "about-nav", label: "회사소개 서브 내비", removable: false },
      { key: "company-office", label: "본사·사업장 정보", removable: true },
      { key: "why-values", label: "핵심 가치", removable: true },
      { key: "why-differentiators", label: "차별점", removable: true },
      { key: "why-numbers", label: "숫자로 보는 케이비개발", removable: true },
      { key: "organization", label: "조직도", removable: true },
      { key: "equipment", label: "보유 장비", removable: true },
      { key: "related-companies", label: "계열사", removable: true },
      { key: "collaborators", label: "협력업체", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  "about/ceo": {
    label: "회사소개 · 대표 메시지",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "about-nav", label: "회사소개 서브 내비", removable: false },
      { key: "ceo-portrait", label: "대표 사진", removable: true },
      { key: "ceo-message", label: "대표 인사말", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  "about/history": {
    label: "회사소개 · 연혁",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "about-nav", label: "회사소개 서브 내비", removable: false },
      { key: "history-timeline", label: "연혁 타임라인", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  "about/location": {
    label: "회사소개 · 오시는 길",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "about-nav", label: "회사소개 서브 내비", removable: false },
      { key: "location-map", label: "약도", removable: true },
      { key: "location-info", label: "교통·주차 안내", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  business: {
    label: "사업영역 목록",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "business-intro", label: "다섯 가지 사업영역 소개", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  "business/[slug]": {
    label: "사업영역 상세 (5개 슬러그 공통)",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "overview", label: "사업 개요", removable: true },
      { key: "sub-services", label: "세부 서비스", removable: true },
      { key: "process", label: "서비스 프로세스", removable: true },
      { key: "faq", label: "자주 묻는 질문", removable: true },
      { key: "related-cases", label: "관련 단지", removable: true },
      { key: "cta", label: "문의 CTA", removable: true },
    ],
  },
  cases: {
    label: "관리현황",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "cases-stats", label: "관리 현황 요약", removable: true },
      { key: "photo-gallery", label: "현장 사진", removable: true },
      { key: "cases-gallery", label: "단지 목록", removable: true },
      { key: "past-projects", label: "과거 수행 단지", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  licenses: {
    label: "인허가 · 기술 자격",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "workforce-stats", label: "인력 현황", removable: true },
      { key: "licenses-kpi", label: "인허가 KPI", removable: true },
      { key: "licenses-overview", label: "기술 인증 개요", removable: true },
      { key: "licenses-grid", label: "보유 인허가", removable: true },
      { key: "certifications-grid", label: "기술 자격증", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  careers: {
    label: "채용",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "openings", label: "채용 중인 공고", removable: true },
      { key: "values", label: "인재상", removable: true },
      { key: "welfare", label: "복리후생", removable: true },
      { key: "apply", label: "지원 안내", removable: true },
      { key: "contact-invite", label: "상담 안내", removable: true },
    ],
  },
  contact: {
    label: "상담 문의",
    sections: [
      { key: "page-hero", label: "페이지 히어로", removable: false },
      { key: "contact-form", label: "문의 폼", removable: false },
    ],
  },
} as const satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof PAGE_SECTIONS;

/** 관리자 화면의 페이지 나열 순서 = 위 객체의 선언 순서. */
export const PAGE_KEYS = Object.keys(PAGE_SECTIONS) as PageKey[];

/** 해당 페이지에 등록된 섹션 키의 유니온. */
export type SectionKey<P extends PageKey> =
  (typeof PAGE_SECTIONS)[P]["sections"][number]["key"];

/**
 * 페이지별 렌더 맵. 키가 하나라도 빠지면 **타입 에러**가 난다.
 * 하드코딩 프롭(`<AboutNav current="why">`, `<ContactInvite context="…">` 등)은
 * 이 렌더 함수 안의 JSX 에 그대로 남으므로 프롭 누락도 컴파일 시점에 잡힌다.
 */
export type SectionRenderers<P extends PageKey, D> = Record<
  SectionKey<P>,
  (data: D) => ReactNode
>;

/** 공개 경로 → 페이지 키. 관리자 화면에서 미리보기 링크를 만들 때 쓴다. */
export const PAGE_PATHS: Record<PageKey, string> = {
  home: "/",
  about: "/about",
  "about/ceo": "/about/ceo",
  "about/history": "/about/history",
  "about/location": "/about/location",
  business: "/business",
  "business/[slug]": "/business/facility",
  cases: "/cases",
  licenses: "/licenses",
  careers: "/careers",
  contact: "/contact",
};
