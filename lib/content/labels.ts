/**
 * 관리자 화면에 보이는 콘텐츠 라벨 (PLAN B).
 *
 * `site_settings` 는 키가 영문이라 그대로 노출하면 관리자가 무엇인지 알 수 없다.
 * 설정 저장 메시지(DAY 4)와 복구 이력 화면(DAY 9)이 같은 이름을 써야 해서 한곳에 모은다.
 */
export const SETTING_LABELS: Record<string, string> = {
  company: "회사 기본 정보",
  contact: "연락처",
  ceoMessage: "대표 인사말",
  counters: "메인 카운터",
  stats: "마케팅 표기값(STATS)",
  coreValues: "핵심 가치",
  differentiators: "차별점",
  companyStrengths: "회사 강점",
  history: "연혁",
  partners: "발주처·시공사",
  collaborators: "협력업체",
  relatedCompanies: "계열사",
  licenses: "보유 인허가",
  certifications: "기술 자격증",
  businessAreas: "사업영역",
  processSteps: "서비스 프로세스",
  organization: "조직도",
  heroSlides: "메인 히어로 슬라이드",
  businessGallery: "사업영역 갤러리",
  boardCategories: "게시판 카테고리",
};

export function settingLabel(key: string): string {
  return SETTING_LABELS[key] ?? key;
}
