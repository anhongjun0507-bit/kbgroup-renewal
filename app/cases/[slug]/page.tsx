import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexes, type Complex } from "@/data/site-content";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";

/* Phase 5.G.5 — 단지 디테일 페이지 골격
   실사진 자료 없음 — placeholder 갤러리 + 위치·관리내역·담당팀 구조만 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return complexes.map((c) => ({ slug: encodeURIComponent(c.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = decodeURIComponent(slug);
  const complex = complexes.find((c) => c.name === name);
  if (!complex) return { title: "단지 정보 없음 | (주)케이비개발" };
  return {
    title: `${complex.name} | 관리현황 | (주)케이비개발`,
    description: `${complex.region} ${complex.name} 단지 관리 현황`,
  };
}

function getInitial(name: string) {
  const noLh = name.replace(/^LH\s+/, "").trim();
  const tokens = noLh.split(/\s+/).filter(Boolean);
  return (tokens[tokens.length - 1] ?? noLh).charAt(0) || "K";
}

function isLh(c: Complex) {
  return c.name.startsWith("LH") || c.type === "LH";
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const name = decodeURIComponent(slug);
  const idx = complexes.findIndex((c) => c.name === name);
  if (idx === -1) notFound();
  const complex = complexes[idx];
  const initial = getInitial(complex.name);
  const lh = isLh(complex);
  const badge = lh ? "LH" : (complex.type ?? "민간");

  /* 인접 단지 — prev/next */
  const prev = idx > 0 ? complexes[idx - 1] : null;
  const next = idx < complexes.length - 1 ? complexes[idx + 1] : null;

  return (
    <>
      <PageHero
        kicker="CASE"
        title={complex.name}
        italicWord={complex.name.split(/\s+/).pop() ?? complex.name}
        subtitle={`${complex.region} · ${badge} 발주`}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "CASES", href: "/cases" },
          { label: complex.name },
        ]}
      />

      <section className="section bg-white">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* 갤러리 placeholder */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-navy-900">
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #15203F 0%, #1E2C56 50%, #0E1733 100%)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(50% 60% at 30% 30%, rgba(230,57,80,0.18) 0%, transparent 70%)",
                  }}
                />
                <span
                  className={
                    "absolute left-4 top-4 inline-flex items-center rounded-sm px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] " +
                    (lh ? "bg-accent-500 text-white" : "bg-navy-800 text-white")
                  }
                >
                  {badge}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="font-display text-[clamp(8rem,18vw,14rem)] font-black leading-none text-white/15"
                  >
                    {initial}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[12px] text-ink-faint">
                ※ 단지 실사진은 추후 등록 예정입니다.
              </p>

              {/* 4 sub 썸네일 */}
              <div className="mt-6 grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className="aspect-square overflow-hidden rounded-sm bg-navy-900"
                    style={{
                      background: [
                        "linear-gradient(135deg, #15203F 0%, #1E2C56 100%)",
                        "radial-gradient(60% 60% at 30% 30%, rgba(230,57,80,0.18) 0%, transparent 70%)",
                      ].join(", "),
                      filter: `hue-rotate(${(i - 1) * 12}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 단지 정보 */}
            <div>
              <p className="eyebrow">SITE OVERVIEW</p>
              <h2 className="mt-4 font-display text-[28px] font-bold tracking-tight text-ink-strong md:text-[32px]">
                {complex.name}
              </h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                    위치
                  </dt>
                  <dd className="col-span-2 text-[15px] font-semibold text-ink-strong">
                    {complex.region}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                    발주처
                  </dt>
                  <dd className="col-span-2 text-[15px] font-semibold text-ink-strong">
                    {complex.client ?? "-"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                    구분
                  </dt>
                  <dd className="col-span-2 text-[15px] font-semibold text-ink-strong">
                    {badge}
                  </dd>
                </div>
                {complex.households && (
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                      세대수
                    </dt>
                    <dd className="col-span-2 font-mono-num text-[15px] font-semibold text-ink-strong">
                      {complex.households.toLocaleString()}세대
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-8 rounded-md border border-line bg-gray-50 p-6">
                <p className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                  관리 내역
                </p>
                <p className="mt-3 text-[14px] leading-[1.75] text-ink-muted">
                  상세 관리 내역과 담당팀 정보는 현재 정리 중입니다. 단지 자료
                  업데이트 후 공개됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* prev / next */}
          <nav
            aria-label="단지 페이지 이동"
            className="mt-16 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
          >
            {prev ? (
              <Link
                href={`/cases/${encodeURIComponent(prev.name)}`}
                className="group flex items-center gap-3 rounded-md border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
              >
                <span aria-hidden="true" className="text-ink-faint">←</span>
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                    PREV
                  </span>
                  <span className="mt-1 block font-display text-[15px] font-bold text-ink-strong">
                    {prev.name}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/cases/${encodeURIComponent(next.name)}`}
                className="group flex items-center justify-end gap-3 rounded-md border border-line bg-white p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
              >
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                    NEXT
                  </span>
                  <span className="mt-1 block font-display text-[15px] font-bold text-ink-strong">
                    {next.name}
                  </span>
                </span>
                <span aria-hidden="true" className="text-ink-faint">→</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </Container>
      </section>
    </>
  );
}
