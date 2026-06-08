"use client";

/** 클릭 시 confirm() 후에만 form 제출되는 submit 버튼 (실수 삭제 방지). */
export function ConfirmButton({
  children,
  message = "정말 삭제하시겠습니까?",
  className,
}: {
  children: React.ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
