import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { ComingSoon } from "@/components/sections/common/ComingSoon";

export const metadata: Metadata = {
  title: "갤러리 | (주)케이비개발",
  description: "케이비개발 갤러리. 페이지는 준비 중입니다.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        kicker="GALLERY"
        title="갤러리"
        subtitle="현장과 행사의 순간을 사진으로 전달드립니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "GALLERY" },
        ]}
      />
      <ComingSoon
        title="갤러리"
        description="현장 사진 업로드 시스템을 준비하고 있습니다."
      />
    </>
  );
}
