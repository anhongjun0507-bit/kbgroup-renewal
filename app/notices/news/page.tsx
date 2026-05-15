import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { ComingSoon } from "@/components/sections/common/ComingSoon";

export const metadata: Metadata = {
  title: "단지소식 | (주)케이비개발",
  description: "케이비개발 관리 단지의 소식. 페이지는 준비 중입니다.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        kicker="DISTRICT NEWS"
        title="단지소식"
        subtitle="관리 단지의 운영 소식과 입주민 안내를 전달드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "NEWS" },
        ]}
      />
      <ComingSoon
        title="단지소식"
        description="단지별 소식 게시판은 개편 중입니다."
      />
    </>
  );
}
