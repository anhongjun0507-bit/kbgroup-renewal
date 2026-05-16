import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { NoticesList } from "@/components/sections/notices/NoticesList";

export const metadata: Metadata = {
  title: "갤러리 | (주)케이비개발",
  description: "현장과 행사의 순간을 사진으로 전달드립니다.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        kicker="GALLERY"
        title="갤러리"
        italicWord="갤러리"
        subtitle="현장과 행사의 순간을 사진으로 전달드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "GALLERY" },
        ]}
      />
      <NoticesList items={[]} defaultCategory="complex" lockCategory />
    </>
  );
}
