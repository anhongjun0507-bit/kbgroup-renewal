"use client";

import { useEffect, useState } from "react";

/* Phase 14-N (2026-05-21) — mailto 보강 카드.
   클라 PC 메일 클라이언트 미설정 환경에서도 이메일 주소를 클립보드로 확보 가능.
   클릭 시: navigator.clipboard.writeText + mailto href 동시 호출 + 토스트 안내. */

type Props = {
  email: string;
  subject?: string;
  label?: string;
  className?: string;
};

export function MailtoCard({
  email,
  subject,
  label = "이메일 문의",
  className,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email).then(
        () => setToast(`이메일 주소(${email})가 복사되었습니다`),
        () => setToast(`이메일 주소: ${email}`),
      );
    } else {
      setToast(`이메일 주소: ${email}`);
    }
  };

  const href = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className={
          className ??
          "flex items-center justify-between rounded-md border border-line bg-white px-6 py-5 transition-colors duration-200 hover:border-ink-strong"
        }
      >
        <span>
          <span className="block text-[12px] uppercase tracking-[0.12em] text-ink-faint">
            {label}
          </span>
          <span className="mt-1 block font-display text-[18px] font-bold text-ink-strong">
            {email}
          </span>
        </span>
        <span aria-hidden="true" className="text-ink-faint">
          →
        </span>
      </a>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-8 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto rounded-sm bg-navy-900 px-5 py-3 text-[14px] font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
