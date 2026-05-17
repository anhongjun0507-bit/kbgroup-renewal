"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";

/* Phase 8 — 현장 갤러리 (PDF p12~17 단지 사진 12장)
   특정 단지명 매핑 X — "케이비개발 운영 단지 전반" 갤러리 톤 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* Phase 14-K K-6 — aspect ratio 4/5·3/4 혼재 → 4/5 통일 (한 가지 비율로 그리드 정렬) */
const PHOTOS = [
  "/images/cases/p12_12.jpeg",
  "/images/cases/p13_09.jpeg",
  "/images/cases/p15_07.jpeg",
  "/images/cases/p17_10.jpeg",
  "/images/cases/p12_02.jpeg",
  "/images/cases/p13_07.jpeg",
  "/images/cases/p15_04.jpeg",
  "/images/cases/p16_12.jpeg",
  "/images/cases/p12_06.jpeg",
  "/images/cases/p15_13.jpeg",
  "/images/cases/p17_11.jpeg",
  "/images/cases/p17_13.jpeg",
];

export function CasesPhotoGallery() {
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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.04 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.6, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="cases-photo-gallery-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          className="mb-12"
        >
          <Heading
            kicker="ON-SITE GALLERY"
            title="현장 갤러리"
            italicWord="현장"
            subtitle="케이비개발이 직접 운영하는 단지의 실제 모습. 광주부터 서울·경기·충청·전라까지 73개 단지의 일상을 책임집니다."
            align="left"
            size="md"
            as="h2"
          />
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
        >
          {PHOTOS.map((src) => (
            <motion.li
              key={src}
              variants={itemVariants}
              className="group aspect-[4/5] overflow-hidden rounded-md border border-line bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="케이비개발 운영 단지"
                className="block h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease)] group-hover:scale-[1.04]"
                loading="lazy"
              />
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
