import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/* Phase 10 P2-06/07/08 — OG·favicon·브랜드 명칭 표준 메타
   brand: KB GROUP / legal: (주)케이비개발 / 영문 legal: KB DEVELOPMENT CO., LTD. */
const SITE_URL = "https://kbgroup-renewal.vercel.app";
const SITE_TITLE = "KB GROUP | (주)케이비개발";
const SITE_DESC =
  "신뢰받는 종합 시설관리 파트너 — 시설관리·위생청소·경비보안·시행건설 B2B 전문 서비스. 광주광역시 광산구 월계로 223-22.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE + " — 시설관리·위생청소·경비보안·시행건설",
    template: "%s | KB GROUP",
  },
  description: SITE_DESC,
  metadataBase: new URL(SITE_URL),
  applicationName: "KB GROUP",
  authors: [{ name: "(주)케이비개발", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "케이비개발",
    "KB GROUP",
    "KB DEVELOPMENT",
    "시설관리",
    "위탁관리",
    "주택관리업",
    "경비보안",
    "위생청소",
    "방역소독",
    "저수조청소",
    "수목치료",
    "광주 시설관리",
    "LH 주택관리",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "KB GROUP",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [
      {
        url: "/images/company/p04_05.jpeg",
        width: 1080,
        height: 1080,
        alt: "(주)케이비개발 본사 외관",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/images/company/p04_05.jpeg"],
  },
  icons: {
    icon: [
      { url: "/images/company/kb-mark.png", type: "image/png" },
    ],
    apple: [
      { url: "/images/company/kb-mark.png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ko" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-ink-strong">
        <Header isAuthed={!!user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
