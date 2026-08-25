-- =============================================================================
-- 20260825000002_business_gallery_ceo_portrait.sql
-- PLAN B / DAY 6 — 이미지 업로더를 붙이기 위해 편집 대상이 아니던 사진 2곳을 설정으로 올린다.
--
--  1) businessGallery — 사업영역 상세 현장 사진 6장 (`BusinessSubServices` 모듈 상수 GALLERY_IMAGES)
--  2) ceoMessage.portrait — 대표 프로필 사진 (`CeoPortrait` 하드코딩 경로)
--
-- 값은 `data/site-content.ts` 원본과 같다. 관리자가 이미 바꿨을 수 있으므로
-- businessGallery 는 `do nothing`, ceoMessage 는 **portrait 키가 없을 때만** 덧붙인다.
-- =============================================================================

insert into public.site_settings (key, value, description)
values (
  'businessGallery',
  '[
    {"src":"/images/can/IMG_1489.PNG"},
    {"src":"/images/can/IMG_1490.PNG"},
    {"src":"/images/can/IMG_1491.PNG"},
    {"src":"/images/can/IMG_1492.PNG"},
    {"src":"/images/can/IMG_1493.PNG"},
    {"src":"/images/can/IMG_1494.PNG"}
  ]'::jsonb,
  '사업영역 상세 현장 사진 6장 (5개 영역 공용). alt 는 사업영역명에서 생성한다'
)
on conflict (key) do nothing;

-- ceoMessage 는 기존 값(인사말 본문)을 보존한 채 portrait 만 덧붙인다.
update public.site_settings
   set value = value || '{"portrait":"/images/company/ceo-portrait.png"}'::jsonb
 where key = 'ceoMessage'
   and not (value ? 'portrait');
