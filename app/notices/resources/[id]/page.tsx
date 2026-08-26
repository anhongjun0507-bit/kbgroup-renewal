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
  const post = await getPost("resources", id);
  return {
    title: post
      ? `${post.title} | 자료실 | (주)케이비개발`
      : "자료실 | (주)케이비개발",
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const config = await getBoardConfigWithOverride("resources");

  const post = await getPost("resources", id);
  if (!post) notFound();

  const { isAdmin } = await getViewer();
  const [attachments, adj] = await Promise.all([
    getAttachments(post.id),
    getAdjacentPosts("resources", post.postNumber),
  ]);

  return (
    <>
      <PageHero
        kicker="RESOURCES"
        title={post.title}
        subtitle={config.subtitle}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "RESOURCES", href: "/notices/resources" },
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
