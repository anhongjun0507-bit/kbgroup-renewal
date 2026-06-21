import { formatBytes, fileExtLabel, isImageMime } from "@/lib/boards";
import type { Attachment } from "@/lib/posts";

/** 상세 페이지 첨부 표시 — 이미지는 인라인, 문서는 다운로드 카드. */
export function AttachmentView({
  attachments,
  imageLayout = "stack",
}: {
  attachments: Attachment[];
  /** stack=세로 1열(공지/단지소식), grid=격자(갤러리) */
  imageLayout?: "stack" | "grid";
}) {
  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => isImageMime(a.mimeType));
  const docs = attachments.filter((a) => !isImageMime(a.mimeType));

  return (
    <div className="space-y-8">
      {images.length > 0 && (
        <div
          className={
            imageLayout === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
              : "space-y-5"
          }
        >
          {images.map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={a.id}
              src={a.url}
              alt={a.fileName}
              loading="lazy"
              className={
                "w-full rounded-md border border-line bg-bg-soft " +
                (imageLayout === "grid"
                  ? "aspect-[4/3] object-cover"
                  : "object-contain")
              }
            />
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <ul className="space-y-3">
          {docs.map((a) => (
            <li key={a.id}>
              <a
                href={a.downloadUrl}
                className="group flex items-center gap-4 rounded-md border border-line bg-white p-4 transition-colors hover:border-navy-700 hover:bg-bg-soft"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-[11px] font-bold text-accent-300">
                  {fileExtLabel(a.fileName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink-strong">
                    {a.fileName}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    {formatBytes(a.fileSize)}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-ink-strong">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  다운로드
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
