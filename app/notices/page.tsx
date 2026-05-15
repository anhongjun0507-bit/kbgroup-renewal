import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { ComingSoon } from "@/components/sections/common/ComingSoon";

export const metadata: Metadata = {
  title: "공지사항 | (주)케이비개발",
  description: "케이비개발 공지사항. 페이지는 준비 중입니다.",
};

export default function NoticesPage() {
  return (
    <>
      <PageHero
        kicker="NOTICES"
        title="공지사항"
        subtitle="(주)케이비개발의 공지·소식을 전달드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES" },
        ]}
      />
      <ComingSoon
        title="공지사항"
        description="공지·소식 게시판은 개편 중입니다."
      />
    </>
  );
}
