import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KB GROUP | (주)케이비개발 — 시설관리·위생청소·경비보안·시행건설",
  description:
    "신뢰받는 종합 시설관리 파트너 KB GROUP. 시설관리, 위생청소, 경비보안, 시행건설 등 B2B 전문 서비스를 제공합니다.",
  metadataBase: new URL("https://kbgroup-renewal.vercel.app"),
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
    <html lang="ko" className={`${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-ink-strong">
        <Header isAuthed={!!user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
