import { cn } from "@/lib/cn";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "gold";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT: Record<BadgeVariant, string> = {
  primary: "border border-primary text-primary",
  secondary: "border border-secondary text-secondary",
  accent: "border border-accent text-accent",
  gold: "border border-accent text-accent",
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
