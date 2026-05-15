import { cn } from "@/lib/cn";

type BadgeVariant = "primary" | "gold" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT: Record<BadgeVariant, string> = {
  primary: "bg-primary text-gold",
  gold: "bg-gold text-primary",
  neutral: "bg-beige text-ink-soft",
};

export function Badge({
  children,
  variant = "primary",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
