import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { PostListSection } from "@/components/sections/notices/PostListSection";
import { getViewer } from "@/lib/auth";
import { getBoardConfigWithOverride } from "@/lib/board-categories";
import { listPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "단지소식 | (주)케이비개발",
  description: "관리 단지의 운영 소식과 입주민 안내.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const config = await getBoardConfigWithOverride("news");
  const { page: rawPage, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { isAdmin } = await getViewer();
  const { posts, total } = await listPosts("news", { page, pageSize: PAGE_SIZE, q });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHero
        kicker="DISTRICT NEWS"
        title={config.label}
        italicWord="단지"
        subtitle={config.subtitle}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "NEWS" },
        ]}
      />
      <PostListSection
        config={config}
        posts={posts}
        total={total}
        page={page}
        pageCount={pageCount}
        q={q}
        isAdmin={isAdmin}
      />
    </>
  );
}
