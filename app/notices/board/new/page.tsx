import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";
import { PostForm } from "@/components/sections/board/PostForm";
import { getViewer } from "@/lib/auth";
import { createPost } from "../actions";

export const metadata: Metadata = {
  title: "글쓰기 | 자유게시판 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const { user } = await getViewer();
  if (!user) redirect("/login?next=/notices/board/new");

  return (
    <>
      <PageHero
        kicker="WRITE · 글쓰기"
        title="새 글 작성"
        italicWord="작성"
        subtitle="자유게시판에 남길 글을 작성해 주세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: "BOARD", href: "/notices/board" },
          { label: "WRITE" },
        ]}
      />
      <section className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl">
            <PostForm
              action={createPost}
              submitLabel="등록"
              cancelHref="/notices/board"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
