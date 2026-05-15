import Link from "next/link";
import { Container } from "@/components/ui";
import { company, contact } from "@/data/site-content";

const SITEMAP = [
  { label: "왜 케이비개발", href: "/about/why" },
  { label: "사업영역", href: "/business" },
  { label: "실적", href: "/cases" },
  { label: "인허가", href: "/licenses" },
  { label: "채용", href: "/careers" },
  { label: "소식", href: "/notices" },
];

const COL_LABEL =
  "text-xs font-medium uppercase tracking-[0.3em] text-gold mb-6";
const LINK_BASE =
  "text-sm leading-relaxed text-white/60 transition-colors duration-200 hover:text-white";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <Container as="div" className="pt-24 pb-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          {/* KB GROUP intro */}
          <div>
            <h3 className={COL_LABEL}>KB GROUP</h3>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              {company.tagline}로서 주택관리·위생청소·경비보안·시행건설을 아우르는
              종합 시설관리 서비스를 제공합니다.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-white/60">
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
            <ul className="space-y-3 text-sm">
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-xs uppercase tracking-[0.2em] text-white/40">
                  TEL
                </span>
                <a href={`tel:${contact.phone}`} className={LINK_BASE}>
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-xs uppercase tracking-[0.2em] text-white/40">
                  FAX
                </span>
                <span className="text-white/60">{contact.fax}</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-xs uppercase tracking-[0.2em] text-white/40">
                  EMAIL
                </span>
                <a href={`mailto:${contact.email}`} className={LINK_BASE}>
                  {contact.email}
                </a>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 text-xs uppercase tracking-[0.2em] text-white/40">
                  KAKAO
                </span>
                <span className="text-white/40">준비 중</span>
              </li>
              <li className="pt-3">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 border-b border-white/20 pb-0.5 text-sm text-white/80 transition-colors duration-200 hover:border-white hover:text-white"
                >
                  LOGIN
                  <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
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
