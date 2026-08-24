-- =============================================================================
-- 20260824000007_content_storage_buckets.sql
-- PLAN B / DAY 1 — 관리자 콘텐츠 업로드용 Storage 버킷 2종.
-- 기존 gallery·resources 버킷과 정책은 건드리지 않는다.
-- E-4: next.config.ts images.remotePatterns 에 프로젝트 Storage 호스트를 이미 등록했다.
-- E-11: 서버 리사이즈·WebP 자동 변환은 범위 밖. 원본 그대로 저장한다.
-- =============================================================================

-- site-images: 단지 사진·현장 사진·로고·인물 (10MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images', 'site-images', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- site-videos: 메인 히어로 영상 교체용 (50MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-videos', 'site-videos', true, 52428800,
  array['video/mp4','video/webm']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- Storage RLS — SELECT 공개, 쓰기는 admin 만 (기존 버킷 정책과 동일 원칙)
-- -----------------------------------------------------------------------------
create policy storage_site_images_select
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-images');

create policy storage_site_images_admin_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

create policy storage_site_images_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());

create policy storage_site_images_admin_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

create policy storage_site_videos_select
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-videos');

create policy storage_site_videos_admin_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-videos' and public.is_admin());

create policy storage_site_videos_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-videos' and public.is_admin())
  with check (bucket_id = 'site-videos' and public.is_admin());

create policy storage_site_videos_admin_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-videos' and public.is_admin());
