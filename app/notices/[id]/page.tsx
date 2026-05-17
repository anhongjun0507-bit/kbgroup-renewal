import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";
import { NOTICES, findNotice } from "../data";

/* Phase 14-D D-1 — 공지 상세 페이지 본문 렌더.
   id 매칭 시 body 문단 + 카테고리 라벨 + 이전·다음 공지 네비, 매칭 실패 시 안내 카드. */

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return NOTICES.map((n) => ({ id: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = findNotice(id);
  if (!notice) {
    return { title: "공지 상세 | (주)케이비개발" };
  }
  return {
    title: `${notice.title} | (주)케이비개발`,
    description: notice.summary,
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  notice: "공지",
  complex: "신규단지",
  press: "언론보도",
  career: "채용공고",
};

const CATEGORY_COLOR: Record<string, string> = {
  notice: "bg-navy-800 text-white",
  complex: "bg-accent-500 text-navy-900",
  press: "bg-navy-700 text-white",
  career: "bg-accent-600 text-white",
};

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(day, 10)}일`;
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const notice = findNotice(id);

  if (!notice) {
    return (
      <>
        <PageHero
          kicker="NOTICE DETAIL"
          title="공지를 찾을 수 없습니다"
          italicWord="찾을"
          subtitle="요청하신 공지 콘텐츠가 존재하지 않거나 이전되었을 수 있습니다."
          breadcrumb={[
            { label: "HOME", href: "/" },
            { label: "NOTICES", href: "/notices" },
            { label: "DETAIL" },
          ]}
        />
        <section className="section bg-white">
          <Container>
            <div className="mx-auto max-w-3xl rounded-md border border-line bg-gray-50 p-10 text-center md:p-14">
              <div className="mx-auto h-12 w-12 text-ink-faint" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="10" width="32" height="28" rx="2" />
                  <path d="M8 18H40" />
                  <path d="M16 26H32M16 32H26" />
                </svg>
              </div>
              <p className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink-strong md:text-[26px]">
                해당 공지를 찾을 수 없습니다
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                전체 공지 목록에서 다시 확인해 주세요.
              </p>
              <div className="mt-8">
                <Link
                  href="/notices"
                  className="inline-flex h-12 items-center gap-2 rounded-sm border border-ink-strong px-6 text-[14px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
                >
                  ← 공지사항 목록으로
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  /* 이전·다음 공지 — date 내림차순 정렬 가정 (NOTICES 배열 순서 유지) */
  const idx = NOTICES.findIndex((n) => n.id === id);
  const prev = idx > 0 ? NOTICES[idx - 1] : null;
  const next = idx < NOTICES.length - 1 ? NOTICES[idx + 1] : null;

  return (
    <>
      <PageHero
        kicker={CATEGORY_LABEL[notice.category] ?? "NOTICE"}
        title={notice.title}
        italicWord=""
        subtitle={notice.summary ?? formatDate(notice.date)}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "NOTICES", href: "/notices" },
          { label: CATEGORY_LABEL[notice.category]?.toUpperCase() ?? "DETAIL" },
        ]}
      />

      <article className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* 메타 — 카테고리 배지 + 작성일 */}
            <div className="flex flex-wrap items-center gap-3 border-b border-line pb-6">
              <span
                className={
                  "inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] " +
                  (CATEGORY_COLOR[notice.category] ?? "bg-navy-800 text-white")
                }
              >
                {CATEGORY_LABEL[notice.category] ?? "공지"}
              </span>
              <time
                dateTime={notice.date}
                className="font-mono-num text-[13px] text-ink-faint"
              >
                {formatDate(notice.date)}
              </time>
            </div>

            {/* 본문 */}
            {notice.body && notice.body.length > 0 ? (
              <div className="prose-notice mt-10 space-y-6 text-[16px] leading-[1.85] text-ink-muted md:text-[17px]">
                {notice.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-[15px] leading-[1.8] text-ink-muted">
                {notice.summary}
              </p>
            )}

            {/* 첨부·외부 링크 */}
            {notice.links && notice.links.length > 0 && (
              <div className="mt-10 rounded-md border border-line bg-gray-50 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                  관련 링크
                </p>
                <ul className="mt-3 space-y-2">
                  {notice.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-strong underline-offset-4 hover:text-accent-deep hover:underline"
                      >
                        {l.label}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 이전·다음 네비 */}
            <nav
              aria-label="공지 네비게이션"
              className="mt-14 grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2 sm:gap-4"
            >
              {prev ? (
                <Link
                  href={`/notices/${prev.id}`}
                  className="group rounded-md border border-line p-5 transition-colors duration-200 hover:border-navy-700 hover:bg-gray-50"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                    ← 최신 공지
                  </p>
                  <p className="mt-2 font-display text-[15px] font-bold leading-snug tracking-tight text-ink-strong group-hover:text-accent-deep">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/notices/${next.id}`}
                  className="group rounded-md border border-line p-5 text-right transition-colors duration-200 hover:border-navy-700 hover:bg-gray-50"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                    이전 공지 →
                  </p>
                  <p className="mt-2 font-display text-[15px] font-bold leading-snug tracking-tight text-ink-strong group-hover:text-accent-deep">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </nav>

            <div className="mt-10 text-center">
              <Link
                href="/notices"
                className="inline-flex h-12 items-center gap-2 rounded-sm border border-ink-strong px-6 text-[14px] font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
              >
                ← 공지사항 목록으로
              </Link>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}
