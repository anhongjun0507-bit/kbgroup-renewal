import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getComplexes, toSlug } from "@/lib/content";
import type { ContentComplex } from "@/lib/content/types";
import { Container } from "@/components/ui";

/* Phase 6.5 E-3 — /cases/[slug] 5섹션 스켈레톤
   1) Hero full-bleed (16:9)
   2) 프로젝트 메타 4-col
   3) 본문 (좌 30% sticky 인덱스 + 우 70% prose)
   4) 갤러리 (4 columns)
   5) prev/next full-bleed nav 카드

   PLAN B / DAY 3 — lib/content 어댑터 전환.
   · 상세 페이지는 **현재 운영 단지(is_active = true)만** 대상이다. 과거 단지 19건은
     통합 테이블로 옮겼어도 상세 페이지가 새로 생기면 안 된다 (PROGRESS §11-5).
   · 조회 키는 DB 의 불변 slug (E-1). params.slug 는 Next 가 디코드해 넘기므로
     toSlug() 로 다시 인코딩해 맞춘다. 단지명이 바뀌어도 URL 은 유지된다.
   · dynamicParams 기본값(true) 유지 — 관리자가 새 단지를 등록하면 재빌드 없이 접근 가능. */

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const complexes = await getComplexes(); // is_active = true 만
  return complexes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const complexes = await getComplexes();
  const complex = complexes.find((c) => c.slug === toSlug(slug));
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

function isLh(c: Pick<ContentComplex, "name" | "type">) {
  return c.name.startsWith("LH") || c.type === "LH";
}

const PROSE_SECTIONS = [
  { id: "scope", label: "관리 범위", body: "단지 시설관리·위생청소·경비보안·시행건설 영역을 통합 운영합니다. 정기 점검과 예방 정비를 중심으로 입주민의 일상이 끊김 없이 유지되도록 합니다." },
  { id: "team", label: "담당팀", body: "전담 관리소장 + 시설반장 + 경비반장 + 청소반장 4인 코어로 구성됩니다. 광역시·도 권역별 슈퍼바이저가 분기 점검을 진행합니다." },
  { id: "results", label: "운영 성과", body: "관리비 절감, 민원 응대 시간 단축, 입주민 만족도 향상 등의 성과는 단지 자료 업데이트 후 공개됩니다." },
];

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const complexes = await getComplexes(); // is_active = true 만 → 과거 단지 slug 는 아래에서 404
  const idx = complexes.findIndex((c) => c.slug === toSlug(slug));
  if (idx === -1) notFound();
  const complex = complexes[idx];
  const initial = getInitial(complex.name);
  const lh = isLh(complex);
  const badge = lh ? "LH" : (complex.type ?? "민간");

  const prev = idx > 0 ? complexes[idx - 1] : null;
  const next = idx < complexes.length - 1 ? complexes[idx + 1] : null;

  return (
    <>
      {/* 1) Hero — full-bleed 16:9 */}
      <section
        data-surface="dark"
        aria-label={`${complex.name} 단지`}
        className="relative isolate aspect-[16/9] max-h-[640px] w-full overflow-hidden bg-navy-900"
      >
        {/* Phase 14 P0-04 hotfix — complex.image 있으면 실사 사진 hero, 없으면 모노그램 fallback */}
        {complex.image ? (
          <>
            <Image
              src={complex.image}
              alt={complex.name}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            {/* 하단 단지명·breadcrumb 가독성 보장 그라데이션 */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/30 to-navy-900/40"
            />
          </>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #0E1F3A 0%, #16315C 50%, #0B1A33 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 60% at 30% 30%, rgba(201,162,75,0.18) 0%, transparent 70%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden="true"
                className="font-display text-[clamp(10rem,22vw,20rem)] font-black leading-none text-white/12"
              >
                {initial}
              </span>
            </div>
          </>
        )}

        {/* Hero 텍스트 오버레이 */}
        <div className="absolute inset-x-0 bottom-0">
          <Container className="pb-10 md:pb-14">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/65">
                <li><Link href="/" className="hover:text-white">HOME</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href="/cases" className="hover:text-white">CASES</Link></li>
                <li aria-hidden="true">/</li>
                <li className="text-white/85">{complex.region.split(/\s+/)[0]}</li>
              </ol>
            </nav>
            <div className="flex items-baseline gap-3">
              <span
                className={
                  "inline-flex items-center rounded-sm px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] " +
                  (lh ? "bg-accent-500 text-navy-900" : "bg-navy-700 text-white")
                }
              >
                {badge}
              </span>
              <span className="text-[12px] uppercase tracking-[0.18em] text-white/65">
                {complex.region}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[36px] font-extrabold leading-[1.1] tracking-tight text-white md:text-[52px]">
              {complex.name}
            </h1>
          </Container>
        </div>
      </section>

      {/* 2) 프로젝트 메타 4-col */}
      <section className="border-b border-line bg-white py-10">
        <Container>
          <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4">
            <Meta label="구분" value={badge} />
            <Meta label="위치" value={complex.region} />
            <Meta label="발주처" value={complex.client ?? "-"} />
            <Meta
              label="세대수"
              value={
                complex.households
                  ? `${complex.households.toLocaleString()}세대`
                  : "-"
              }
            />
          </dl>
        </Container>
      </section>

      {/* 3) 본문 prose + 좌측 sticky 인덱스 */}
      <section className="section bg-white">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <p className="eyebrow">ON THIS PAGE</p>
                <ul className="mt-5 space-y-3 text-[14px]">
                  {PROSE_SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-ink-muted transition-colors duration-200 hover:text-navy-700"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="space-y-12">
              {PROSE_SECTIONS.map((s) => (
                <article key={s.id} id={s.id}>
                  <p className="eyebrow text-accent-500">{s.label}</p>
                  <h2 className="mt-3 font-display text-[28px] font-bold tracking-tight text-ink-strong">
                    {s.label}
                  </h2>
                  <p className="mt-5 text-[16px] leading-[1.85] text-ink-muted">
                    {s.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 4) 갤러리 — Phase 14 P0-04 hotfix.
         image 보유 단지: hero에서 사진 노출 충분 → 갤러리 섹션 hide (추가 사진 미수령)
         image 미보유 단지: 기존 placeholder + 안내 메시지 유지 */}
      {!complex.image && (
        <section className="section bg-gray-50">
          <Container>
            <p className="eyebrow">GALLERY</p>
            <h2 className="mt-3 font-display text-[28px] font-bold tracking-tight text-ink-strong md:text-[32px]">
              현장 사진
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] text-ink-faint">
              ※ 단지 실사진은 추후 등록 예정입니다. 현재는 placeholder만 표시됩니다.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="aspect-[4/5] overflow-hidden rounded-md bg-navy-900"
                  style={{
                    background: [
                      "linear-gradient(135deg, #0E1F3A 0%, #16315C 100%)",
                      "radial-gradient(60% 60% at 30% 30%, rgba(201,162,75,0.18) 0%, transparent 70%)",
                    ].join(", "),
                  }}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 5) prev/next full-bleed nav */}
      <nav
        aria-label="단지 페이지 이동"
        className="grid grid-cols-1 md:grid-cols-2"
      >
        {prev ? (
          <Link
            href={`/cases/${prev.slug}`}
            data-surface="dark"
            className="group relative isolate flex min-h-[200px] items-center overflow-hidden bg-navy-900 p-8 transition-colors md:p-12"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #0E1F3A 0%, #16315C 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(50% 60% at 20% 50%, rgba(201,162,75,0.25) 0%, transparent 70%)",
                opacity: 0.6,
              }}
            />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">
                ← PREVIOUS CASE
              </p>
              <p className="mt-3 font-display text-[22px] font-bold text-white md:text-[28px]">
                {prev.name}
              </p>
              <p className="mt-2 text-[13px] text-white/65">{prev.region}</p>
            </div>
          </Link>
        ) : (
          <span className="bg-gray-50" />
        )}
        {next ? (
          <Link
            href={`/cases/${next.slug}`}
            data-surface="dark"
            className="group relative isolate flex min-h-[200px] items-center justify-end overflow-hidden bg-navy-900 p-8 text-right transition-colors md:p-12"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #16315C 0%, #0E1F3A 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(50% 60% at 80% 50%, rgba(201,162,75,0.25) 0%, transparent 70%)",
                opacity: 0.6,
              }}
            />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">
                NEXT CASE →
              </p>
              <p className="mt-3 font-display text-[22px] font-bold text-white md:text-[28px]">
                {next.name}
              </p>
              <p className="mt-2 text-[13px] text-white/65">{next.region}</p>
            </div>
          </Link>
        ) : (
          <span className="bg-gray-50" />
        )}
      </nav>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </dt>
      <dd className="mt-2 font-display text-[18px] font-bold tracking-tight text-ink-strong md:text-[20px]">
        {value}
      </dd>
    </div>
  );
}
