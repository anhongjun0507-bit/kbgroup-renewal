"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Phase 14-B B-2 — 실제 지도 임베드 + 좌측 녹색 라인 제거.
   카카오·네이버맵은 X-Frame-Options 차단으로 iframe 임베드 불가 → OSM 사용.
   본사 좌표: 광주광역시 광산구 월계로 223-22 ≈ 35.1762°N, 126.8083°E
   기존 KB 3색(녹·골드·navy) 좌측 디바이더는 톤 충돌(브랜드는 navy+gold) → 단색 골드 1.5px */
const COORD_LAT = 35.1762;
const COORD_LON = 126.8083;
const BBOX_DELTA = 0.008;

export function LocationMap() {
  const shouldReduce = useReducedMotion() ?? false;
  const query = encodeURIComponent(contact.address);
  const kakaoUrl = `https://map.kakao.com/?q=${query}`;
  const naverUrl = `https://map.naver.com/v5/search/${query}`;
  const osmEmbed =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${COORD_LON - BBOX_DELTA},${COORD_LAT - BBOX_DELTA / 2}` +
    `,${COORD_LON + BBOX_DELTA},${COORD_LAT + BBOX_DELTA / 2}` +
    `&layer=mapnik&marker=${COORD_LAT},${COORD_LON}`;

  return (
    <section
      aria-label="본사 위치"
      className="bg-white py-12 md:py-16"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT }}
        >
          <div className="relative aspect-[16/9] overflow-hidden border border-line bg-gray-50">
            {/* 단색 골드 좌측 디바이더 */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 z-10 w-[3px] bg-accent-500"
            />

            {/* 실제 지도 임베드 — OSM */}
            <iframe
              src={osmEmbed}
              loading="lazy"
              title={`본사 위치 지도 — ${contact.address}`}
              className="absolute inset-0 h-full w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* 하단 오버레이 — 주소·CTA */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 bg-gradient-to-t from-navy-900/90 via-navy-900/60 to-transparent p-5 text-white md:flex-row md:items-end md:justify-between md:p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-300">
                  HEAD OFFICE
                </p>
                <p className="mt-1 text-[14px] font-medium md:text-[15px]">
                  {contact.address}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                <a
                  href={kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-reset inline-flex h-9 items-center rounded-sm border border-white/40 bg-white/10 px-3 text-white transition-colors hover:bg-white hover:text-ink-strong"
                >
                  카카오맵 <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={naverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-reset inline-flex h-9 items-center rounded-sm border border-white/40 bg-white/10 px-3 text-white transition-colors hover:bg-white hover:text-ink-strong"
                >
                  네이버맵 <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
