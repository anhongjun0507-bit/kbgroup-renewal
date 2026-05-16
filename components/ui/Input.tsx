import { cn } from "@/lib/cn";

/* Phase 10 P1-07 — 단일 Input 컴포넌트
   상태: default / focus / error / disabled
   사이즈: md(48px) 기본 */

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = ({
  className,
  error = false,
  type = "text",
  ...rest
}: InputProps) => {
  return (
    <input
      type={type}
      aria-invalid={error || undefined}
      className={cn(
        /* Phase 12 업그레이드 #5 — 모바일에서 16px 이상으로 iOS 줌 방지 */
        "block w-full h-12 rounded-md border bg-white px-4 text-[16px] text-ink-strong transition-all duration-200 md:text-[15px]",
        "placeholder:text-[#9AA3B2]",
        "focus:outline-none focus:ring-2",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-ink-faint",
        error
          ? "border-danger focus:border-danger focus:ring-danger/30"
          : "border-line focus:border-accent-500 focus:ring-accent-500/30",
        className,
      )}
      {...rest}
    />
  );
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = ({
  className,
  error = false,
  rows = 5,
  ...rest
}: TextareaProps) => {
  return (
    <textarea
      rows={rows}
      aria-invalid={error || undefined}
      className={cn(
        "block w-full rounded-md border bg-white px-4 py-3 text-[16px] text-ink-strong transition-all duration-200 md:text-[15px]",
        "placeholder:text-[#9AA3B2]",
        "focus:outline-none focus:ring-2",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-ink-faint",
        "resize-y",
        error
          ? "border-danger focus:border-danger focus:ring-danger/30"
          : "border-line focus:border-accent-500 focus:ring-accent-500/30",
        className,
      )}
      {...rest}
    />
  );
};
