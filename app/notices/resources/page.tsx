import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import {
  ResourceListSection,
  type ResourceItem,
} from "@/components/sections/notices/ResourceListSection";
import { getViewer } from "@/lib/auth";
import { getBoardConfigWithOverride } from "@/lib/board-categories";
import { listPosts, getAttachmentsForPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "자료실 | (주)케이비개발",
  description: "회사소개서·홍보물 등 자료를 제공해드립니다.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const config = await getBoardConfigWithOverride("resources");
  const { page: rawPage, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { isAdmin } = await getViewer();
  const { posts, total } = await listPosts("resources", {
    page,
    pageSize: PAGE_SIZE,
    q,
  });
  const attachMap = await getAttachmentsForPosts(posts.map((p) => p.id));
  const items: ResourceItem[] = posts.map((post) => ({
    post,
    file: (attachMap.get(post.id) ?? [])[0] ?? null,
  }));
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHero
        kicker="RESOURCES"
        title={config.label}
        italicWord="자료실"
        subtitle={config.subtitle}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "RESOURCES" },
        ]}
      />
      <ResourceListSection
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
