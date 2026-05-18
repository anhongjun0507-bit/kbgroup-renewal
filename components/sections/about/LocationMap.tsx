"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Phase 14-B B-2 + Phase 14-L (2026-05-18) — 본사 핀 위치 정밀 보정.
   사용자 hwpx 요청: 네이버맵 주소 검색 시 "월계로 223-7 (미르채프라자)"로 잘못 떨어지는 문제.
   대응:
   1) OSM 임베드는 정밀 좌표(35.17672, 126.80854)로 직접 마커 고정 — 실제 본사 빌딩(윤진리안채) 위치.
   2) 외부 지도 링크는 주소 + 건물명 + 회사명을 결합한 쿼리로 변경하여 더 정확한 POI 매칭.
   3) 네이버는 coord 기반 c 파라미터로 지도 중심을 명시. */
const COORD_LAT = 35.17672;
const COORD_LON = 126.80854;
const BBOX_DELTA = 0.005;

export function LocationMap() {
  const shouldReduce = useReducedMotion() ?? false;
  /* 네이버·카카오 검색 쿼리는 회사명을 포함해 동음 주소(미르채프라자 223-7) 오매칭 방지 */
  const searchQuery = encodeURIComponent(
    `(주)케이비개발 ${contact.address.replace("‑", "-")}`,
  );
  const kakaoUrl = `https://map.kakao.com/link/map/케이비개발,${COORD_LAT},${COORD_LON}`;
  const naverUrl = `https://map.naver.com/v5/search/${searchQuery}?c=${COORD_LON},${COORD_LAT},18,0,0,0,dh`;
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
