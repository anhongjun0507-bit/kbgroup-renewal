"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  adminBoardPath,
  formatBytes,
  resolveMime,
  extOf,
  type BoardConfig,
} from "@/lib/boards";
import {
  createPostRecord,
  updatePostRecord,
  finalizeAttachments,
  type AttachmentRecord,
} from "@/app/admin/posts/actions";

type FieldErrors = { title?: string; content?: string; files?: string };

/**
 * 소식 게시판 글 작성/수정 공용 폼 (관리자).
 * 파일은 브라우저에서 Supabase Storage로 직접 업로드(Vercel 함수 본문 제한 우회) 후
 * 메타데이터만 서버 액션으로 기록한다.
 */
export function PostForm({
  config,
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
  initialPinned = false,
  existingCount = 0,
  startOrder = 0,
  submitLabel = "등록",
}: {
  config: BoardConfig;
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialPinned?: boolean;
  existingCount?: number;
  startOrder?: number;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const createdId = useRef<string | null>(null);

  const attach = config.attach;
  const multiple = !!attach && attach.max > 1;
  const remaining = attach ? Math.max(0, attach.max - existingCount) : 0;
  const requiredFile = mode === "create" && !!attach?.requiredOnCreate;
  const canAddFiles = mode === "create" || !attach || remaining > 0;

  async function uploadAll(
    pid: string,
    files: File[],
  ): Promise<string | null> {
    if (!attach || files.length === 0) return null;
    const supabase = createClient();
    const records: AttachmentRecord[] = [];
    let order = mode === "create" ? 0 : startOrder;
    let i = 0;
    for (const f of files) {
      i += 1;
      setStatus(`파일 업로드 중... (${i}/${files.length})`);
      const mime = resolveMime(f);
      const ext = extOf(f.name) ?? "bin";
      const key = `${pid}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(attach.bucket)
        .upload(key, f, { contentType: mime, upsert: false });
      if (upErr) return `파일 업로드에 실패했습니다: ${upErr.message}`;
      records.push({
        path: key,
        name: f.name,
        size: f.size,
        mime,
        order: order++,
      });
    }
    setStatus("첨부 등록 중...");
    const fin = await finalizeAttachments({
      postId: pid,
      board: config.type,
      records,
    });
    return fin.ok ? null : (fin.error ?? "첨부 등록에 실패했습니다.");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setStatus(null);

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const content = String(fd.get("content") ?? "").trim();
    const isPinned = fd.get("isPinned") === "on";
    const files = (fd.getAll("files") as File[]).filter(
      (f) => f && typeof f === "object" && f.size > 0,
    );

    // 클라이언트 검증
    const fe: FieldErrors = {};
    if (!title) fe.title = "제목을 입력해주세요.";
    if (config.contentRequired && !content) fe.content = "내용을 입력해주세요.";
    if (attach) {
      if (requiredFile && files.length === 0) {
        fe.files = `${attach.noun} 파일을 1개 이상 첨부해주세요.`;
      }
      const limit = mode === "create" ? attach.max : remaining;
      if (files.length > limit) {
        fe.files =
          mode === "create"
            ? `${attach.noun}는 최대 ${attach.max}개까지 첨부할 수 있습니다.`
            : `최대 ${remaining}개 더 추가할 수 있습니다 (현재 ${existingCount}/${attach.max}). 기존 첨부를 삭제한 뒤 추가해주세요.`;
      }
      for (const f of files) {
        if (f.size > attach.maxBytes) {
          fe.files = `"${f.name}" — 파일은 최대 ${formatBytes(attach.maxBytes)}까지 업로드할 수 있습니다.`;
          break;
        }
        if (!attach.mimes.includes(resolveMime(f))) {
          fe.files = `"${f.name}" — 허용되지 않는 파일 형식입니다.`;
          break;
        }
      }
    }
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      return;
    }

    startTransition(async () => {
      // 1) 본문 레코드 생성/수정 (재시도 시 중복 생성 방지)
      let pid: string;
      if (mode === "edit") {
        const r = await updatePostRecord({
          id: postId!,
          board: config.type,
          title,
          content,
          isPinned,
        });
        if (!r.ok) {
          setError(r.error ?? null);
          setFieldErrors(r.fieldErrors ?? {});
          return;
        }
        pid = postId!;
      } else if (createdId.current) {
        const r = await updatePostRecord({
          id: createdId.current,
          board: config.type,
          title,
          content,
          isPinned,
        });
        if (!r.ok) {
          setError(r.error ?? null);
          setFieldErrors(r.fieldErrors ?? {});
          return;
        }
        pid = createdId.current;
      } else {
        const r = await createPostRecord({
          board: config.type,
          title,
          content,
          isPinned,
        });
        if (!r.ok) {
          setError(r.error ?? null);
          setFieldErrors(r.fieldErrors ?? {});
          return;
        }
        pid = r.postId!;
        createdId.current = pid;
      }

      // 2) 파일 직접 업로드 + 메타 기록
      const upErr = await uploadAll(pid, files);
      if (upErr) {
        setStatus(null);
        setError(
          `${upErr} 본문은 저장되었습니다 — 수정 화면에서 첨부를 다시 시도할 수 있습니다.`,
        );
        return;
      }

      setStatus(null);
      router.push(adminBoardPath(config.type));
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {error}
        </p>
      )}

      {/* 제목 */}
      <div>
        <label htmlFor="post-title" className="eyebrow mb-2 block">
          제목 *
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
        {fieldErrors.title && (
          <p className="mt-2 text-[12px] text-red-700">{fieldErrors.title}</p>
        )}
      </div>

      {/* 본문 */}
      <div>
        <label htmlFor="post-content" className="eyebrow mb-2 block">
          {config.contentLabel}
          {config.contentRequired ? " *" : ""}
        </label>
        <textarea
          id="post-content"
          name="content"
          rows={config.layout === "list" ? 12 : 5}
          defaultValue={initialContent}
          placeholder={
            config.layout === "gallery"
              ? "사진 설명을 입력하세요 (선택)"
              : config.layout === "resources"
                ? "자료 설명을 입력하세요 (선택)"
                : "내용을 입력하세요"
          }
          className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[16px] leading-[1.8] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
        />
        {fieldErrors.content && (
          <p className="mt-2 text-[12px] text-red-700">{fieldErrors.content}</p>
        )}
      </div>

      {/* 첨부 */}
      {attach && (
        <div>
          <label htmlFor="post-files" className="eyebrow mb-2 block">
            {attach.noun} 첨부
            {requiredFile ? " *" : mode === "edit" ? " (추가)" : " (선택)"}
          </label>
          {canAddFiles ? (
            <>
              <input
                id="post-files"
                name="files"
                type="file"
                accept={attach.accept}
                multiple={multiple}
                className="block w-full cursor-pointer rounded-sm border border-dashed border-line bg-bg-soft px-4 py-3 text-[14px] text-ink-muted file:mr-4 file:cursor-pointer file:rounded-sm file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white hover:file:bg-navy-800"
              />
              <p className="mt-2 text-[12px] text-ink-faint">
                {multiple
                  ? `${mode === "edit" ? `최대 ${remaining}개 더 추가` : `최대 ${attach.max}개`}, 파일당 ${formatBytes(attach.maxBytes)} 이내 · ${attach.noun}`
                  : `1개, ${formatBytes(attach.maxBytes)} 이내 · ${attach.noun}`}
              </p>
            </>
          ) : (
            <p className="rounded-sm border border-dashed border-line bg-bg-soft px-4 py-3 text-[13px] text-ink-faint">
              첨부가 최대치({existingCount}/{attach.max})입니다. 새 파일을 올리려면 위에서
              기존 첨부를 먼저 삭제해주세요.
            </p>
          )}
          {fieldErrors.files && (
            <p className="mt-2 text-[12px] text-red-700">{fieldErrors.files}</p>
          )}
        </div>
      )}

      {/* 상단 고정 */}
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-bg-soft p-4">
        <input
          type="checkbox"
          name="isPinned"
          defaultChecked={initialPinned}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent-500)]"
        />
        <span>
          <span className="block text-[14px] font-semibold text-ink-strong">
            상단 고정
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-muted">
            켜면 목록 최상단에 &ldquo;공지&rdquo;로 표시됩니다.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
        {status && (
          <span className="mr-auto text-[13px] font-medium text-navy-700">
            {status}
          </span>
        )}
        <Link
          href={adminBoardPath(config.type)}
          className="inline-flex min-h-12 items-center rounded-sm border border-line px-6 text-[14px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent-500 px-8 text-[15px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] disabled:opacity-50"
        >
          {isPending ? "저장 중..." : submitLabel}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
