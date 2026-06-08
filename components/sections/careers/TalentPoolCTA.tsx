"use client";

import { useEffect, useState } from "react";

/* 인재 풀 등록 모달 + 채용 이메일 문의 (클라이언트 island).
   Phase 14-N 패턴 계승 — 클립보드 복사 fallback + 토스트.
   서버 컴포넌트(CareersOpenings / openings 페이지)에서 재사용. */

export function TalentPoolCTA({
  email,
  compact = false,
}: {
  email: string;
  compact?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleEmailClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email).then(
        () => setToast(`이메일 주소(${email})가 복사되었습니다`),
        () => setToast(`이메일 주소: ${email}`),
      );
    } else {
      setToast(`이메일 주소: ${email}`);
    }
  };

  return (
    <>
      <div
        className={
          compact
            ? "flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            : "flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3"
        }
      >
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={
            compact
              ? "inline-flex h-12 items-center gap-2 rounded-sm border border-ink-strong px-6 text-[14px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
              : "inline-flex h-14 items-center gap-2 rounded-sm bg-accent-500 px-8 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
          }
        >
          인재 풀 등록하기
          <span aria-hidden="true">→</span>
        </button>
        <a
          href={`mailto:${email}`}
          onClick={handleEmailClick}
          className={
            compact
              ? "inline-flex h-12 items-center gap-2 rounded-sm px-6 text-[14px] font-semibold text-ink-muted underline-offset-4 transition-colors hover:text-ink-strong hover:underline"
              : "inline-flex h-14 items-center gap-2 rounded-sm border border-ink-strong px-8 text-base font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
          }
        >
          이메일로 직접 문의
        </a>
      </div>

      {!compact && (
        <p className="mt-6 text-center font-mono-num text-[13px] text-ink-muted">
          채용 문의:{" "}
          <span className="font-semibold text-ink-strong">{email}</span>
        </p>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4"
        >
          <div className="pointer-events-auto rounded-sm bg-navy-900 px-5 py-3 text-[14px] font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {modalOpen && (
        <TalentPoolModal email={email} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

function TalentPoolModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const role = String(fd.get("role") ?? "");
    const summary = String(fd.get("summary") ?? "");

    const subject = `[케이비개발] 인재 풀 등록 — ${name} (${role})`;
    const body = [
      `■ 이름: ${name}`,
      `■ 연락처: ${phone}`,
      `■ 희망 직무: ${role}`,
      "",
      "■ 경력 요약",
      summary,
      "",
      "※ 이력서 파일은 본 메일에 첨부해 주세요.",
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="인재 풀 등록"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-strong transition-colors hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        <p className="eyebrow">TALENT POOL</p>
        <h3 className="mt-4 font-display text-[24px] font-bold tracking-tight text-ink-strong">
          인재 풀 등록
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          기본 정보와 경력 요약을 남겨주시면, 적합한 포지션이 열릴 때 먼저
          연락드립니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field id="tp-name" name="name" label="이름 *" placeholder="홍길동" />
          <Field
            id="tp-phone"
            name="phone"
            type="tel"
            label="연락처 *"
            placeholder="010-0000-0000"
          />
          <Field
            id="tp-role"
            name="role"
            label="희망 직무 *"
            placeholder="예) 시설 관리소장 / 경비반장"
          />
          <div>
            <label htmlFor="tp-summary" className="eyebrow mb-2 block">
              경력 요약 *
            </label>
            <textarea
              id="tp-summary"
              name="summary"
              required
              rows={4}
              className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none md:text-[15px]"
              placeholder="근무 경력, 보유 자격증, 강점 등을 자유롭게 적어주세요."
            />
          </div>

          <div className="flex flex-col items-start gap-3 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] text-ink-faint">
              ※ 전송 시 메일 클라이언트가 열리며, 이력서 파일은 직접 첨부하시면
              됩니다.
            </p>
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
            >
              메일 작성 시작
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {submitted && (
            <p
              role="status"
              className="rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-[13px] text-success"
            >
              메일 클라이언트가 열렸습니다. 발송 버튼을 눌러주세요.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none md:text-[15px]"
      />
    </div>
  );
}
