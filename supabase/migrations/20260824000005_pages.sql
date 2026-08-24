-- =============================================================================
-- 20260824000005_pages.sql
-- PLAN B / DAY 1 — ITEM 03 「페이지 공개·비공개 전환」.
-- 계약 범위는 "기존 페이지의 노출 토글"까지다. 페이지 신규 생성은 범위 밖이므로
-- path 는 코드에 실재하는 라우트만 시드하며, 관리자 UI 는 is_published 토글만 노출한다.
-- =============================================================================

create table public.pages (
  id           uuid primary key default gen_random_uuid(),
  path         text not null unique check (path like '/%' or path = '/'),
  title        text not null default '',
  is_published boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index pages_published_idx on public.pages(is_published, sort_order);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

alter table public.pages enable row level security;

create policy pages_select_public
  on public.pages for select
  to anon, authenticated
  using (true);

create policy pages_admin_insert
  on public.pages for insert
  to authenticated
  with check (public.is_admin());

create policy pages_admin_update
  on public.pages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy pages_admin_delete
  on public.pages for delete
  to authenticated
  using (public.is_admin());
