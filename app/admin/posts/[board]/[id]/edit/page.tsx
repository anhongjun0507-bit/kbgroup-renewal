import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PostForm } from "@/components/admin/PostForm";
import { AttachmentManager } from "@/components/admin/AttachmentManager";
import { requireAdmin } from "@/lib/auth";
import { isBoardType, getBoardConfig } from "@/lib/boards";
import { getPost, getAttachments } from "@/lib/posts";

type Params = { board: string; id: string };

export const metadata: Metadata = {
  title: "글 수정 | 소식 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { board, id } = await params;
  if (!isBoardType(board)) notFound();
  const config = getBoardConfig(board);

  await requireAdmin(`/admin/posts/${board}/${id}/edit`);

  const post = await getPost(board, id);
  if (!post) notFound();
  const attachments = await getAttachments(post.id);

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="posts" />
        <div className="mx-auto max-w-3xl">
          <div className="border-b border-line pb-6">
            <p className="eyebrow text-accent-deep">
              ADMIN ·{" "}
              <Link
                href={`/admin/posts/${board}`}
                className="underline-offset-2 hover:underline"
              >
                {config.label}
              </Link>
            </p>
            <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-ink-strong md:text-[32px]">
              {config.label} 글 수정
            </h1>
            <p className="mt-2 truncate text-[14px] text-ink-muted">{post.title}</p>
          </div>

          {/* 기존 첨부 관리 (PostForm과 별도 폼) */}
          {config.attach && (
            <div className="mt-8 rounded-md border border-line bg-white p-6 md:p-8">
              <p className="eyebrow mb-4">
                현재 첨부 ({attachments.length}/{config.attach.max})
              </p>
              <AttachmentManager
                board={board}
                postId={post.id}
                attachments={attachments}
              />
            </div>
          )}

          {/* 본문 수정 + 첨부 추가 */}
          <div className="mt-6 rounded-md border border-line bg-white p-6 md:p-8">
            <PostForm
              config={config}
              mode="edit"
              postId={post.id}
              initialTitle={post.title}
              initialContent={post.content ?? ""}
              initialPinned={post.isPinned}
              existingCount={attachments.length}
              startOrder={(attachments.at(-1)?.displayOrder ?? -1) + 1}
              submitLabel="수정 완료"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
