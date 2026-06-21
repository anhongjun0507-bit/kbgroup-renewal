import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteAttachment } from "@/app/admin/posts/actions";
import { formatBytes, fileExtLabel, isImageMime, type BoardType } from "@/lib/boards";
import type { Attachment } from "@/lib/posts";

/**
 * 수정 화면의 기존 첨부 관리 (개별 삭제).
 * PostForm과 별도 <form>으로 둬 폼 중첩을 피한다.
 */
export function AttachmentManager({
  board,
  postId,
  attachments,
}: {
  board: BoardType;
  postId: string;
  attachments: Attachment[];
}) {
  if (attachments.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-line bg-bg-soft px-4 py-6 text-center text-[13px] text-ink-faint">
        첨부된 파일이 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {attachments.map((a) => (
        <li
          key={a.id}
          className="flex items-center gap-3 rounded-sm border border-line bg-white p-3"
        >
          {isImageMime(a.mimeType) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.url}
              alt={a.fileName}
              className="h-14 w-14 shrink-0 rounded-sm object-cover"
              loading="lazy"
            />
          ) : (
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-[11px] font-bold text-accent-300">
              {fileExtLabel(a.fileName)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink-strong">
              {a.fileName}
            </p>
            <p className="text-[12px] text-ink-faint">{formatBytes(a.fileSize)}</p>
          </div>
          <form action={deleteAttachment} className="shrink-0">
            <input type="hidden" name="attachmentId" value={a.id} />
            <input type="hidden" name="board" value={board} />
            <input type="hidden" name="postId" value={postId} />
            <ConfirmButton
              message="이 첨부를 삭제하시겠습니까?"
              className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-[12px] font-medium text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              삭제
            </ConfirmButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
