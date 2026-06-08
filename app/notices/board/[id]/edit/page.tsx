import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";
import { PostForm } from "@/components/sections/board/PostForm";
import { getViewer } from "@/lib/auth";
import { updatePost } from "../../actions";

type Params = { id: string };

export const metadata: Metadata = {
  title: "글 수정 | 자유게시판 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const { user, isAdmin, supabase } = await getViewer();

  if (!user) redirect(`/login?next=/notices/board/${id}/edit`);

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("board_type", "free")
    .maybeSingle();

  if (!post) notFound();

  // 작성자 또는 admin만 수정 가능
  if (post.author_id !== user.id && !isAdmin) {
    redirect(`/notices/board/${id}`);
  }

  return (
    <>
      <PageHero
        kicker="EDIT · 글 수정"
        title="글 수정"
        italicWord="수정"
        subtitle="작성하신 글을 수정합니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "BOARD", href: "/notices/board" },
          { label: "EDIT" },
        ]}
      />
      <section className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl">
            <PostForm
              action={updatePost}
              postId={post.id}
              initialTitle={post.title}
              initialContent={post.content ?? ""}
              submitLabel="수정 완료"
              cancelHref={`/notices/board/${post.id}`}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
