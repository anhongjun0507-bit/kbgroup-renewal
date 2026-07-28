-- =============================================================================
-- 20260728000001_member_approval.sql
-- 회원 가입 승인제:
--   - profiles.status ('pending' | 'approved' | 'rejected') 추가
--   - 기존 회원 전원 'approved' 백필 (승인제는 이 마이그레이션 이후 신규 가입부터 적용)
--   - status 변경은 admin만 (셀프-승인 차단) — prevent_role_change와 동일 패턴
-- 재실행 안전(idempotent): 백필은 컬럼 최초 생성 시 1회만 수행된다.
-- =============================================================================

-- 1) status 컬럼 + 최초 생성 시에만 기존 회원 전원 승인 백필.
--    (백필은 아래 prevent_status_change 트리거 생성 '전'에 끝나야 한다 —
--     트리거가 auth.uid()를 검사하므로 SQL Editor 컨텍스트에선 통과 못 함.
--     DO 블록 안에서 컬럼 추가 직후 UPDATE 하므로 트리거가 아직 없어 안전.)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name  = 'profiles'
      and column_name = 'status'
  ) then
    alter table public.profiles
      add column status text not null default 'pending';

    -- 기존 회원은 모두 승인 처리 (관리자 포함) → 잠금 방지
    update public.profiles set status = 'approved';
  end if;
end $$;

-- 2) 허용값 제약 (idempotent)
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- 3) 승인 대기 조회용 인덱스
create index if not exists profiles_status_idx on public.profiles(status);

-- 4) status 변경은 admin만 (본인 셀프-승인 차단)
create or replace function public.prevent_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'status 변경 권한 없음';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_status_change on public.profiles;
create trigger profiles_prevent_status_change
  before update on public.profiles
  for each row execute function public.prevent_status_change();
