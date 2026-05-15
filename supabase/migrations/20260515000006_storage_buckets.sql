-- =============================================================================
-- 006_storage_buckets.sql
-- Storage 버킷 (gallery·resources) + Storage RLS
-- 원칙:
--   - 두 버킷 모두 public (자료실도 비로그인 SELECT 허용 결정)
--   - INSERT/UPDATE/DELETE는 admin 또는 해당 post의 author만
--   - 파일 크기·MIME 화이트리스트는 버킷 옵션으로 강제
-- =============================================================================

-- gallery 버킷: notice·gallery·news 첨부 (이미지·PDF 5MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery', 'gallery', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- resources 버킷: 자료실 전용 (문서 10MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources', 'resources', true, 10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/msword',
    'application/x-hwp',
    'application/haansofthwp',
    'application/vnd.hancom.hwp'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- Storage RLS
-- SELECT는 public 버킷이므로 익명 자동 허용. 명시 정책으로도 추가.
-- INSERT/UPDATE/DELETE는 admin만 (1차). 작성 단계에서 author 본인 업로드를 허용하려면
-- 향후 storage_path에 author_id를 인코딩한 후 정책을 확장 가능.
-- -----------------------------------------------------------------------------

-- 모두 익명 SELECT
create policy storage_gallery_select
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy storage_resources_select
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'resources');

-- INSERT/UPDATE/DELETE는 admin만 (1차 정책 — 게시글 작성 흐름에서 admin이 대표 업로드)
create policy storage_gallery_admin_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

create policy storage_gallery_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

create policy storage_gallery_admin_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

create policy storage_resources_admin_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'resources' and public.is_admin());

create policy storage_resources_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'resources' and public.is_admin())
  with check (bucket_id = 'resources' and public.is_admin());

create policy storage_resources_admin_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'resources' and public.is_admin());
