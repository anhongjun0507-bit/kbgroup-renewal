import Link from "next/link";
import { Container } from "@/components/ui";
import { company, contact } from "@/data/site-content";

const SITEMAP = [
  /* Phase 9 P2-04 — 헤더 nav와 라벨 일치 */
  { label: "회사소개", href: "/about" },
  { label: "사업영역", href: "/business" },
  { label: "관리현황", href: "/cases" },
  { label: "인허가", href: "/licenses" },
  { label: "채용", href: "/careers" },
  { label: "소식", href: "/notices" },
];

/* Phase 9 P0-09 — 푸터 대비 강화
   `text-white/55→/65 (eyebrow)`, `/75→/85 (link/body)`, copyright `/55→/65` */
const COL_LABEL =
  "text-[12px] font-semibold uppercase tracking-[0.12em] mb-5 text-accent-300";
const LINK_BASE =
  "text-[14px] leading-relaxed text-white/85 transition-colors duration-200 hover:text-white";

export function Footer() {
  return (
    /* Phase 14 P2-04 — 본문 navy-900 다크 섹션과 시각 분리.
       배경 navy-950(#081427) 한 단계 더 깊게 + 상단 hairline 1px */
    <footer
      data-surface="dark"
      className="border-t border-white/[0.06] bg-navy-950 text-white"
    >
      <Container as="div" className="pt-12 pb-10 md:pt-20">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[1.4fr_1px_1fr_1px_1.1fr] lg:gap-12">
          {/* KB GROUP intro */}
          <div>
            <p className="eyebrow text-accent-300">
              KB DEVELOPMENT CO.,LTD.
            </p>
            <h3 className="mt-3 text-[20px] font-bold tracking-tight text-white">
              (주)케이비개발
            </h3>
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-white/85">
              {company.tagline}로서 주택관리·위생청소·경비보안·시행건설을
              아우르는 종합 시설관리 서비스를 제공합니다.
            </p>
            <p className="mt-5 text-[13px] leading-relaxed text-white/70">
              {contact.address}
            </p>
          </div>

          {/* Phase 2.6 — Vertical divider (데스크탑만) */}
          <div
            aria-hidden="true"
            className="hidden lg:block"
            style={{ width: 1, backgroundColor: "rgba(255,255,255,0.08)" }}
          />

          {/* Sitemap */}
          <nav aria-label="사이트맵">
            <h3 className={COL_LABEL}>SITEMAP</h3>
            <ul className="space-y-3">
              {SITEMAP.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK_BASE}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Vertical divider */}
          <div
            aria-hidden="true"
            className="hidden lg:block"
            style={{ width: 1, backgroundColor: "rgba(255,255,255,0.08)" }}
          />

          {/* Contact */}
          <div>
            <h3 className={COL_LABEL}>CONTACT</h3>
            <ul className="space-y-3 text-[14px]">
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-[12px] uppercase tracking-[0.12em] text-accent-300">
                  TEL
                </span>
                <a href={`tel:${contact.phone}`} className={LINK_BASE}>
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-[12px] uppercase tracking-[0.12em] text-accent-300">
                  FAX
                </span>
                <span className="text-white/75">{contact.fax}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-[12px] uppercase tracking-[0.12em] text-accent-300">
                  EMAIL
                </span>
                <a href={`mailto:${contact.email}`} className={LINK_BASE}>
                  {contact.email}
                </a>
              </li>
              <li className="pt-5">
                {/* Phase 2.7 — 상담 신청 CTA 메인 동일 사이즈 (h-14 / px-8) */}
                <a
                  href={`mailto:${contact.email}?subject=${encodeURIComponent("[케이비개발] 사업 상담 문의")}`}
                  className="btn-reset inline-flex h-14 items-center gap-2 rounded-sm bg-accent-500 px-8 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[var(--shadow-cta)]"
                >
                  상담 신청 <span aria-hidden="true">→</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t border-white/10 pt-8">
          {/* Phase 14 P1-10 — 약관·개인정보처리방침 링크 */}
          <nav aria-label="법적 고지" className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <Link
              href="/privacy"
              className="font-semibold text-white/90 underline-offset-4 hover:text-accent-300 hover:underline"
            >
              개인정보처리방침
            </Link>
            <span aria-hidden="true" className="text-white/30">·</span>
            <Link
              href="/terms"
              className="font-medium text-white/75 underline-offset-4 hover:text-accent-300 hover:underline"
            >
              이용약관
            </Link>
          </nav>
          <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-white/70 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p>
                {company.legalName} · 대표 {company.ceo} · 사업자등록번호{" "}
                {company.businessNumber}
              </p>
              <p>
                개인정보보호책임자 {contact.privacyOfficer.name} (
                {contact.privacyOfficer.phone})
              </p>
            </div>
            <p>
              {/* Phase 13 P1-I — 회사 설립 연도(2013) ~ 현재 동적 표기 */}
              © {company.foundedYear}–{new Date().getFullYear()}{" "}
              {company.brandName}. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
