import Link from "next/link";

/**
 * 비공개 페이지 관리자 미리보기 배너 (PLAN B / DAY 8, ITEM 03).
 *
 * 비공개로 돌린 페이지는 일반 방문자에게 404 다. 관리자만 그대로 볼 수 있고,
 * "지금 보고 있는 화면이 공개 상태가 아니다"를 착각 없이 알리기 위해 이 배너를 띄운다.
 */
export function UnpublishedNotice({ path }: { path: string }) {
  return (
    <div
      role="status"
      className="border-b border-accent-600 bg-accent-500 px-5 py-3 text-navy-900 md:px-8"
    >
      <p className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-semibold">
        <span>이 페이지는 현재 비공개입니다 — 관리자에게만 보입니다.</span>
        <span className="font-mono-num text-[13px] font-normal">{path}</span>
        <Link
          href="/admin/content/pages"
          className="underline underline-offset-4 hover:text-navy-700"
        >
          페이지 공개 관리 →
        </Link>
      </p>
    </div>
  );
}
