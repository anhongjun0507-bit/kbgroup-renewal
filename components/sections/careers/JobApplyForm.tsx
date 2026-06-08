"use client";

import { useActionState } from "react";
import {
  submitApplication,
  type ApplyState,
} from "@/app/careers/openings/[id]/actions";

const INITIAL: ApplyState = { ok: false, error: null, fieldErrors: {} };

export function JobApplyForm({
  openingId,
  openingTitle,
}: {
  openingId: string;
  openingTitle: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitApplication,
    INITIAL,
  );

  if (state.ok) {
    return (
      <div className="rounded-md border border-success/30 bg-success/5 p-8 text-center md:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.5l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-5 font-display text-[20px] font-bold tracking-tight text-ink-strong">
          지원이 정상 접수되었습니다
        </p>
        <p className="mt-3 text-[14px] leading-[1.7] text-ink-muted">
          담당자 검토 후 기재해주신 연락처로 개별 연락드리겠습니다. 감사합니다.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="openingId" value={openingId} />
      <input type="hidden" name="openingTitle" value={openingTitle} />

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          name="name"
          label="이름 *"
          placeholder="홍길동"
          autoComplete="name"
          error={state.fieldErrors?.name}
        />
        <Field
          name="phone"
          label="연락처 *"
          type="tel"
          placeholder="010-0000-0000"
          autoComplete="tel"
          error={state.fieldErrors?.phone}
        />
      </div>

      <Field
        name="email"
        label="이메일 (선택)"
        type="email"
        placeholder="example@email.com"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />

      <div>
        <label htmlFor="apply-message" className="eyebrow mb-2 block">
          지원/문의 내용 (선택)
        </label>
        <textarea
          id="apply-message"
          name="message"
          rows={5}
          placeholder="경력 요약, 보유 자격증, 문의 사항 등을 자유롭게 적어주세요."
          className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none md:text-[15px]"
        />
      </div>

      <div className="flex flex-col items-start gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-ink-faint">
          ※ 제출하신 정보는 채용 검토 목적에 한해 이용되며, 검토 후 파기됩니다.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent-500 px-8 py-3.5 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] disabled:opacity-50"
        >
          {isPending ? "접수 중..." : "지원서 제출"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={`apply-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={`apply-${name}`}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none md:text-[15px]"
      />
      {error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}
    </div>
  );
}
