import { Hero } from "@/components/sections/Hero";
import { TrustSignals } from "@/components/sections/TrustSignals";
import { DataCounter } from "@/components/sections/DataCounter";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { Cases } from "@/components/sections/Cases";
import { Partners } from "@/components/sections/Partners";
import { ContactInvite } from "@/components/sections/common/ContactInvite";
import { FadeIn } from "@/components/ui";

export default function Home() {
  return (
    <>
      <Hero />
      <FadeIn as="div" distance={32} duration={800}>
        <TrustSignals />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <DataCounter />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <ServiceCategories />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <Cases />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <Partners />
      </FadeIn>
      <FadeIn as="div" distance={32} duration={800}>
        <ContactInvite context="단지·시설 운영에 관한 모든 문의를 환영합니다" />
      </FadeIn>
    </>
  );
}
