import { cn } from "@/lib/cn";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "gold";  // gold는 호환 alias (= accent)

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT: Record<BadgeVariant, string> = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  accent: "bg-accent-soft text-accent",
  gold: "bg-accent-soft text-accent",     // alias
  neutral: "bg-bg-soft text-ink",
};

export function Badge({
  children,
  variant = "primary",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
