import { Hero } from "@/components/sections/Hero";
import { TrustSignals } from "@/components/sections/TrustSignals";
import { DataCounter } from "@/components/sections/DataCounter";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { Cases } from "@/components/sections/Cases";
import { Partners } from "@/components/sections/Partners";
import { ContactInvite } from "@/components/sections/common/ContactInvite";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustSignals />
      <DataCounter />
      <ServiceCategories />
      <Cases />
      <Partners />
      <ContactInvite context="단지·시설 운영에 관한 모든 문의를 환영합니다" />
    </>
  );
}
