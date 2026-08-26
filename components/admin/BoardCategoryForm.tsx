"use client";

import { useActionState } from "react";
import type { BoardsFormState } from "@/app/admin/content/boards/actions";

/**
 * 게시판 카테고리 편집 폼 (PLAN B / DAY 9, ITEM 04).
 *
 * 4개 게시판을 한 폼에서 저장한다 — 편집 항목이 이름·설명 둘뿐이라 게시판마다 폼을 쪼갤
 * 이유가 없고, 오버레이 전체를 `site_settings` 한 행에 담기 때문에 저장도 한 번이다.
 * 입력값이 코드 기본값과 같으면 서버가 오버레이에서 빼므로 "비워두면 기본값"이 곧 초기화다.
 */

export type BoardRow = {
  type: string;
  /** 코드 기본값 (placeholder 로 보여주는 값) */
  defaultLabel: string;
  defaultSubtitle: string;
  /** 현재 저장된 오버레이 값 (없으면 빈 문자열) */
  label: string;
  subtitle: string;
  postCount: number;
  pinnedCount: number;
  listPath: string;
};

const INITIAL: BoardsFormState = { ok: null, error: null };

export function BoardCategoryForm({
  rows,
  action,
}: {
  rows: BoardRow[];
  action: (prev: BoardsFormState, fd: FormData) => Promise<BoardsFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-800"
        >
          {state.error}
        </p>
      )}
      {state.ok && (
        <p
          role="status"
          className="rounded-sm border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900"
        >
          {state.ok}
        </p>
      )}

      <ul className="space-y-4">
        {rows.map((b) => (
          <li
            key={b.type}
            data-board={b.type}
            className="rounded-md border border-line bg-white p-5 md:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <p className="font-display text-[17px] font-bold tracking-tight text-ink-strong">
                {b.label || b.defaultLabel}
                <span className="font-mono-num ml-2 text-[12px] font-normal text-ink-faint">
                  {b.listPath}
                </span>
              </p>
              <p className="text-[13px] text-ink-muted">
                글 {b.postCount}건
                {b.pinnedCount > 0 && ` · 상단 고정 ${b.pinnedCount}건`}
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="block text-[13px] font-semibold text-ink-strong">
                  게시판 이름
                </span>
                <input
                  name={`${b.type}_label`}
                  defaultValue={b.label}
                  placeholder={b.defaultLabel}
                  maxLength={40}
                  className="mt-1.5 h-11 w-full rounded-sm border border-line bg-white px-3 text-[14px] text-ink-strong outline-none focus:border-navy-700"
                />
              </label>
              <label className="block">
                <span className="block text-[13px] font-semibold text-ink-strong">
                  설명 문구
                </span>
                <input
                  name={`${b.type}_subtitle`}
                  defaultValue={b.subtitle}
                  placeholder={b.defaultSubtitle}
                  className="mt-1.5 h-11 w-full rounded-sm border border-line bg-white px-3 text-[14px] text-ink-strong outline-none focus:border-navy-700"
                />
              </label>
            </div>
            <p className="mt-2 text-[12px] text-ink-faint">
              비워 두면 기본값(회색 글씨)이 그대로 표시됩니다.
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center rounded-sm bg-navy-900 px-6 text-[14px] font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {isPending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
