"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { complexes, pastComplexes, type Complex } from "@/data/site-content";

/* Phase 5.G.4 — 갤러리: placeholder 업그레이드 + 배지 + 메타
   Phase 14-M (2026-05-20) — 클라 hwpx 요청.
   "총 관리단지 중 LH단지 + 주요관리실적 단지만 카드, 나머지는 리스트화" 정책 적용.
   Phase 14-M-3 — hwpx 주요 19개 중 과거 단지 2건(그랜드센트럴·문흥대주2차)도 카드 포함.
   "종료" 배지로 현재/과거 명확 시각 구분. 본 컴포넌트는
   LH 9 + Featured 현재 15 + Featured 과거 2 = 26개 주요 단지 노출.
   전체 154개 검색·필터·정렬은 [[CasesList]]로 분리. */

/* CasesGallery 내부 정규화 타입. PastComplex를 카드 표시용 Complex 형태로 흡수. */
type GalleryItem = Complex & {
  /** Phase 14-M-3 — true면 과거 운영 단지 (계약 종료). 카드에 "종료" 배지 노출. */
  isPast?: boolean;
  /** 과거 단지의 계약 기간 (예: "2020.9.1 ~ 2021.5.31") */
  period?: string;
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const HUES = [0, 14, -10, 22, -16, 6, 28, -22];

function isLh(c: Complex) {
  return c.name.startsWith("LH") || c.type === "LH";
}

function getInitial(name: string) {
  const noLh = name.replace(/^LH\s+/, "").trim();
  const tokens = noLh.split(/\s+/).filter(Boolean);
  return (tokens[tokens.length - 1] ?? noLh).charAt(0) || "K";
}

function badgeStyle(type?: Complex["type"]) {
  if (type === "LH") return "bg-accent-500 text-navy-900";
  if (type === "민간") return "bg-navy-800 text-white";
  if (type === "공공") return "bg-navy-700 text-white";
  return "bg-white/85 text-ink-strong";
}

export function CasesGallery() {
  const shouldReduce = useReducedMotion() ?? false;

  /* 주요 카드 노출 정책: LH + isFeatured.
     · 현재 complexes 중 LH 또는 isFeatured
     · pastComplexes 중 isFeatured (hwpx 주요 19개에 포함된 과거 단지)
     정렬: LH 먼저 → 현재 featured → 과거 featured. 각 그룹 내 이름순. */
  const featured = useMemo<GalleryItem[]>(() => {
    const currentItems: GalleryItem[] = complexes.filter(
      (c) => isLh(c) || c.isFeatured,
    );
    const pastItems: GalleryItem[] = pastComplexes
      .filter((p) => p.isFeatured)
      .map((p) => ({
        name: p.name,
        region: p.region,
        households: p.households,
        area: p.area,
        kind: p.kind,
        type: p.type,
        aliases: p.aliases,
        image: p.image,
        isFeatured: p.isFeatured,
        isPast: true,
        period: p.period,
      }));
    const rank = (c: GalleryItem) =>
      c.isPast ? 2 : isLh(c) ? 0 : 1;
    return [...currentItems, ...pastItems].sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return a.name.localeCompare(b.name, "ko");
    });
  }, []);

  /* Phase 14-M-4 — LH는 현재/과거 합산해서 표기 (hwpx "LH 10" 의도와 일치).
     "주요(종료)" 카운트는 non-LH 과거만. LH 과거 1건(의정부)은 LH 발주 카운트에 흡수. */
  const lhCount = featured.filter(isLh).length;
  const pastNonLhCount = featured.filter((c) => c.isPast && !isLh(c)).length;
  const currentFeaturedCount = featured.length - lhCount - pastNonLhCount;

  return (
    <section
      aria-labelledby="cases-gallery-heading"
      className="section bg-gray-50"
    >
      <Container>
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Heading
            kicker={`KEY PROJECTS · 주요 관리실적 ${featured.length}`}
            title="LH 발주·주요 단지의 운영 현장"
            italicWord="운영 현장"
            subtitle="LH 공공임대 단지와 클라이언트가 직접 지정한 주요 단지의 현황입니다."
            align="left"
            size="md"
            as="h2"
          />
          <dl className="grid grid-cols-3 gap-6 text-center md:text-right">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                LH 발주
              </dt>
              <dd className="mt-1 font-display text-[22px] font-extrabold text-navy-800 md:text-[26px]">
                {lhCount}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                주요 단지
              </dt>
              <dd className="mt-1 font-display text-[22px] font-extrabold text-navy-800 md:text-[26px]">
                {currentFeaturedCount}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                주요 (종료)
              </dt>
              <dd className="mt-1 font-display text-[22px] font-extrabold text-ink-muted md:text-[26px]">
                {pastNonLhCount}
              </dd>
            </div>
          </dl>
        </div>

        <motion.ul
          initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {featured.map((c, idx) => (
            <li key={`${c.isPast ? "past:" : "active:"}${c.name}`}>
              <CaseCard complex={c} hue={HUES[idx % HUES.length]} />
            </li>
          ))}
        </motion.ul>
      </Container>

      <span id="cases-gallery-heading" className="sr-only">주요 관리실적 단지</span>
    </section>
  );
}

function CaseCard({ complex, hue }: { complex: GalleryItem; hue: number }) {
  const lh = isLh(complex);
  const isPast = complex.isPast ?? false;
  const badge = lh ? "LH" : (complex.type ?? "민간");
  const initial = getInitial(complex.name);
  const slug = encodeURIComponent(complex.name);
  /* Phase 14 P2-08 — 단지명 시드 기반 navy 그라데이션 각도/톤 미세 변화.
     실사 이미지 매핑 전까지 카드별 변별성 보강. hue prop은 -22~28 범위 */
  const seed = complex.name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const angle = 100 + ((seed % 70) - 10); // 90~170deg
  const accentPos = (seed % 5) * 15 + 20; // 20~80% accent 라디얼 위치
  const monoTone = ["#0E1F3A", "#102648", "#0B1A33"][seed % 3];
  void hue; // 색조 분산을 단지 시드 기반으로 대체

  /* 과거 단지는 카드 자체에 약간 채도 저하 + 종료 배지로 명확 구분.
     /cases/[slug] 디테일 페이지는 현재 complexes만 lookup 하므로 과거 단지는
     Link 대신 div로 래핑(404 방지). PastProjects 섹션과 동일한 비클릭 정책. */
  const cardChildren = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
          {/* Phase 14 P0-03 — complex.image 지정 시 실사 사진 우선 표시, 없으면 기존 모노그램 fallback */}
          {complex.image ? (
            <>
              <Image
                src={complex.image}
                alt={complex.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]"
              />
              {/* Phase 14 P0-04 hotfix — 사진 영역엔 텍스트 없음(배지·위치 마커는 자체 배경).
                  hover 시에만 살짝 톤다운(interaction feedback). 평상시는 사진 본연. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-navy-900/0 transition-colors duration-500 group-hover:bg-navy-900/20"
              />
            </>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${angle}deg, ${monoTone} 0%, #16315C 50%, #0B1A33 100%)`,
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 origin-center transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.03]"
                style={{
                  background: `radial-gradient(60% 60% at ${accentPos}% 30%, rgba(201,162,75,0.18) 0%, transparent 70%)`,
                }}
              />
              <div className="absolute inset-0 bg-navy-900/40 transition-opacity duration-500 group-hover:bg-navy-900/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  aria-hidden="true"
                  className="font-display text-[clamp(5rem,12vw,9rem)] font-black leading-none text-white/15 transition-colors duration-500 group-hover:text-white/30"
                >
                  {initial}
                </span>
              </div>
            </>
          )}

          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
            <span
              className={
                "inline-flex items-center rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] " +
                badgeStyle(badge as Complex["type"])
              }
            >
              {badge}
            </span>
            {isPast && (
              <span
                aria-label="운영 종료"
                className="inline-flex items-center rounded-sm bg-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted"
              >
                종료
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-white/10 px-2 py-1 text-[10px] font-medium text-white/85 backdrop-blur-sm">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1.5C5.2 1.5 3 3.7 3 6.5C3 10 8 14.5 8 14.5S13 10 13 6.5C13 3.7 10.8 1.5 8 1.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="8" cy="6.5" r="1.5" fill="currentColor" />
            </svg>
            {complex.region.split(/\s+/)[0]}
          </div>

          {/* 우상단 화살표 (hover 시 slide) */}
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white/0 text-white opacity-0 transition-all duration-300 group-hover:bg-white/15 group-hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" />
            </svg>
          </span>
        </div>
    </>
  );

  return (
    <article
      className={`group overflow-hidden rounded-md border bg-white transition-all duration-200 [transition-timing-function:var(--ease)] ${
        isPast
          ? "border-line opacity-90 saturate-50"
          : "border-line hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
      }`}
    >
      {isPast ? (
        <div className="block">{cardChildren}</div>
      ) : (
        <Link
          href={`/cases/${slug}`}
          className="block"
          aria-label={`${complex.name} 상세보기`}
        >
          {cardChildren}
        </Link>
      )}
    </article>
  );
}
