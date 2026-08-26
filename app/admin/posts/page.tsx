import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { requireAdmin } from "@/lib/auth";
import { BOARD_ORDER, BOARD_CONFIGS, adminBoardPath } from "@/lib/boards";
import { applyOverride, getBoardCategories } from "@/lib/board-categories";

export const metadata: Metadata = {
  title: "관리자 · 소식 관리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPostsHubPage() {
  const { supabase } = await requireAdmin("/admin/posts");

  const types = BOARD_ORDER;
  /* 관리자 화면에도 「게시판 카테고리」에서 바꾼 이름이 그대로 보여야 한다. */
  const overrides = await getBoardCategories();
  const counts = await Promise.all(
    types.map((t) =>
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("board_type", t)
        .then((r) => r.count ?? 0),
    ),
  );
  const freeCount = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("board_type", "free")
    .then((r) => r.count ?? 0);

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="posts" />

        <div className="border-b border-line pb-8">
          <p className="eyebrow text-accent-deep">ADMIN · 관리자</p>
          <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-ink-strong md:text-[36px]">
            소식 관리
          </h1>
          <p className="mt-3 text-[14px] text-ink-muted">
            공지사항·갤러리·단지소식·자료실에 글을 올리고 수정·삭제할 수 있습니다.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {types.map((t, i) => {
            const config = applyOverride(BOARD_CONFIGS[t], overrides[t]);
            return (
              <li key={t}>
                <Link
                  href={adminBoardPath(t)}
                  className="group flex h-full items-center justify-between gap-4 rounded-md border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[0_10px_28px_rgba(11,26,51,0.08)]"
                >
                  <div>
                    <p className="font-display text-[19px] font-bold tracking-tight text-ink-strong">
                      {config.label}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      총{" "}
                      <span className="font-semibold text-ink-strong">
                        {counts[i]}
                      </span>
                      건
                      {config.attach &&
                        ` · ${config.attach.noun} 첨부 (최대 ${config.attach.max})`}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ink-strong">
                    관리
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}

          {/* 자유게시판 — 회원 게시판(공개 페이지에서 직접 수정·삭제) */}
          <li className="sm:col-span-2">
            <Link
              href="/notices/board"
              className="group flex items-center justify-between gap-4 rounded-md border border-dashed border-line bg-white/60 p-6 transition-colors hover:border-navy-700"
            >
              <div>
                <p className="font-display text-[19px] font-bold tracking-tight text-ink-strong">
                  자유게시판
                  <span className="ml-2 align-middle text-[11px] font-semibold text-ink-faint">
                    회원 게시판
                  </span>
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  총{" "}
                  <span className="font-semibold text-ink-strong">{freeCount}</span>
                  건 · 회원이 작성합니다. 글마다 공개 페이지에서 관리자가 직접 수정·삭제할 수
                  있습니다.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ink-strong">
                바로가기
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}
