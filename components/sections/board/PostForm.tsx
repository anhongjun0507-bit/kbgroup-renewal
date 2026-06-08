"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { PostFormState } from "@/app/notices/board/actions";

const INITIAL: PostFormState = { error: null, fieldErrors: {} };

/** 자유게시판 글 작성/수정 공용 폼. action으로 createPost/updatePost 주입. */
export function PostForm({
  action,
  postId,
  initialTitle = "",
  initialContent = "",
  submitLabel = "등록",
  cancelHref,
}: {
  action: (prev: PostFormState, fd: FormData) => Promise<PostFormState>;
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  submitLabel?: string;
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-6">
      {postId && <input type="hidden" name="id" value={postId} />}

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="post-title" className="eyebrow mb-2 block">
          제목
        </label>
        <input
          id="post-title"
          name="title"
          type="text"
          defaultValue={initialTitle}
          maxLength={200}
          placeholder="제목을 입력하세요"
          className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
        />
        {state.fieldErrors?.title && (
          <p className="mt-2 text-[12px] text-red-700">
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="post-content" className="eyebrow mb-2 block">
          내용
        </label>
        <textarea
          id="post-content"
          name="content"
          rows={14}
          defaultValue={initialContent}
          placeholder="내용을 입력하세요"
          className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[16px] leading-[1.8] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
        />
        {state.fieldErrors?.content && (
          <p className="mt-2 text-[12px] text-red-700">
            {state.fieldErrors.content}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
        <Link
          href={cancelHref}
          className="inline-flex min-h-12 items-center rounded-sm border border-line px-6 text-[14px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent-500 px-8 text-[15px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] disabled:opacity-50"
        >
          {isPending ? "처리 중..." : submitLabel}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
