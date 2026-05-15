"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { Container } from "@/components/ui";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// TODO: KakaoMap JS SDK 연동
// 1. NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수 설정
// 2. <Script src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`} />로 SDK 로드
// 3. useEffect로 map 인스턴스 생성 + 마커 추가
// 좌표 변환: 광주광역시 광산구 월계로 223-22 → 카카오 지오코딩 API
export function LocationMap() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section
      aria-label="본사 위치 지도"
      className="bg-cream py-12 md:py-16"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduce ? 0 : 0.8,
            ease: EASE_OUT_EXPO,
          }}
        >
          <div
            role="img"
            aria-label="본사 위치 지도 (카카오맵 연동 예정)"
            className="relative aspect-[16/9] bg-beige"
          >
            <span className="absolute inset-0 flex items-center justify-center text-center font-serif text-base italic text-ink-muted md:text-lg">
              MAP · 카카오맵 연동 예정
            </span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
