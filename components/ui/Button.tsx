import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps & {
  as?: "button";
} & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof CommonProps
  >;

type ButtonAsLink = CommonProps & {
  as: "link";
  href: string;
} & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof CommonProps | "href"
  >;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/* Phase 2 톤 — 직각 폐기, 라디우스 sm(8) 기본
   accent: 핑크 CTA — hover 시 shadow-cta(레드 글로우)
   ghost: 흰 outline 1px (다크 배경용)
   outline: 어두운 outline (밝은 배경용) */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-navy-800 text-white hover:bg-navy-900 rounded-sm",
  secondary:
    "bg-secondary text-white hover:bg-[#048541] rounded-sm",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] rounded-sm",
  outline:
    "bg-transparent border border-ink-strong text-ink-strong hover:bg-ink-strong hover:text-white rounded-sm",
  ghost:
    "bg-transparent border border-white/60 text-white hover:bg-white hover:text-ink-strong rounded-sm",
};

/* lg = 56h / 32px padding (지시서 글로벌[A] Primary 무료 상담) */
const SIZE: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all duration-200 [transition-timing-function:var(--ease)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(BASE, SIZE[size], VARIANT[variant], className);

  if (props.as === "link") {
    const {
      variant: _v, size: _s, className: _c, as: _a, children: _ch, ...rest
    } = props;
    void _v; void _s; void _c; void _a; void _ch;
    return (
      <Link className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v, size: _s, className: _c, as: _a, children: _ch, ...rest
  } = props;
  void _v; void _s; void _c; void _a; void _ch;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
