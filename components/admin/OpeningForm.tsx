"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { JobOpening } from "@/lib/jobs";
import type { OpeningFormState } from "@/app/admin/openings/actions";

const INITIAL: OpeningFormState = { error: null, fieldErrors: {} };

export function OpeningForm({
  action,
  initial,
  submitLabel = "등록",
}: {
  action: (prev: OpeningFormState, fd: FormData) => Promise<OpeningFormState>;
  initial?: JobOpening;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-7">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Text
          name="title"
          label="직무명 *"
          defaultValue={initial?.title}
          placeholder="예) 관리소장"
          error={state.fieldErrors?.title}
        />
        <Text
          name="type"
          label="채용 형태"
          defaultValue={initial?.type ?? "수시채용"}
          placeholder="수시채용 · 상시채용 · 정규직 등"
        />
        <Text
          name="location"
          label="모집 지역"
          defaultValue={initial?.location}
          placeholder="예) 광주광역시 광산구"
        />
        <Text
          name="deadline"
          label="마감일 (비우면 상시채용)"
          type="date"
          defaultValue={initial?.deadline ?? ""}
        />
      </div>

      <Area
        name="summary"
        label="한 줄 요약"
        defaultValue={initial?.summary ?? ""}
        rows={3}
        placeholder="공고 상세 상단에 표시되는 소개 문구"
      />

      <Area
        name="responsibilities"
        label="주요 업무 (한 줄에 하나씩)"
        defaultValue={(initial?.responsibilities ?? []).join("\n")}
        rows={5}
        placeholder={"공동주택 시설·운영 전반 관리\n관리비 운영·예산 집행"}
      />
      <Area
        name="requirements"
        label="자격 요건 (한 줄에 하나씩)"
        defaultValue={(initial?.requirements ?? []).join("\n")}
        rows={5}
        placeholder={"공동주택·시설관리 경력자\n원활한 의사소통 능력"}
      />
      <Area
        name="preferred"
        label="우대 사항 (한 줄에 하나씩)"
        defaultValue={(initial?.preferred ?? []).join("\n")}
        rows={4}
        placeholder={"주택관리사(보) 자격 보유자\n인근 지역 거주자"}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Text
          name="applyEmail"
          label="지원 이메일"
          type="email"
          defaultValue={initial?.applyEmail ?? ""}
          placeholder="7971kb@naver.com"
        />
        <Text
          name="sortOrder"
          label="정렬 순서 (작을수록 위)"
          type="number"
          defaultValue={String(initial?.sortOrder ?? 0)}
        />
      </div>
      <Area
        name="applyMethod"
        label="지원 방법 안내"
        defaultValue={initial?.applyMethod ?? ""}
        rows={2}
        placeholder="이메일 접수 — 이력서·자기소개서를 채용 담당 이메일로 보내주세요."
      />

      {/* 채용 페이지 노출 토글 */}
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-bg-soft p-4">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={initial ? initial.isPublished : true}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent-500)]"
        />
        <span>
          <span className="block text-[14px] font-semibold text-ink-strong">
            채용 페이지에 노출
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-muted">
            켜면 채용 페이지(/careers)·공고 목록·상단 메뉴에 공개됩니다. 끄면
            비공개(관리자만 확인).
          </span>
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
        <Link
          href="/admin/openings"
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

function Text({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={`of-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={`of-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
      {error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}
    </div>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={`of-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <textarea
        id={`of-${name}`}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[15px] leading-[1.7] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
    </div>
  );
}
