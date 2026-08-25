"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui";
import type { SettingValue } from "@/lib/content";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Phase 14-M (2026-05-20) — 본사 핀 좌표 정정.
   클라 제보: 기존 좌표(35.17672, 126.80854)는 909번 건물 인근 — 약 4km 남서쪽으로 어긋남.
   정정: 윤진리안채(월계로 223-22, 쌍암동 694-71 추정) 실제 좌표로 교체.
   검증: OpenStreetMap Nominatim에서 인접 월계로 223-20(첨단도휘에드가2차) 좌표 확보 →
        35.215202, 126.850066. 윤진리안채는 같은 도로 짝수측 옆 건물(거리 약 10m).

   Phase 14-N (2026-05-21) — 카카오·네이버 외부 링크는 도로명 주소 검색 방식으로 변경.
   기존 link/map?coord 방식이 임시 좌표(0~10m 어긋남)에 의존해 클라 PC에서 인접 건물(도휘에드가) 입구로 잡힘 →
   주소 검색이면 카카오/네이버 자체 POI DB가 정확한 윤진리안채로 매칭. 임베드 좌표는 보존. */
const COORD_LAT = 35.2152;
const COORD_LON = 126.8502;
const BBOX_DELTA = 0.004;

/** 연락처는 app/about/location/page.tsx 가 콘텐츠 어댑터에서 읽어 주입한다 (PLAN B / DAY 4). */
export function LocationMap({ contact }: { contact: SettingValue<"contact"> }) {
  const shouldReduce = useReducedMotion() ?? false;
  /* 도로명 주소를 기본 검색 쿼리로 사용. non-breaking hyphen → 일반 hyphen 정규화 후 query화 */
  const plainAddress = contact.address.replace("‑", "-");
  /* 카카오: 도로명 주소 검색 — 카카오 POI DB가 정확한 건물 매칭 */
  const kakaoUrl = `https://map.kakao.com/?q=${encodeURIComponent(plainAddress)}`;
  /* 네이버: 윤진리안채 빌딩명 제거. 도로명 주소 + 회사명 결합 (네이버에 윤진리안채 POI 미등록) */
  const naverQuery = `${plainAddress} (주)케이비개발`;
  const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(naverQuery)}?c=${COORD_LON},${COORD_LAT},18,0,0,0,dh`;
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
