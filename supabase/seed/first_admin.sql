-- =============================================================================
-- seed/first_admin.sql — 첫 관리자 지정 템플릿
-- =============================================================================
-- 사용법:
--   1) Supabase Dashboard → Authentication → Users 에서 관리자로 쓸 이메일을 회원가입(또는 invite)
--      → handle_new_user 트리거가 profiles row를 자동 생성 (role='user')
--   2) 아래 'admin@example.com' 을 실제 이메일로 바꾼 뒤 SQL Editor에서 실행
--   3) 이 파일은 템플릿이므로 git에 커밋 시 실제 이메일을 박지 말 것 (placeholder 유지)
--
-- 안전장치:
--   - 존재하지 않는 이메일이면 NOTICE 출력 후 종료 (실수로 빈 업데이트 방지)
--   - 이미 admin이면 NOTICE 출력
-- =============================================================================

do $$
declare
  v_email   text := 'admin@example.com';   -- ← 여기 교체
  v_user_id uuid;
  v_role    text;
begin
  select id into v_user_id
    from auth.users
   where email = v_email;

  if v_user_id is null then
    raise notice '해당 이메일의 auth.users row가 없음: %  (먼저 회원가입 필요)', v_email;
    return;
  end if;

  select role into v_role
    from public.profiles
   where id = v_user_id;

  if v_role = 'admin' then
    raise notice '이미 admin: %', v_email;
    return;
  end if;

  -- prevent_role_change 트리거를 우회하려면 SECURITY DEFINER 함수가 필요하지만,
  -- 첫 admin은 SQL Editor (service_role)에서 실행되므로 RLS·트리거 무관.
  -- 다만 prevent_role_change는 auth.uid()를 검사하므로 SQL Editor에서는 통과 안 됨.
  -- 회피: 트리거 일시 disable → update → re-enable.
  alter table public.profiles disable trigger profiles_prevent_role_change;
  update public.profiles set role = 'admin' where id = v_user_id;
  alter table public.profiles enable trigger profiles_prevent_role_change;

  raise notice '첫 admin 지정 완료: %', v_email;
end $$;
