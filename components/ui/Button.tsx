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

/* NAI 톤 — 직각 + 빨강 단색 CTA + 검정 outline */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-strong text-white hover:bg-[#000]",
  secondary:
    "bg-secondary text-white hover:bg-[#048541]",
  accent:
    "bg-accent text-white hover:bg-[#d12342]",
  outline:
    "bg-white border border-ink-strong text-ink-strong hover:bg-ink-strong hover:text-white",
  ghost:
    "bg-transparent text-ink-strong hover:text-accent",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-7 text-[15px]",
  lg: "h-14 px-9 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

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
