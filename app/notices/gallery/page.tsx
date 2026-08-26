import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import {
  GalleryGridSection,
  type GalleryItem,
} from "@/components/sections/notices/GalleryGridSection";
import { getViewer } from "@/lib/auth";
import { getBoardConfigWithOverride } from "@/lib/board-categories";
import { listPosts, getAttachmentsForPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "갤러리 | (주)케이비개발",
  description: "현장과 행사의 순간을 사진으로 전달드립니다.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const config = await getBoardConfigWithOverride("gallery");
  const { page: rawPage, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { isAdmin } = await getViewer();
  const { posts, total } = await listPosts("gallery", {
    page,
    pageSize: PAGE_SIZE,
    q,
  });
  const attachMap = await getAttachmentsForPosts(posts.map((p) => p.id));
  const items: GalleryItem[] = posts.map((post) => {
    const atts = attachMap.get(post.id) ?? [];
    return { post, cover: atts[0] ?? null, count: atts.length };
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHero
        kicker="GALLERY"
        title={config.label}
        italicWord="갤러리"
        subtitle={config.subtitle}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "GALLERY" },
        ]}
      />
      <GalleryGridSection
        config={config}
        items={items}
        total={total}
        page={page}
        pageCount={pageCount}
        q={q}
        isAdmin={isAdmin}
      />
    </>
  );
}
