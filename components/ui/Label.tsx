import { cn } from "@/lib/cn";

/* Phase 10 P1-07 — 폼 라벨 단일 컴포넌트 */

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = ({
  children,
  required,
  className,
  ...rest
}: LabelProps) => {
  return (
    <label
      className={cn(
        "mb-2 block text-[13px] font-semibold text-ink-muted",
        className,
      )}
      {...rest}
    >
      {children}
      {required && (
        /* Phase 14 UP-06 — 라이트 위 별표는 accent-deep (AA 통과) */
        <span aria-hidden="true" className="ml-1 text-accent-deep">
          *
        </span>
      )}
    </label>
  );
};
