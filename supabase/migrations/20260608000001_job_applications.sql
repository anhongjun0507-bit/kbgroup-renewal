-- =============================================================================
-- 20260608000001_job_applications.sql
-- 채용 지원/문의 접수 테이블 + RLS
--
-- 목적: /careers/openings 공고에 대한 지원·문의를 DB에 저장하고
--       관리자 페이지(/admin)에서 조회·상태 관리한다.
--
-- 원칙:
--   - INSERT: 익명 포함 누구나 (비로그인 지원 허용)
--   - SELECT/UPDATE/DELETE: admin만 (public.is_admin())
-- =============================================================================

create table public.job_applications (
  id            uuid primary key default gen_random_uuid(),
  -- 지원 대상 공고 (data/site-content.ts jobOpenings.id). 일반 문의는 null 가능
  opening_id    text,
  -- 접수 시점의 공고명 스냅샷 (공고가 바뀌어도 기록 보존)
  opening_title text,
  name          text not null,
  phone         text not null,
  email         text,
  message       text,
  status        text not null default 'new'
                  check (status in ('new','reviewing','done','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index job_applications_created_idx on public.job_applications(created_at desc);
create index job_applications_status_idx  on public.job_applications(status);

create trigger job_applications_set_updated_at
  before update on public.job_applications
  for each row execute function public.set_updated_at();

alter table public.job_applications enable row level security;

-- 익명 포함 누구나 지원/문의 접수 가능
create policy job_applications_insert_anyone
  on public.job_applications for insert
  to anon, authenticated
  with check (true);

-- 조회·수정·삭제는 admin 전용
create policy job_applications_select_admin
  on public.job_applications for select
  to authenticated
  using (public.is_admin());

create policy job_applications_update_admin
  on public.job_applications for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy job_applications_delete_admin
  on public.job_applications for delete
  to authenticated
  using (public.is_admin());
