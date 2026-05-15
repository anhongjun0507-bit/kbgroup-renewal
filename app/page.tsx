import { Hero } from "@/components/sections/Hero";
import { DataCounter } from "@/components/sections/DataCounter";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { Cases } from "@/components/sections/Cases";
import { Partners } from "@/components/sections/Partners";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <DataCounter />
      <ServiceCategories />
      <Cases />
      <Partners />
      <CTA />
    </>
  );
}
