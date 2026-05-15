import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost";
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
    "bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5",
  ghost: "text-primary hover:bg-primary/5",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-base",
  lg: "px-9 py-4 text-lg",
};

const BASE =
  "group inline-flex items-center justify-center gap-2 font-medium tracking-[0.02em] transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none";

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
