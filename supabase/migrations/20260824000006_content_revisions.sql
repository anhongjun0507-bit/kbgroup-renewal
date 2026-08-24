-- =============================================================================
-- 20260824000006_content_revisions.sql
-- PLAN B / DAY 1 — 변경 이력. 저장 직전 값의 스냅샷을 남겨 되돌리기·감사 추적에 쓴다.
-- 롤백 3단계 중 "특정 데이터만 잘못됨" 레벨의 복구 수단(PROGRESS §6 단계 3).
--
-- record_id 는 site_settings(키가 text PK)와 uuid PK 테이블을 함께 담아야 하므로 text 로 둔다.
-- 레코드당 최근 20개만 유지 (정리 트리거).
-- =============================================================================

create table public.content_revisions (
  id         uuid primary key default gen_random_uuid(),
  table_name text not null check (char_length(table_name) between 1 and 100),
  record_id  text not null,
  snapshot   jsonb not null,
  actor_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index content_revisions_record_idx
  on public.content_revisions(table_name, record_id, created_at desc);

-- (table_name, record_id) 당 최근 20개만 유지. INSERT 후 초과분을 정리한다.
create or replace function public.trim_content_revisions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.content_revisions r
  where r.table_name = new.table_name
    and r.record_id  = new.record_id
    and r.id not in (
      select id from public.content_revisions
      where table_name = new.table_name and record_id = new.record_id
      order by created_at desc, id desc
      limit 20
    );
  return null;
end;
$$;

create trigger content_revisions_trim
  after insert on public.content_revisions
  for each row execute function public.trim_content_revisions();

alter table public.content_revisions enable row level security;

create policy content_revisions_select_public
  on public.content_revisions for select
  to anon, authenticated
  using (true);

create policy content_revisions_admin_insert
  on public.content_revisions for insert
  to authenticated
  with check (public.is_admin());

-- UPDATE 정책 없음 = append-only (admin_logs 와 동일 원칙).
create policy content_revisions_admin_delete
  on public.content_revisions for delete
  to authenticated
  using (public.is_admin());
