import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import {
  NoticesList,
  type NoticeItem,
} from "@/components/sections/notices/NoticesList";

/* Phase 9 P0-05 — 운영성 신호용 더미 공지 5건 시드
   실제 콘텐츠로 교체 전까지 빈 상태 회피 */

export const metadata: Metadata = {
  title: "공지사항 | (주)케이비개발",
  description:
    "케이비개발의 공지·신규단지·언론보도·채용 공고를 한 곳에서 확인하세요.",
};

const SEED: NoticeItem[] = [
  {
    id: "2026-02-jeonnam-branch",
    category: "notice",
    title: "전남지사 이전 안내 (2026.02)",
    summary:
      "기존 목포지사를 확장 이전하여 전남지사로 새롭게 출범합니다. 호남권 단지 관리 대응이 더 빨라집니다.",
    date: "2026-02-15",
  },
  {
    id: "2026-01-new-complex",
    category: "complex",
    title: "광주 양림1휴먼시아 관리 개시",
    summary:
      "광주광역시 양림 휴먼시아 1차 아파트(987세대) 위탁관리·경비·청소 운영을 시작합니다.",
    date: "2026-01-22",
  },
  {
    id: "2025-12-iso-cert",
    category: "press",
    title: "안전보건경영시스템 ISO 45001 재인증",
    summary:
      "전국 운영 단지의 안전 관리 표준을 글로벌 인증으로 다시 확인했습니다.",
    date: "2025-12-12",
  },
  {
    id: "2025-11-cs-team",
    category: "career",
    title: "현장 관리소장·시설 기술인력 상시 채용",
    summary:
      "광주·수도권·호남권 단지의 관리소장 및 시설반장 직무 상시 채용 중. 인재 풀 등록을 안내합니다.",
    date: "2025-11-04",
  },
  {
    id: "2025-10-platform",
    category: "notice",
    title: "리뉴얼 홈페이지 오픈 안내",
    summary:
      "(주)케이비개발 공식 홈페이지를 새 도메인 kbgroup.kr 기반으로 리뉴얼 오픈했습니다.",
    date: "2025-10-30",
  },
];

export default function NoticesPage() {
  return (
    <>
      <PageHero
        kicker="NOTICES"
        title="공지사항"
        italicWord="공지"
        subtitle="(주)케이비개발의 공지·소식을 카테고리별로 확인하세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES" },
        ]}
      />
      <NoticesList items={SEED} />
    </>
  );
}
