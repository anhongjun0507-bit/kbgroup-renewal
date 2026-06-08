"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addComment, deleteComment } from "@/app/notices/board/actions";

export type CommentRow = {
  id: string;
  parent_id: string | null;
  author_id: string | null;
  author_name: string | null;
  content: string;
  created_at: string;
};

type Viewer = { userId: string | null; isAdmin: boolean };

function formatDateTime(iso: string): string {
  return new Date(iso)
    .toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\.\s/g, ".");
}

export function Comments({
  postId,
  comments,
  viewer,
}: {
  postId: string;
  comments: CommentRow[];
  viewer: Viewer;
}) {
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, CommentRow[]>();
  for (const c of comments) {
    if (c.parent_id) {
      const arr = repliesByParent.get(c.parent_id) ?? [];
      arr.push(c);
      repliesByParent.set(c.parent_id, arr);
    }
  }

  return (
    <section aria-label="댓글" className="mt-14 border-t border-line pt-10">
      <h2 className="font-display text-[20px] font-bold tracking-tight text-ink-strong">
        댓글{" "}
        <span className="font-mono-num text-accent-deep">{comments.length}</span>
      </h2>

      {/* 댓글 작성 폼 */}
      <div className="mt-6">
        <CommentForm postId={postId} parentId={null} loggedIn={!!viewer.userId} />
      </div>

      {/* 목록 */}
      {topLevel.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {topLevel.map((c) => {
            const replies = repliesByParent.get(c.id) ?? [];
            return (
              <li key={c.id}>
                <CommentItem comment={c} postId={postId} viewer={viewer} />
                {replies.length > 0 && (
                  <ul className="mt-4 space-y-4 border-l-2 border-line pl-4 sm:pl-6">
                    {replies.map((r) => (
                      <li key={r.id}>
                        <CommentItem
                          comment={r}
                          postId={postId}
                          viewer={viewer}
                          isReply
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 rounded-md border border-line bg-gray-50 px-5 py-8 text-center text-[14px] text-ink-muted">
          첫 댓글을 남겨보세요.
        </p>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  postId,
  viewer,
  isReply = false,
}: {
  comment: CommentRow;
  postId: string;
  viewer: Viewer;
  isReply?: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const canManage =
    !!viewer.userId &&
    (viewer.userId === comment.author_id || viewer.isAdmin);

  function remove() {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteComment(comment.id, postId);
      router.refresh();
    });
  }

  return (
    <div className={isPending ? "opacity-50" : ""}>
      <div className="flex items-center gap-2">
        {isReply && (
          <span aria-hidden="true" className="text-ink-faint">
            ↳
          </span>
        )}
        <span
          aria-hidden="true"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700"
        >
          {(comment.author_name ?? "회").charAt(0)}
        </span>
        <span className="text-[14px] font-semibold text-ink-strong">
          {comment.author_name ?? "회원"}
        </span>
        <span className="font-mono-num text-[12px] text-ink-faint">
          {formatDateTime(comment.created_at)}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap pl-9 text-[15px] leading-[1.7] text-ink-muted">
        {comment.content}
      </p>

      <div className="mt-2 flex items-center gap-3 pl-9 text-[12px] font-semibold">
        {!isReply && viewer.userId && (
          <button
            type="button"
            onClick={() => setShowReply((v) => !v)}
            className="text-ink-muted transition-colors hover:text-navy-700"
          >
            답글
          </button>
        )}
        {canManage && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="text-ink-faint transition-colors hover:text-red-700 disabled:opacity-50"
          >
            삭제
          </button>
        )}
      </div>

      {showReply && (
        <div className="mt-3 pl-9">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            loggedIn={!!viewer.userId}
            placeholder="답글을 입력하세요"
            onDone={() => setShowReply(false)}
          />
        </div>
      )}
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  loggedIn,
  placeholder = "댓글을 입력하세요",
  onDone,
}: {
  postId: string;
  parentId: string | null;
  loggedIn: boolean;
  placeholder?: string;
  onDone?: () => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!loggedIn) {
    return (
      <p className="rounded-md border border-line bg-gray-50 px-5 py-4 text-[14px] text-ink-muted">
        댓글을 작성하려면{" "}
        <Link
          href={`/login?next=/notices/board/${postId}`}
          className="font-semibold text-navy-700 underline-offset-4 hover:underline"
        >
          로그인
        </Link>
        이 필요합니다.
      </p>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) {
      setError("내용을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      const res = await addComment(postId, parentId, text);
      if (!res.ok) {
        setError(res.error ?? "오류가 발생했습니다.");
        return;
      }
      setContent("");
      setError(null);
      onDone?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        maxLength={2000}
        placeholder={placeholder}
        className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[15px] leading-[1.7] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
      {error && <p className="text-[12px] text-red-700">{error}</p>}
      <div className="flex items-center justify-end gap-2">
        {parentId && (
          <button
            type="button"
            onClick={onDone}
            className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-[13px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-navy-900 px-5 text-[13px] font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-50"
        >
          {isPending ? "등록 중..." : parentId ? "답글 등록" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
