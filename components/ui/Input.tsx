import { cn } from "@/lib/cn";

/* Phase 14 P1-07 — Input/Textarea 상태 정의 확장
   상태: default / focus / error / success / disabled
   사이즈: md(48px) 기본, 모바일 16px (iOS 줌 방지) → md 15px */

type Status = "default" | "error" | "success";

function statusClass(status: Status): string {
  switch (status) {
    case "error":
      return "border-danger focus:border-danger focus:ring-danger/30";
    case "success":
      return "border-success focus:border-success focus:ring-success/30";
    default:
      return "border-line focus:border-accent-500 focus:ring-accent-500/30";
  }
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  success?: boolean;
};

export const Input = ({
  className,
  error = false,
  success = false,
  type = "text",
  ...rest
}: InputProps) => {
  const status: Status = error ? "error" : success ? "success" : "default";
  return (
    <input
      type={type}
      aria-invalid={error || undefined}
      className={cn(
        "block w-full h-12 rounded-md border bg-white px-4 text-[16px] text-ink-strong transition-colors duration-200 md:text-[15px]",
        "placeholder:text-[#9AA3B2]",
        "focus:outline-none focus:ring-2",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-ink-faint",
        statusClass(status),
        className,
      )}
      {...rest}
    />
  );
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
  success?: boolean;
};

export const Textarea = ({
  className,
  error = false,
  success = false,
  rows = 5,
  ...rest
}: TextareaProps) => {
  const status: Status = error ? "error" : success ? "success" : "default";
  return (
    <textarea
      rows={rows}
      aria-invalid={error || undefined}
      className={cn(
        "block w-full rounded-md border bg-white px-4 py-3 text-[16px] text-ink-strong transition-colors duration-200 md:text-[15px]",
        "placeholder:text-[#9AA3B2]",
        "focus:outline-none focus:ring-2",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-ink-faint",
        "resize-y",
        statusClass(status),
        className,
      )}
      {...rest}
    />
  );
};

/* 보조 helper/error 메시지 컴포넌트 — Input/Textarea 하위에 사용 */
type FieldMessageProps = {
  children: React.ReactNode;
  status?: Status;
  id?: string;
};

export function FieldMessage({ children, status = "default", id }: FieldMessageProps) {
  if (!children) return null;
  const color =
    status === "error"
      ? "text-danger"
      : status === "success"
        ? "text-success"
        : "text-ink-faint";
  return (
    <p id={id} className={cn("mt-1.5 text-[12px] leading-relaxed", color)}>
      {children}
    </p>
  );
}
