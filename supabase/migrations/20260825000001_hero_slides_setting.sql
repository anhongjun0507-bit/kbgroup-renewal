-- =============================================================================
-- 20260825000001_hero_slides_setting.sql
-- PLAN B / DAY 6 — 메인 히어로 슬라이드(계약 ITEM 02)를 site_settings 18번째 키로 추가.
--
-- 값은 `data/site-content.ts` 의 heroSlides 와 동일하다 (기존 Hero.tsx 모듈 상수 SLIDES 원본).
-- 영상 5 + 사진 3 = 8슬라이드. src·poster 는 로컬 경로(/images/...)와 Storage 공개 URL 을 모두 받는다.
-- public/images 190MB 는 마이그레이션하지 않는다 (범위 밖) — 로컬 경로 그대로 시작한다.
--
-- 이미 있으면 건드리지 않는다(do nothing). 관리자가 슬라이드를 바꾼 뒤 이 파일이 다시 돌아도
-- 편집 결과를 파일 원본으로 되돌리면 안 되기 때문이다.
-- =============================================================================

insert into public.site_settings (key, value, description)
values (
  'heroSlides',
  '[
    {"type":"video","src":"/images/hero/video-01.mp4","poster":"/images/hero/slide-01.png","alt":"케이비개발 시설관리 현장 01"},
    {"type":"video","src":"/images/hero/video-02.mp4","poster":"/images/hero/slide-02.png","alt":"케이비개발 시설관리 현장 02"},
    {"type":"video","src":"/images/hero/video-03.mp4","poster":"/images/hero/slide-03.png","alt":"케이비개발 시설관리 현장 03"},
    {"type":"video","src":"/images/hero/video-04.mp4","poster":"/images/hero/slide-04.png","alt":"케이비개발 시설관리 현장 04"},
    {"type":"video","src":"/images/hero/video-05.mp4","poster":"/images/hero/slide-05.png","alt":"케이비개발 시설관리 현장 05"},
    {"type":"image","src":"/images/hero/slide-06.png","alt":"주택관리 현장"},
    {"type":"image","src":"/images/hero/slide-07.png","alt":"위생청소 현장"},
    {"type":"image","src":"/images/hero/slide-08.png","alt":"경비보안 현장"}
  ]'::jsonb,
  '메인 히어로 슬라이드 (영상·사진 혼합, 순서가 곧 재생 순서)'
)
on conflict (key) do nothing;
