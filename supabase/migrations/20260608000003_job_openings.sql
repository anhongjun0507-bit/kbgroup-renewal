-- =============================================================================
-- 20260608000003_job_openings.sql
-- 채용 공고를 코드(data/site-content.ts) → DB로 이전. 관리자 페이지에서 등록·관리.
--
-- is_published: "채용 페이지 노출 여부" 토글. true면 /careers·/careers/openings·
--               내비 드롭다운에 노출, false면 비공개(관리자만 조회).
-- RLS: 공개 SELECT는 is_published만, admin은 전체. 작성/수정/삭제는 admin만.
-- =============================================================================

create table public.job_openings (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 200),
  type            text not null default '수시채용',
  location        text not null default '',
  summary         text,
  responsibilities text[] not null default '{}',
  requirements    text[] not null default '{}',
  preferred       text[] not null default '{}',
  apply_method    text,
  apply_email     text,
  deadline        date,                         -- null = 상시채용
  posted_at       date not null default current_date,
  is_published    boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index job_openings_published_idx
  on public.job_openings(is_published, sort_order, created_at desc);

create trigger job_openings_set_updated_at
  before update on public.job_openings
  for each row execute function public.set_updated_at();

alter table public.job_openings enable row level security;

-- 공개 SELECT: 게시된 공고만. admin은 전체(비공개 포함).
create policy job_openings_select_public
  on public.job_openings for select
  to anon, authenticated
  using (is_published or public.is_admin());

-- 작성/수정/삭제는 admin만
create policy job_openings_insert_admin
  on public.job_openings for insert
  to authenticated
  with check (public.is_admin());

create policy job_openings_update_admin
  on public.job_openings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy job_openings_delete_admin
  on public.job_openings for delete
  to authenticated
  using (public.is_admin());
