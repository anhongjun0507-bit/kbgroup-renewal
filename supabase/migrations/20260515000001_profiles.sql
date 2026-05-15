-- =============================================================================
-- 001_profiles.sql
-- profiles 테이블 + auth.users 연동 트리거 + 공용 헬퍼 함수 (set_updated_at, is_admin)
-- 개인정보 최소 수집 원칙: phone·avatar_url 등은 추후 필요 시 ALTER TABLE
-- =============================================================================

-- updated_at 자동 갱신 (다른 테이블에서도 재사용)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- profiles: auth.users 1:1 확장
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  role         text not null default 'user' check (role in ('user','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auth.users INSERT → profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- role 변경은 admin만 (본인 셀프-승격 방지)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role is distinct from new.role then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'role 변경 권한 없음';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- is_admin(): RLS 정책 내부에서 재사용. SECURITY DEFINER + 빈 search_path로 안전.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
