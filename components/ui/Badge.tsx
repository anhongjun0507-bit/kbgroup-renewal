import { cn } from "@/lib/cn";

/* Phase 14 UP-06 — variant 정합화: gold alias 제거(accent로 통합),
   accent 텍스트는 라이트 위 AA 통과 위해 accent-deep 사용 */

type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT: Record<BadgeVariant, string> = {
  primary: "border border-primary text-primary",
  secondary: "border border-secondary text-secondary",
  accent: "border border-accent-500 text-accent-deep",
  neutral: "border border-line text-ink-muted",
};

export function Badge({
  children,
  variant = "primary",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center bg-white px-2.5 py-1 text-[11px] font-medium tracking-wide",
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
