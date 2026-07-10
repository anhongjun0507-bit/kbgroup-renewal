import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";
import { PostListSection } from "@/components/sections/notices/PostListSection";
import { getViewer } from "@/lib/auth";
import { getBoardConfig } from "@/lib/boards";
import { listPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "공지사항 | (주)케이비개발",
  description:
    "(주)케이비개발의 공지·안내 소식을 확인하세요.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const config = getBoardConfig("notice");
  const { page: rawPage, q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { isAdmin } = await getViewer();
  const { posts, total } = await listPosts("notice", { page, pageSize: PAGE_SIZE, q });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHero
        kicker="NOTICES"
        title="공지사항"
        italicWord="공지"
        subtitle="(주)케이비개발의 공지·소식을 확인하세요."
        bgImage="/images/hero/pages/notices.png"
        breadcrumb={[{ label: "HOME", href: "/" }, { label: "NOTICES" }]}
      />

      {/* 자유게시판 안내 카드 */}
      <section className="bg-white pt-12 md:pt-16">
        <Container>
          <Link
            href="/notices/board"
            className="group flex items-center justify-between gap-4 rounded-md border border-line bg-bg-soft px-6 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[0_10px_28px_rgba(11,26,51,0.08)]"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-accent-500 text-navy-900"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5Z" />
                </svg>
              </span>
              <div>
                <p className="font-display text-[16px] font-bold tracking-tight text-ink-strong md:text-[18px]">
                  자유게시판
                </p>
                <p className="mt-0.5 text-[13px] text-ink-muted md:text-[14px]">
                  회원 누구나 자유롭게 글을 남기는 소통 공간입니다.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ink-strong md:text-[14px]">
              <span className="hidden sm:inline">바로가기</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        </Container>
      </section>

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
