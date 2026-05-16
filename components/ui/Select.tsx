"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* Phase 10 P1-08 — 커스텀 Select 컴포넌트
   네이티브 <select> 대신 일관 UI. 키보드 접근성: Enter/Space로 열기, Esc로 닫기 */

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  name: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  error?: boolean;
  id?: string;
  className?: string;
  onChange?: (value: string) => void;
  "aria-labelledby"?: string;
};

export function Select({
  name,
  options,
  placeholder = "선택해 주세요",
  value: controlledValue,
  defaultValue = "",
  required,
  error,
  id,
  className,
  onChange,
  ...aria
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(controlledValue ?? defaultValue);
  const [focusIdx, setFocusIdx] = useState(-1);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (controlledValue !== undefined) setValue(controlledValue);
  }, [controlledValue]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(v: string) {
    setValue(v);
    onChange?.(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusIdx(Math.max(0, options.findIndex((o) => o.value === value)));
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusIdx >= 0) pick(options[focusIdx].value);
    }
  }

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* 숨겨진 native select — form submission용 */}
      <select
        name={name}
        required={required}
        defaultValue={value}
        value={value}
        onChange={() => {
          /* 컨트롤은 trigger에서 처리 */
        }}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error || undefined}
        {...aria}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={cn(
          /* Phase 12 업그레이드 #5 — 모바일 16px (iOS 줌 방지) */
          "flex h-12 w-full items-center justify-between rounded-md border bg-white px-4 text-left text-[16px] transition-all duration-200 md:text-[15px]",
          "focus:outline-none focus:ring-2",
          current ? "text-ink-strong" : "text-[#9AA3B2]",
          error
            ? "border-danger focus:border-danger focus:ring-danger/30"
            : "border-line focus:border-accent-500 focus:ring-accent-500/30",
        )}
      >
        <span>{current?.label ?? placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className={cn(
            "shrink-0 text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-line bg-white py-1 shadow-[0_12px_32px_rgba(11,26,51,0.12)]"
        >
          {options.map((o, idx) => {
            const selected = o.value === value;
            const focused = idx === focusIdx;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o.value);
                }}
                onMouseEnter={() => setFocusIdx(idx)}
                className={cn(
                  "cursor-pointer px-4 py-2.5 text-[15px] transition-colors duration-150",
                  selected
                    ? "bg-accent-500 text-navy-900"
                    : focused
                      ? "bg-gray-50 text-ink-strong"
                      : "text-ink-muted hover:bg-gray-50",
                )}
              >
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
