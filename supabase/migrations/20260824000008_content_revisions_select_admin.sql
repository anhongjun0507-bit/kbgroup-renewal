-- =============================================================================
-- 20260824000008_content_revisions_select_admin.sql
-- PLAN B / DAY 2 — content_revisions SELECT 를 admin 전용으로 좁힌다.
--
-- 근거: content_revisions 는 감사 테이블이다. 스냅샷 본문 자체는 어차피 공개 콘텐츠지만
--       actor_id(편집자 uuid)와 "누가 언제 무엇을 고쳤는가"라는 편집 이력이
--       익명 사용자에게 노출될 이유가 없다. (DAY 1 보고 §10-6 미결 1건 → 결정 1)
--
-- INSERT(admin)·DELETE(admin)·UPDATE 정책 없음(append-only)은 그대로 둔다.
-- =============================================================================

drop policy if exists content_revisions_select_public on public.content_revisions;

create policy content_revisions_select_admin
  on public.content_revisions for select
  to authenticated
  using (public.is_admin());
