import { Hero } from "@/components/sections/Hero";
import { DataCounter } from "@/components/sections/DataCounter";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { Cases } from "@/components/sections/Cases";
import { Partners } from "@/components/sections/Partners";
import { ContactForm } from "@/components/sections/common/ContactForm";

export default function Home() {
  return (
    <>
      <Hero />
      <DataCounter />
      <ServiceCategories />
      <Cases />
      <Partners />
      <ContactForm context="홈 — 사업 상담 문의" />
    </>
  );
}
