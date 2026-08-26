import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/common/PageHero";
import { PostDetailView } from "@/components/sections/notices/PostDetailView";
import { getViewer } from "@/lib/auth";
import { getBoardConfigWithOverride } from "@/lib/board-categories";
import { getPost, getAttachments, getAdjacentPosts } from "@/lib/posts";

type Params = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost("news", id);
  return {
    title: post
      ? `${post.title} | 단지소식 | (주)케이비개발`
      : "단지소식 | (주)케이비개발",
    description: post?.content?.slice(0, 120) ?? undefined,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const config = await getBoardConfigWithOverride("news");

  const post = await getPost("news", id);
  if (!post) notFound();

  const { isAdmin } = await getViewer();
  const [attachments, adj] = await Promise.all([
    getAttachments(post.id),
    getAdjacentPosts("news", post.postNumber),
  ]);

  return (
    <>
      <PageHero
        kicker="DISTRICT NEWS"
        title={post.title}
        subtitle={config.subtitle}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "NEWS", href: "/notices/news" },
          { label: "DETAIL" },
        ]}
      />
      <PostDetailView
        config={config}
        post={post}
        attachments={attachments}
        isAdmin={isAdmin}
        prev={adj.prev}
        next={adj.next}
      />
    </>
  );
}
