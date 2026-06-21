import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";
import { isBoardType, getBoardConfig } from "@/lib/boards";

export const metadata: Metadata = {
  title: "새 글 작성 | 소식 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ board: string }>;
}) {
  const { board } = await params;
  if (!isBoardType(board)) notFound();
  const config = getBoardConfig(board);

  await requireAdmin(`/admin/posts/${board}/new`);

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
              {config.label} 새 글 작성
            </h1>
          </div>
          <div className="mt-8 rounded-md border border-line bg-white p-6 md:p-8">
            <PostForm config={config} mode="create" submitLabel="등록" />
          </div>
        </div>
      </Container>
    </section>
  );
}
