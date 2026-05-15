import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { ComingSoon } from "@/components/sections/common/ComingSoon";

export const metadata: Metadata = {
  title: "자료실 | (주)케이비개발",
  description: "케이비개발 자료실. 페이지는 준비 중입니다.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        kicker="RESOURCES"
        title="자료실"
        subtitle="회사소개서·홍보물 등 자료를 제공해드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "RESOURCES" },
        ]}
      />
      <ComingSoon
        title="자료실"
        description="자료 업로드 시스템을 준비하고 있습니다."
      />
    </>
  );
}
