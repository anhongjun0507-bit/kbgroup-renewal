import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { NoticesList } from "@/components/sections/notices/NoticesList";

export const metadata: Metadata = {
  title: "자료실 | (주)케이비개발",
  description: "회사소개서·홍보물 등 자료를 제공해드립니다.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        kicker="RESOURCES"
        title="자료실"
        italicWord="자료실"
        subtitle="회사소개서·홍보물 등 자료를 제공해드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "RESOURCES" },
        ]}
      />
      <NoticesList items={[]} defaultCategory="press" lockCategory />
    </>
  );
}
