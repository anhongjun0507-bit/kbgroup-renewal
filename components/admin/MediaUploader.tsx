"use client";

import { useCallback, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 이미지·영상 업로더 (PLAN B / DAY 6-1).
 *
 * **브라우저에서 Storage 로 직접 올린다.** Server Action 을 경유하지 않는 이유:
 *   Vercel 서버리스 함수는 요청 본문이 4.5MB 로 제한된다. 파일을 Server Action 에 실어 보내면
 *   `serverActions.bodySizeLimit` 을 아무리 올려도 프로덕션에서 4.5MB 초과 업로드가 막힌다.
 *   히어로 영상은 이미 20MB(버킷 상한 50MB)라 이 경로로는 원천적으로 불가능하다.
 *   Storage 쓰기 RLS 는 `is_admin()` 로 이미 잠겨 있어(20260824000007) 보안 등가다.
 *
 * **덮어쓰기하지 않는다.** 항상 새 키(`{scope}/{entity-id}/{timestamp}-{slug}.{ext}`)로 올리고,
 * 업로드가 **성공한 뒤에만** 폼의 포인터(hidden input)를 교체한다.
 * 따라서 롤백은 포인터를 되돌리는 것으로 끝나고, 실패한 업로드는 기존 값을 건드리지 않는다.
 *
 * **삭제는 포인터만 비운다.** Storage 객체는 지우지 않는다 — 지우면 `content_revisions`
 * 스냅샷으로 되돌려도 이미지가 404 가 되어 롤백이 반쪽이 된다.
 */

const BUCKETS = {
  "site-images": {
    limit: 10 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    label: "jpeg·png·webp·avif, 10MB 이하",
  },
  "site-videos": {
    limit: 50 * 1024 * 1024,
    mimes: ["video/mp4", "video/webm"],
    label: "mp4·webm, 50MB 이하",
  },
} as const;

type Bucket = keyof typeof BUCKETS;

/** image = 사진만 · video = 영상만 · both = 파일 종류로 버킷을 고른다(히어로 슬라이드). */
export type MediaAccept = "image" | "video" | "both";

function bucketFor(accept: MediaAccept, file: File): Bucket {
  if (accept === "video") return "site-videos";
  if (accept === "image") return "site-images";
  return file.type.startsWith("video/") ? "site-videos" : "site-images";
}

function acceptAttr(accept: MediaAccept): string {
  const img = BUCKETS["site-images"].mimes.join(",");
  const vid = BUCKETS["site-videos"].mimes.join(",");
  if (accept === "image") return img;
  if (accept === "video") return vid;
  return `${img},${vid}`;
}

/** Storage 키는 ASCII 로만 만든다 — 한글 원본 파일명을 그대로 쓰면 키가 깨진다. */
function asciiSlug(fileName: string): string {
  const base = fileName.replace(/\.[^.]*$/, "");
  const s = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "file";
}

function extOf(file: File, bucket: Bucket): string {
  const raw = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (raw) return raw;
  return bucket === "site-videos" ? "mp4" : "jpg";
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url);
}

export function MediaUploader({
  name,
  defaultValue = "",
  prefix,
  accept = "image",
  label,
  hint,
  onChange,
}: {
  /** 포인터를 실어 보낼 hidden input 의 name. 서버는 지금까지처럼 문자열 하나만 읽는다. */
  name: string;
  defaultValue?: string;
  /** `{scope}/{entity-id}` — 업로드 경로 접두사. */
  prefix: string;
  accept?: MediaAccept;
  label?: string;
  hint?: string;
  /** 부모가 값을 추적해야 할 때 (히어로 슬라이드 미리보기 등). */
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const inputId = `mu-${uid}`;

  const apply = useCallback(
    (next: string) => {
      setValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const upload = useCallback(
    async (file: File) => {
      const bucket = bucketFor(accept, file);
      const spec = BUCKETS[bucket];

      if (!(spec.mimes as readonly string[]).includes(file.type)) {
        setError(`지원하지 않는 형식입니다 (${file.type || "알 수 없음"}). ${spec.label}`);
        return;
      }
      if (file.size > spec.limit) {
        setError(
          `파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). ${spec.label}`,
        );
        return;
      }

      setBusy(true);
      setError(null);
      setJustUploaded(false);
      try {
        const supabase = createClient();
        const path = `${prefix}/${Date.now()}-${asciiSlug(file.name)}.${extOf(file, bucket)}`;
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: file.type, upsert: false });

        // 업로드 실패면 포인터를 건드리지 않는다 — 기존 이미지가 그대로 남는다.
        if (upErr) {
          setError(`업로드 실패: ${upErr.message}`);
          return;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        apply(data.publicUrl);
        setJustUploaded(true);
      } catch (e) {
        setError(`업로드 실패: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [accept, apply, prefix],
  );

  const video = isVideoUrl(value);

  return (
    <div data-media-uploader={name}>
      {label && (
        <label htmlFor={inputId} className="eyebrow mb-2 block">
          {label}
        </label>
      )}

      {/* 서버가 읽는 값. 업로드 성공 후에만 바뀐다. */}
      <input type="hidden" name={name} value={value} data-media-value={name} />

      <div className="flex flex-col gap-3 rounded-sm border border-line bg-bg-soft p-3 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {value ? (
            video ? (
              <video
                src={value}
                muted
                playsInline
                preload="metadata"
                className="h-20 w-32 rounded-sm border border-line bg-black object-cover"
              />
            ) : (
              /* next/image 는 도메인 등록이 필요하고 관리자 미리보기는 최적화 이득이 없다. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt=""
                className="h-20 w-32 rounded-sm border border-line bg-white object-contain p-1"
              />
            )
          ) : (
            <div className="flex h-20 w-32 items-center justify-center rounded-sm border border-dashed border-line bg-white text-[12px] text-ink-faint">
              없음
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept={acceptAttr(accept)}
            disabled={busy}
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) void upload(f);
            }}
            className="block w-full text-[13px] text-ink-muted file:mr-3 file:rounded-sm file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white disabled:opacity-50"
          />

          <p className="mt-2 break-all font-mono-num text-[12px] text-ink-muted">
            {value || "— (비어 있음)"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {value && (
              <button
                type="button"
                onClick={() => {
                  apply("");
                  setJustUploaded(false);
                }}
                className="btn-reset inline-flex h-8 items-center rounded-sm border border-red-300 bg-white px-3 text-[12px] font-semibold text-red-700 hover:bg-red-50"
              >
                삭제
              </button>
            )}
            {busy && <span className="text-[12px] text-ink-muted">업로드 중…</span>}
            {justUploaded && !busy && (
              /* role="status" 는 쓰지 않는다 — 폼 셸의 저장 성공 배너가 이미 그 역할이고,
                 검증 스크립트가 `[role=status]` 로 저장 완료를 기다린다. 여기서 겹치면
                 업로드 직후를 저장 완료로 오인한다. */
              <span
                aria-live="polite"
                data-upload-status
                className="text-[12px] font-semibold text-emerald-700"
              >
                업로드 완료 — 저장을 눌러야 사이트에 반영됩니다.
              </span>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-2 text-[12px] font-semibold text-red-700">
              {error}
            </p>
          )}

          <p className="mt-2 text-[12px] text-ink-faint">
            {accept === "video"
              ? BUCKETS["site-videos"].label
              : accept === "image"
                ? BUCKETS["site-images"].label
                : `사진 ${BUCKETS["site-images"].label} · 영상 ${BUCKETS["site-videos"].label}`}
            {" · "}
            기존 파일을 덮어쓰지 않고 새로 올린 뒤 연결만 바꿉니다. 삭제는 연결만 끊고 파일은 남깁니다.
          </p>
          {hint && <p className="mt-1 text-[12px] text-ink-faint">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
