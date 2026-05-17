import Link from "next/link";
import { cn } from "@/lib/cn";

/* Phase 14 P1-04 — Button variant/size/state 정의 명확화
   - variant 6종: primary(navy) / secondary(green) / accent(gold) /
                 outline / ghost / destructive(red)
   - size 3종: sm 36h / md 44h / lg 52h — md는 WCAG 2.5.5 (44x44) 통과
   - state 5종: base / hover / active / focus-visible / disabled / aria-busy
   - transition: all → 특정 속성만 (perf + intent 명확) */

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive";
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

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-navy-800 text-white hover:bg-navy-900 active:bg-navy-900 rounded-sm",
  secondary:
    "bg-secondary text-white hover:bg-[#048541] active:bg-[#037038] rounded-sm",
  accent:
    "bg-accent-500 text-navy-900 hover:bg-accent-600 hover:text-white active:bg-accent-700 hover:shadow-[var(--shadow-cta)] rounded-sm",
  outline:
    "bg-transparent border border-ink-strong text-ink-strong hover:bg-ink-strong hover:text-white active:bg-navy-900 rounded-sm",
  ghost:
    "bg-transparent border border-white/60 text-white hover:bg-white hover:text-ink-strong active:bg-white/90 rounded-sm",
  destructive:
    "bg-danger text-white hover:bg-[#9B1717] active:bg-[#7E1212] rounded-sm",
};

/* md 48→44 (WCAG 2.5.5 정합), lg 56→52, sm 40→36 */
const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-[52px] px-8 text-base",
};

/* `.btn-reset`로 [data-surface="dark"] a 셀렉터 회피 (Phase 11 P0-A).
   transition을 특정 속성으로 한정해 perf + 의도 명확화. */
const BASE =
  "btn-reset inline-flex items-center justify-center gap-2 font-bold tracking-tight whitespace-nowrap " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 [transition-timing-function:var(--ease)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none aria-busy:opacity-70 aria-busy:cursor-progress";

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
