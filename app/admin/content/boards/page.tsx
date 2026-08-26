import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { BoardCategoryForm, type BoardRow } from "@/components/admin/BoardCategoryForm";
import { requireAdmin } from "@/lib/auth";
import { BOARD_CONFIGS, BOARD_ORDER } from "@/lib/boards";
import { BOARD_CATEGORIES_KEY, type BoardCategoryMap } from "@/lib/board-categories";
import { saveBoardCategories } from "./actions";

export const metadata: Metadata = {
  title: "관리자 · 게시판 카테고리 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 게시판 카테고리 관리 (PLAN B / DAY 9, ITEM 04).
 *
 * 관리자 화면은 캐시된 오버레이가 아니라 DB 를 직접 읽는다 — 저장 직후 최신 값이 보여야 한다.
 * (DAY 8 「페이지 공개」 화면과 같은 규약)
 */
export default async function AdminBoardsPage() {
  const { supabase } = await requireAdmin("/admin/content/boards");

  const [{ data: settingRow }, { data: posts }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", BOARD_CATEGORIES_KEY)
      .maybeSingle(),
    supabase.from("posts").select("board_type, is_pinned"),
  ]);

  const overrides = (settingRow?.value ?? {}) as BoardCategoryMap;

  const counts: Record<string, { total: number; pinned: number }> = {};
  for (const p of posts ?? []) {
    const c = (counts[p.board_type] ??= { total: 0, pinned: 0 });
    c.total += 1;
    if (p.is_pinned) c.pinned += 1;
  }

  const rows: BoardRow[] = BOARD_ORDER.map((type) => {
    const base = BOARD_CONFIGS[type];
    return {
      type,
      defaultLabel: base.label,
      defaultSubtitle: base.subtitle,
      label: overrides[type]?.label ?? "",
      subtitle: overrides[type]?.subtitle ?? "",
      postCount: counts[type]?.total ?? 0,
      pinnedCount: counts[type]?.pinned ?? 0,
      listPath: base.listPath,
    };
  });

  return (
    <main className="py-10">
      <Container>
        <AdminTabs active="boards" />

        <header className="mb-8">
          <h1 className="text-[24px] font-bold text-ink-strong">게시판 카테고리</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-ink-muted">
            게시판 4종의 <strong className="text-ink-strong">이름</strong>과{" "}
            <strong className="text-ink-strong">설명 문구</strong>를 바꿉니다. 바꾼 이름은
            게시판 페이지 제목·목록·상세 안내와 이 관리자 화면에 함께 반영됩니다. 기존 글은
            그대로 유지됩니다.
          </p>
        </header>

        <div className="mb-6 rounded-md border border-line bg-bg-soft px-5 py-4 text-[13px] leading-[1.8] text-ink-muted">
          <p>
            <strong className="text-ink-strong">게시판 추가·삭제는 지원하지 않습니다.</strong>{" "}
            게시판 종류는 글 데이터와 첨부 정책에 묶여 있어, 늘리거나 지우면 기존 글이 함께
            영향을 받습니다.
          </p>
          <p className="mt-1.5">
            상단 메뉴 「소식」 안에 보이는 게시판 순서와 표시·숨김은{" "}
            <Link
              href="/admin/content/nav"
              className="font-semibold text-ink-strong underline underline-offset-4"
            >
              메뉴 구성
            </Link>
            에서 관리합니다. 공지 상단 고정은{" "}
            <Link
              href="/admin/posts"
              className="font-semibold text-ink-strong underline underline-offset-4"
            >
              소식 관리
            </Link>
            의 글 목록에서 「상단 고정」 버튼으로 켭니다.
          </p>
        </div>

        <BoardCategoryForm rows={rows} action={saveBoardCategories} />
      </Container>
    </main>
  );
}
