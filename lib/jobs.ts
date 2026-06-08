import { jobOpenings, type JobOpening } from "@/data/site-content";

/**
 * 채용 공고 조회·표시 헬퍼.
 *
 * D-day 계산은 "오늘"이 필요하므로 호출부(서버 컴포넌트)에서 now를 넘긴다.
 * 서버 렌더(동적 라우트)에서만 계산해 클라이언트 하이드레이션 불일치를 피한다.
 */

/** 등록일 최신순으로 정렬된 활성 공고 */
export function getActiveOpenings(): JobOpening[] {
  return jobOpenings
    .filter((j) => j.isActive)
    .slice()
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

/** id로 공고 1건 조회 (비활성 포함 — 상세 페이지에서 마감 안내용) */
export function findOpening(id: string): JobOpening | undefined {
  return jobOpenings.find((j) => j.id === id);
}

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

  // 마감일 당일 23:59:59(KST)까지 유효로 계산
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
