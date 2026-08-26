/**
 * 채용 공고 표시용 순수 헬퍼 + 타입 (서버·클라 어디서나 import 가능, DB 의존 없음).
 * 실제 데이터 조회는 서버 전용 `lib/job-openings.ts` 참고.
 */

export type JobOpening = {
  id: string;
  title: string;
  type: string;
  location: string;
  summary: string | null;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  applyMethod: string | null;
  applyEmail: string | null;
  /** YYYY-MM-DD, null = 상시채용 */
  deadline: string | null;
  /** YYYY-MM-DD */
  postedAt: string;
  /** 채용 페이지 노출 여부 */
  isPublished: boolean;
  sortOrder: number;
};

export type DeadlineTone = "always" | "urgent" | "normal" | "closed";

export type DeadlineBadge = {
  label: string;
  tone: DeadlineTone;
};

/** 마감일 → 뱃지 라벨/톤. deadline null = 상시채용. */
export function deadlineBadge(
  deadline: string | null,
  now: Date = new Date(),
): DeadlineBadge {
  if (!deadline) return { label: "상시채용", tone: "always" };

  const end = new Date(`${deadline}T23:59:59+09:00`);
  const diffMs = end.getTime() - now.getTime();
  if (Number.isNaN(diffMs)) return { label: "상시채용", tone: "always" };
  if (diffMs < 0) return { label: "마감", tone: "closed" };

  const days = Math.ceil(diffMs / 86_400_000);
  if (days === 0) return { label: "D-DAY", tone: "urgent" };
  return { label: `D-${days}`, tone: days <= 7 ? "urgent" : "normal" };
}

/** "2026-06-08" → "2026.06.08" */
export function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

/**
 * 마감일이 지났는가 (PLAN B / DAY 9, ITEM 04).
 *
 * `deadlineBadge` 의 "closed" 판정과 같은 기준(마감일 23:59:59 KST 포함)을 쓴다.
 * 공개 목록에서 자동으로 빼는 조건이라 두 곳의 기준이 갈리면 안 된다.
 */
export function isDeadlinePassed(
  deadline: string | null,
  now: Date = new Date(),
): boolean {
  return deadlineBadge(deadline, now).tone === "closed";
}

/** 오늘 날짜(KST) `YYYY-MM-DD`. `deadline` 이 date 타입이라 날짜 단위로 비교한다. */
export function todayKst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
