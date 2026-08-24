-- =============================================================================
-- 20260824000002_site_settings.sql
-- PLAN B / DAY 1 — 비정형·단건 설정값 KV 저장소. 스키마 변경 없이 항목 추가 가능.
--
-- 담을 키 목록 (값은 data/site-content.ts 의 동명 export 를 JSON 으로 그대로 이관):
--   company            object  회사 개요(상호·대표·자본금·사업자번호·모토·goals·businessFields)
--   contact            object  연락처(전화·팩스·이메일·주소·영업시간·개인정보책임자·주차·정류장·버스)
--                              ※ address 에 non-breaking hyphen U+2011 포함 (E-10, 코드포인트 보존 필수)
--   ceoMessage         object  대표 인사말(작성자·직함·문단 배열)
--   counters           array   메인 DataCounter 항목. value(실제) / displayValue·displaySuffix(마케팅 표기) 분리
--   businessAreas      array   사업영역 5종 (id·slug·name·tagline·summary·highlights·subBusinesses·reasons)
--   coreValues         array   핵심가치
--   differentiators    array   차별점
--   processSteps       array   업무 프로세스 단계
--   companyStrengths   array   회사 강점 (카피에 "200+" 표기 포함)
--   partners           array   발주처·파트너사
--   collaborators      array   협력업체
--   licenses           array   인허가 9건
--   certifications     array   기술 인증·자격 27종
--   history            array   연혁 16건
--   organization       object  조직도 트리 { tree, branches }
--   relatedCompanies   array   계열사
--   stats              object  STATS 중 "마케팅 표기값"만 보관.
--                              activeComplexesDisplay(200) · lhProjectsDisplay(15) ·
--                              managedHouseholds · registeredLicenses · certificationTypes ·
--                              certifiedProfessionals · totalCertHolders
--                              ※ activeComplexes(실제 단지 수)는 여기 넣지 않는다. complexes 테이블에서 계산한다 (E-7).
--
-- E-9(JSONB 스키마 드리프트): 읽기 어댑터가 파싱 실패 시 파일 폴백한다. DB 는 형태를 강제하지 않는다.
-- =============================================================================

create table public.site_settings (
  key         text primary key check (char_length(key) between 1 and 100),
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy site_settings_select_public
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy site_settings_admin_insert
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

create policy site_settings_admin_update
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy site_settings_admin_delete
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());
