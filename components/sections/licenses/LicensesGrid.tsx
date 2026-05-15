"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { licenses, type License } from "@/data/site-content";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function LicensesGrid() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="licenses-grid-heading"
      className="bg-beige py-32 md:py-40"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="LICENSES"
            title="보유 인허가"
            italicWord="인허가"
            subtitle={`법적으로 등록된 ${licenses.length}종의 사업 자격`}
            align="left"
            size="md"
            as="h2"
            className="mb-16"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="border-b border-line"
        >
          {licenses.map((license, i) => (
            <LicenseItem
              key={license.name}
              license={license}
              index={i}
              variants={itemVariants}
            />
          ))}
        </motion.ul>
      </Container>

      <span id="licenses-grid-heading" className="sr-only">
        보유 인허가
      </span>
    </section>
  );
}

function LicenseItem({
  license,
  index,
  variants,
}: {
  license: License;
  index: number;
  variants: Variants;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.li
      variants={variants}
      className="group border-t border-line transition-colors duration-500 ease-out hover:bg-cream/50"
    >
      <div className="grid grid-cols-12 items-baseline gap-6 py-8 lg:gap-12 lg:py-10">
        <div className="col-span-2 lg:col-span-1">
          <span
            aria-hidden="true"
            className="block font-serif text-2xl italic leading-none text-primary transition-transform duration-500 ease-out group-hover:translate-x-1 lg:text-3xl"
          >
            {num}
          </span>
        </div>
        <div className="col-span-10 lg:col-span-7">
          <h3 className="font-serif text-xl font-bold leading-tight tracking-[-0.01em] text-ink md:text-2xl">
            {license.name}
          </h3>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:text-right">
          <p className="text-sm text-ink">{license.issuer}</p>
          {license.acquiredAt && (
            <p className="mt-1 text-xs font-medium tracking-[0.1em] text-ink-muted">
              취득 {license.acquiredAt}
            </p>
          )}
        </div>
      </div>
    </motion.li>
  );
}
