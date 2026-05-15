-- =============================================================================
-- 003_attachments.sql
-- attachments 테이블 + 게시판별 첨부 수 강제 트리거
-- 정책:
--   notice    : 이미지·PDF / 5MB / 3개
--   gallery   : jpg·png·webp / 5MB / 10개
--   news      : 이미지·PDF / 5MB / 3개
--   resources : PDF·xlsx·docx·hwp / 10MB / 1개
-- 파일 크기·MIME은 Storage 버킷 설정으로, 개수는 이 트리거에서 강제.
-- 갤러리 대표 이미지 = 최소 display_order (0-indexed).
-- =============================================================================

create table public.attachments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  bucket        text not null check (bucket in ('gallery','resources')),
  storage_path  text not null,
  file_name     text not null,
  file_size     bigint not null check (file_size > 0),
  mime_type     text not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at    timestamptz not null default now()
);

create index attachments_post_order_idx
  on public.attachments(post_id, display_order);

-- 게시판별 첨부 수 제한 강제
create or replace function public.check_attachment_count()
returns trigger
language plpgsql
as $$
declare
  v_board_type text;
  v_count      int;
  v_limit      int;
begin
  select board_type into v_board_type
    from public.posts where id = new.post_id;

  if v_board_type is null then
    raise exception '대상 post가 존재하지 않습니다: %', new.post_id;
  end if;

  v_limit := case v_board_type
    when 'notice'    then 3
    when 'gallery'   then 10
    when 'news'      then 3
    when 'resources' then 1
  end;

  select count(*) into v_count
    from public.attachments where post_id = new.post_id;

  if v_count >= v_limit then
    raise exception '게시판 %의 최대 첨부 수 % 초과', v_board_type, v_limit;
  end if;

  return new;
end;
$$;

create trigger attachments_enforce_count
  before insert on public.attachments
  for each row execute function public.check_attachment_count();
