import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/common/PageHero";
import { PostDetailView } from "@/components/sections/notices/PostDetailView";
import { getViewer } from "@/lib/auth";
import { getBoardConfig } from "@/lib/boards";
import { getPost, getAttachments, getAdjacentPosts } from "@/lib/posts";

type Params = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost("gallery", id);
  return {
    title: post
      ? `${post.title} | 갤러리 | (주)케이비개발`
      : "갤러리 | (주)케이비개발",
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const config = getBoardConfig("gallery");

  const post = await getPost("gallery", id);
  if (!post) notFound();

  const { isAdmin } = await getViewer();
  const [attachments, adj] = await Promise.all([
    getAttachments(post.id),
    getAdjacentPosts("gallery", post.postNumber),
  ]);

  return (
    <>
      <PageHero
        kicker="GALLERY"
        title={post.title}
        subtitle={config.subtitle}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "GALLERY", href: "/notices/gallery" },
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
