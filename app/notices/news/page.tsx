import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { NoticesList } from "@/components/sections/notices/NoticesList";

export const metadata: Metadata = {
  title: "단지소식 | (주)케이비개발",
  description: "관리 단지의 운영 소식과 입주민 안내.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        kicker="DISTRICT NEWS"
        title="단지소식"
        italicWord="단지"
        subtitle="관리 단지의 운영 소식과 입주민 안내를 전달드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "NEWS" },
        ]}
      />
      <NoticesList items={[]} defaultCategory="complex" lockCategory />
    </>
  );
}
