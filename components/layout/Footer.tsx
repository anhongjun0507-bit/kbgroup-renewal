import Link from "next/link";
import { Container } from "@/components/ui";
import { company, contact } from "@/data/site-content";

const SITEMAP = [
  { label: "회사소개", href: "/about" },
  { label: "사업영역", href: "/business" },
  { label: "관리현황", href: "/cases" },
  { label: "인허가·인증", href: "/licenses" },
  { label: "채용", href: "/careers" },
  { label: "소식", href: "/notices" },
];

const COL_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 mb-5";
const LINK_BASE =
  "text-[14px] leading-relaxed text-white/75 transition-colors duration-200 hover:text-white";

export function Footer() {
  return (
    <footer className="bg-ink-strong text-white">
      <Container as="div" className="pt-14 pb-10 md:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          {/* KB GROUP intro */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              KB DEVELOPMENT CO.,LTD.
            </p>
            <h3 className="mt-2 text-[20px] font-bold tracking-[-0.02em] text-white">
              (주)케이비개발
            </h3>
            <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-white/75">
              {company.tagline}로서 주택관리·위생청소·경비보안·시행건설을
              아우르는 종합 시설관리 서비스를 제공합니다.
            </p>
            <p className="mt-5 text-[13px] leading-relaxed text-white/55">
              {contact.address}
            </p>
          </div>

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

          {/* Contact */}
          <div>
            <h3 className={COL_LABEL}>CONTACT</h3>
            <ul className="space-y-3 text-[14px]">
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-[11px] uppercase tracking-[0.15em] text-white/50">
                  TEL
                </span>
                <a href={`tel:${contact.phone}`} className={LINK_BASE}>
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-[11px] uppercase tracking-[0.15em] text-white/50">
                  FAX
                </span>
                <span className="text-white/60">{contact.fax}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-[11px] uppercase tracking-[0.15em] text-white/50">
                  EMAIL
                </span>
                <a href={`mailto:${contact.email}`} className={LINK_BASE}>
                  {contact.email}
                </a>
              </li>
              <li className="pt-4">
                <a
                  href={`mailto:${contact.email}?subject=${encodeURIComponent("[케이비개발] 사업 상담 문의")}`}
                  className="inline-flex items-center gap-1.5 bg-accent px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-accent-hover"
                >
                  상담 신청 <span aria-hidden="true">→</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-white/55 md:flex-row md:items-center md:justify-between">
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
              © {new Date().getFullYear()} {company.brandName}. All rights
              reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
