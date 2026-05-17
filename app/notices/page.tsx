import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { NoticesList } from "@/components/sections/notices/NoticesList";
import { NOTICES } from "./data";

export const metadata: Metadata = {
  title: "공지사항 | (주)케이비개발",
  description:
    "케이비개발의 공지·신규단지·언론보도·채용 공고를 한 곳에서 확인하세요.",
};

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
      <NoticesList items={NOTICES} />
    </>
  );
}
