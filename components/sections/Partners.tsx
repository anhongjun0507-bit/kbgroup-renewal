"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { partners, type Partner } from "@/data/site-content";
import { cn } from "@/lib/cn";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SECTION_TITLE = "함께하는 파트너";
const SECTION_ITALIC = "파트너";
const FOOTER_TEXT = "지속적으로 신뢰를 쌓아가는 파트너십";

export function Partners() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="partners-heading"
      className="bg-beige py-24 md:py-32"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="TRUSTED PARTNERS"
            title={SECTION_TITLE}
            italicWord={SECTION_ITALIC}
            align="center"
            size="sm"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-12 gap-y-16 md:grid-cols-4">
          {partners.map((partner, idx) => (
            <PartnerItem
              key={partner.name}
              partner={partner}
              index={idx}
              shouldReduce={shouldReduce}
            />
          ))}
        </ul>

        <div className="mt-20 text-center">
          <div className="mx-auto mb-6 h-px w-12 bg-gold" aria-hidden="true" />
          <p className="font-serif text-base italic text-ink-soft">
            {FOOTER_TEXT}
          </p>
        </div>
      </Container>

      <span id="partners-heading" className="sr-only">
        {SECTION_TITLE}
      </span>
    </section>
  );
}

function PartnerItem({
  partner,
  index,
  shouldReduce,
}: {
  partner: Partner;
  index: number;
  shouldReduce: boolean;
}) {
  const isPlaceholder = partner.placeholder === true;
  return (
    <motion.li
      initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: shouldReduce ? 0 : 0.6,
        delay: shouldReduce ? 0 : index * 0.08,
        ease: EASE_OUT_EXPO,
      }}
      className="group flex items-center justify-center"
    >
      <div
        className={cn(
          "flex h-20 items-center justify-center px-3 text-center transition-all duration-500 ease-out",
          // 기본: 그레이스케일 + 반투명, hover 시 컬러 + -translate
          "grayscale [filter:grayscale(1)] opacity-50",
          !shouldReduce &&
            "group-hover:grayscale-0 group-hover:[filter:grayscale(0)] group-hover:opacity-100 group-hover:-translate-y-1",
          // placeholder는 더 흐릿하게
          isPlaceholder && "opacity-30",
          isPlaceholder && !shouldReduce && "group-hover:opacity-60",
        )}
      >
        <span className="font-serif text-lg font-bold text-ink md:text-xl">
          {partner.name}
          {isPlaceholder && (
            <span className="ml-1 text-xs font-medium text-ink-muted">
              (예정)
            </span>
          )}
        </span>
      </div>
    </motion.li>
  );
}
