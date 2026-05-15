import Link from "next/link";
import { Container } from "@/components/ui";
import { company, contact } from "@/data/site-content";

const SITEMAP = [
  { label: "회사소개", href: "/about" },
  { label: "사업영역", href: "/business" },
  { label: "관리현황", href: "/cases" },
  { label: "인허가·인증", href: "/licenses" },
  { label: "채용", href: "/careers" },
];

const COL_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-5";
const LINK_BASE =
  "text-sm leading-relaxed text-white/70 transition-colors duration-200 hover:text-white";

export function Footer() {
  return (
    <footer className="bg-ink-strong text-white">
      <Container as="div" className="pt-20 pb-10 md:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          {/* KB GROUP intro */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-secondary" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
              (주)케이비개발
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {company.tagline}로서 주택관리·위생청소·경비보안·시행건설을
              아우르는 종합 시설관리 서비스를 제공합니다.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
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
              <li className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white"
                >
                  LOGIN <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-3 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
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
            <p className="font-medium">
              © {new Date().getFullYear()} {company.brandName}. All rights
              reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
