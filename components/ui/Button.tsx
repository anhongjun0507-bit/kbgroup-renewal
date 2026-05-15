import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
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
    "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
  secondary:
    "bg-primary-soft text-primary hover:bg-primary/10",
  outline:
    "bg-white border border-line text-ink-strong hover:border-primary hover:text-primary",
  ghost:
    "bg-transparent text-ink hover:bg-bg-soft",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-md",
  md: "h-12 px-6 text-[15px] rounded-lg",
  lg: "h-14 px-8 text-base rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(BASE, SIZE[size], VARIANT[variant], className);

  if (props.as === "link") {
    const {
      variant: _v,
      size: _s,
      className: _c,
      as: _a,
      children: _ch,
      ...rest
    } = props;
    void _v;
    void _s;
    void _c;
    void _a;
    void _ch;
    return (
      <Link className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    as: _a,
    children: _ch,
    ...rest
  } = props;
  void _v;
  void _s;
  void _c;
  void _a;
  void _ch;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
