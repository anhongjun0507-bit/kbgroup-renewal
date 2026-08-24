-- =============================================================================
-- 20260824000004_nav_items.sql
-- PLAN B / DAY 1 — ITEM 03 「메뉴 관리」. 헤더/푸터 네비게이션 항목.
--
-- label / kr_label : Header.tsx 는 영문 라벨과 한글 라벨을 함께 쓴다. 둘 다 보관.
-- parent_id        : 2단 드롭다운. self-reference, 부모 삭제 시 자식도 삭제.
-- location         : 'header' | 'footer'
-- E-2: Header.tsx("use client", 561줄)는 내부 로직 무수정. 이 테이블 값은 프롭으로만 주입한다.
-- =============================================================================

create table public.nav_items (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid references public.nav_items(id) on delete cascade,
  location   text not null default 'header' check (location in ('header','footer')),
  label      text not null check (char_length(label) between 1 and 100),
  kr_label   text,
  href       text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nav_items_location_idx on public.nav_items(location, sort_order, id);
create index nav_items_parent_idx   on public.nav_items(parent_id);

create trigger nav_items_set_updated_at
  before update on public.nav_items
  for each row execute function public.set_updated_at();

alter table public.nav_items enable row level security;

create policy nav_items_select_public
  on public.nav_items for select
  to anon, authenticated
  using (true);

create policy nav_items_admin_insert
  on public.nav_items for insert
  to authenticated
  with check (public.is_admin());

create policy nav_items_admin_update
  on public.nav_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy nav_items_admin_delete
  on public.nav_items for delete
  to authenticated
  using (public.is_admin());
