# PLAN B — 콘텐츠 관리(CMS) 전환 진행 문서

> 이 파일 하나만 읽고 STEP 2를 시작할 수 있도록 작성한다.
> 최종 갱신: 2026-08-25 (STEP 2 / DAY 5 완료 — §15 참조)
> 대상 저장소: `kbgroup-renewal` / Next.js 16.2.6 + React 19.2.4 + Supabase + Vercel

---

## 0. 현재 상태 한 줄

STEP 2 / DAY 5 완료. `site_settings` 잔여 12키(사업영역·인허가·인증·연혁·파트너·협력사·계열사·조직도·핵심가치·차별점·강점·프로세스) 편집 UI 신설 — 스키마 기반 범용 목록 편집기 1개 + 조직도 아웃라인 편집기. 소비처 전환 26파일로 **살아 있는 소비처 잔여 0**(사장 코드 4개 제외), §14-6 contact 미결 7개 전부 해소해 대표 전화 변경이 공개 페이지 14곳에 100% 반영됨을 실측. 회귀: SSR 텍스트 18경로 diff 0줄 · sitemap 191 URL 일치 · 조직도 노드 13 → 13 · 무변경 왕복 11/11. Pretendard 는 계약 범위 밖 별도 안건으로 기록(§15-0). 다음: DAY 8(섹션 표시·숨김/순서 + 페이지 공개·비공개).

## 1. 계약 범위 — 4개 영역 (견적서 원문)

> 출처: 견적서 PLAN B · 350,000원 SECTION 02 「작업 범위」 원문 그대로.
> 아래 문구 밖의 작업은 범위 밖이다. §3 범위 방어 목록과 함께 판단 기준으로 삼는다.

### ITEM 01 — 본문 콘텐츠 전체
> "Plan A의 모든 기능을 포함합니다."

- 전 페이지 텍스트 수정 (회사소개·사업영역·채용·인허가 등)
- 수치 데이터 수정 (세대수·단지 수·인허가·인력)
- 단지 정보 전체 관리 (추가·수정·삭제·LH 구분)
- 이미지 업로드·교체 (단지 사진·현장 사진·로고·인물)
- 회사 정보 수정 (주소·연락처·영업시간·이메일)

### ITEM 02 — 섹션 구성 관리 [PLAN B 전용]
> "페이지를 이루는 각 영역을 직접 켜고 끄고 옮길 수 있습니다."

- 섹션 표시 · 숨김 전환 (필요 없는 영역 감추기)
- 섹션 순서 변경 (위아래 배치 조정)
- 메인 페이지 구성 관리 (히어로 영상·사진 교체 포함)

### ITEM 03 — 메뉴 · 페이지 관리 [PLAN B 전용]
> "사이트 구조 자체를 관리자 페이지에서 조정합니다."

- 상단 메뉴 이름 변경 · 순서 조정
- 메뉴 표시 · 숨김 전환
- 푸터 정보 · 링크 관리
- 페이지 공개 · 비공개 전환

### ITEM 04 — 게시판 · 채용 관리 [PLAN B 전용]
> "운영 중 자주 바뀌는 항목을 직접 등록·관리합니다."

- 채용 공고 등록 · 수정 · 마감
- 게시판 카테고리 관리
- 공지 상단 고정 설정

### 계약 조건 (같은 견적서 SECTION 04)

| 항목 | 내용 |
|------|------|
| 금액 | 350,000원 (공급대가 단일 금액, 간이과세자로 부가세 별도 없음) |
| 작업 기간 | 입금 확인일로부터 10영업일 (자료 전달·피드백 지연 시간 제외) |
| 수정 횟수 | 납품 후 기능 수정 2회까지 본 금액에 포함 |
| 유지보수 | 납품 후 3개월간 오류·버그 수정 무상 |
| 사용 안내 | 관리자 페이지 사용 방법 안내 및 매뉴얼 제공 (무상) |

계약 문구 해석에 대한 확정 사항:
- "섹션 순서 변경"은 **위/아래 화살표 방식**으로 구현한다. 자유 DnD는 계약 요구가 아니며 범위 밖이다.
- "페이지 공개·비공개 전환"은 **기존 페이지의 노출 토글**까지다. 페이지 신규 생성은 포함하지 않는다.

---

## 2. 확정된 설계 결정

### 결정 1 — 일정: 10영업일 유지
- 근거: 자유 DnD를 범위에서 뺐으므로 10영업일 유지 가능.
- **DAY 1 캐시 API 검증 결과가 나오는 시점에 일정 재확인 보고**를 한다.

### 결정 2 — 저장소: 옵션 3 하이브리드 확정

정형 엔티티는 전용 테이블, 비정형/일회성 값은 KV(JSONB)로 나눈다.

| 테이블 | 역할 |
|--------|------|
| `complexes` | 단지 마스터. 기존 `complexes`(153건) + `pastComplexes`(19건)를 **한 테이블로 통합**하고 `is_active` 플래그로 현재/과거를 구분한다. 불변 `slug` 컬럼 보유(결정 3). |
| `site_settings` | `key TEXT PRIMARY KEY`, `value JSONB`. 회사 정보·연락처·CEO 인사말·STATS·counters 등 단건 설정값 보관. 스키마 변경 없이 항목 추가 가능. |
| `page_sections` | 페이지별 섹션의 표시·숨김(`is_visible`)과 순서(`sort_order`). 섹션 레지스트리 키를 참조한다. |
| `nav_items` | 헤더/푸터 네비게이션 항목. 라벨·href·부모 관계·순서·노출 여부. |
| `pages` | 페이지 마스터. 경로, 제목, 공개/비공개(`is_published`), SEO 메타. |
| `content_revisions` | 변경 이력. 저장 시 이전 값 스냅샷을 남겨 되돌리기·감사 추적에 사용. |

STATS 이원화 방침(채택 그대로 유지):
- **실제 count** — `complexes` 테이블에서 계산하는 값 (`activeComplexes` 등).
- **마케팅 표기값** — 관리자가 직접 넣는 값 (`activeComplexesDisplay: 200`, `lhProjectsDisplay: 15` 등). `site_settings`에 보관.
- 둘을 절대 한 필드로 합치지 않는다. 현재 `data/site-content.ts`의 `STATS` 주석이 이 구분을 이미 명시하고 있다.

### 결정 3 — 단지 URL: 불변 `slug` 컬럼 신설

- 현재 URL 생성 방식: `app/cases/[slug]/page.tsx:18` — `encodeURIComponent(c.name)`, 조회는 `decodeURIComponent(slug)`로 이름 역매핑.
- **시드 시 `slug` 값은 현재 `encodeURIComponent(단지명)` 결과와 코드포인트 단위로 완전 일치해야 한다. 기존 URL 1건도 바뀌면 안 된다.**
  - 한글 NFC/NFD 정규화 차이가 곧바로 URL 불일치로 이어지므로, 시드 스크립트는 코드포인트 비교 검증을 반드시 통과해야 한다(E-3).
- 관리자가 단지명을 변경해도 `slug`는 **자동으로 바뀌지 않는다.**
- `slug` 직접 수정 UI는 이번 범위에서 **제외**한다.
- 구 slug → 신 slug 리다이렉트 테이블도 **만들지 않는다.**

### 캐시 전략 — 분기 조건 포함 (추가 지시 1)

DAY 1에 Next 16.2.6의 캐시 API를 검증한 뒤 **둘 중 하나로 확정하고, 어느 쪽으로 갔는지 DAY 1 보고에 명시한다.**

**분기 A — `unstable_cache`를 그대로 쓸 수 있는 경우 (원안)**
- 데이터 리더를 `unstable_cache`로 감싸고 태그를 붙인다.
- 저장 시 해당 태그만 `revalidateTag()`로 무효화.

**분기 B — `cacheComponents` 전환이 필요하다고 판명된 경우 (폴백, 즉시 채택)**
- **전환을 시도하지 않는다.** 즉시 폴백으로 간다.
- 캐시 래핑 없이, 저장 성공 시 `revalidatePath("/", "layout")`로 광역 무효화.
- 근거: 전 라우트 렌더 모델 변경은 이번 계약 규모에서 감당할 리스크가 아니다. 즉시 반영만 보장되면 충분하다.

---

## 3. 범위 방어 — 이번 계약(PLAN B) 범위 밖

아래는 설계·구현에 **포함하지 않는다.** 필요해 보여도 임의로 넣지 않는다.
필요하다고 판단되면 **보고만 하고 결정을 기다린다.**

- [ ] 페이지 **신규 생성** 기능 (계약은 "페이지 공개·비공개 전환"까지)
- [ ] 이미지 서버 리사이즈 · WebP 자동 변환
- [ ] 자유 DnD 정렬
- [ ] slug 편집 · 리다이렉트 관리
- [ ] 다국어
- [ ] 기존 `public/images` 190MB 자산의 Supabase Storage 마이그레이션

---

## 4. DAY 1~10 일정표

| DAY | 작업 | 산출물 | 완료 |
|-----|------|--------|:----:|
| 1 | **Next 16 캐시 API 검증** (분기 A/B 확정) + 스키마 확정 + 일정 재확인 보고 | 캐시 분기 결론 보고, 확정 스키마 초안 | ☑ |
| 2 | 마이그레이션 SQL 6종 작성 + RLS 정책 | `supabase/migrations/*.sql` | ☑ (DAY 1 에 완료) |
| 3 | 시드 스크립트 작성 (`site-content.ts` → DB), **slug 코드포인트 일치 검증 포함** | `scripts/seed-content.ts`, 검증 리포트 | ☑ (실제 DAY 2) |
| 4 | 읽기 어댑터 (`lib/content/*`) — DB 리더 + 파일 폴백 + `CONTENT_SOURCE` 킬스위치 | `lib/content/` | ☐ |
| 5 | 관리자 UI — 단지 CRUD | `app/admin/content/complexes` | ☐ |
| 6 | 관리자 UI — 사이트 설정(`site_settings`) 편집 | `app/admin/content/settings` | ☐ |
| 7 | **회귀 베이스라인 캡처 → 섹션 레지스트리 전환 (11개 page.tsx) → 재캡처 비교** | 베이스라인/After 스크린샷 세트 | ☐ |
| 8 | 관리자 UI — 섹션 표시·숨김 / 순서(위·아래 화살표) + 페이지 공개·비공개 | `app/admin/content/sections`, `pages` | ☐ |
| 9 | 관리자 UI — 네비게이션 관리 + 변경 이력(`content_revisions`) 조회 | `app/admin/content/nav` | ☐ |
| 10 | 전체 회귀 · 프로덕션 배포 · 라이브 검증(증거 캡처) · 인수 문서 | 배포 + 검증 리포트 | ☐ |

---

## 5. 리스크 E-1 ~ E-14 (STEP 1 원문)

### 회귀 위험 (높음 순)

| ID | 지점 | 완화책 |
|----|------|--------|
| E-1 | `/cases/[slug]` URL = `encodeURIComponent(단지명)`. 관리자가 단지명을 수정하면 URL이 바뀌어 기존 링크·검색 색인 전부 404. 사이트맵도 변함 | 불변 `slug` 컬럼 신설, 최초 시드 때 현재 URL과 동일한 값으로 채움. 이름 수정이 URL에 영향 없게 분리 |
| E-2 | `Header.tsx`가 `"use client"`. framer-motion `LayoutGroup`·`usePathname` 의존이 561줄에 걸쳐 있어 잘못 건드리면 헤더 애니메이션 전체 파손 | 프롭 주입만 하고 내부 로직 무수정. `NAV_ITEMS` 상수 → 프롭 치환 1줄 단위 diff |
| E-3 | 11개 `page.tsx` 전면 재작성. `<FadeIn>` 래핑, 하드코딩 프롭(`context=`, `current=`) 누락 시 조용히 렌더 깨짐 | 전환 전후 스크린샷 비교. 레지스트리에 기본 프롭 필수 등록, 미등록 시 타입 에러 나도록 설계 |
| E-4 | `next.config.ts` 빈 상태. `remotePatterns` 없이 Storage URL을 `next/image`에 넣으면 500 | DAY 1 선처리 |
| E-5 | ~~정적→동적 전환 실수~~ **→ 사실상 해소 (DAY 1 실측, §10-4)**. 현재 app 라우트는 `/robots.txt`·`/sitemap.xml` 외 **전부 ƒ(Dynamic)** 이다. 원인은 `app/layout.tsx:119` 의 `supabase.auth.getUser()` (쿠키 접근)가 루트 레이아웃에 있어 모든 라우트를 동적화하기 때문. "19개 정적 페이지"는 사실이 아니었다 | 잃을 정적 페이지가 없으므로 캐시 래핑으로 인한 정적→동적 회귀는 발생할 수 없다. 다만 **매 요청이 렌더되므로 캐시(분기 A)의 가치는 원안보다 오히려 크다**. DAY 10 에 라우트 표 재비교는 그대로 유지 |

### 데이터 정합성 위험

| ID | 지점 | 완화책 |
|----|------|--------|
| E-6 | `counters[1]` 인덱스 하드코딩 invariant. 관리자가 카운터 순서를 바꾸면 엉뚱한 값을 비교 | 인덱스 → `key === "complexes"` 조회로 교체 |
| E-7 | `STATS` 수기값 ↔ 배열 실제값 이원화. 관리자가 단지를 추가·삭제해도 마케팅 수치는 자동으로 안 맞음 | 의도된 불일치임을 편집 UI에 명시 + 실제값/표기값을 나란히 노출, 괴리 시 경고 배너 |
| E-8 | 동시 편집 덮어쓰기. 두 관리자가 같은 단지를 열면 나중 저장이 앞 저장을 조용히 덮음 | `updated_at` 낙관적 잠금 |
| E-9 | JSONB 스키마 드리프트 | 읽기 시 파서로 검증, 실패하면 파일 폴백 + 관리자 알림 |
| E-10 | 시드 누락·문자 깨짐. `contact.address`에 non-breaking hyphen(U+2011)이 의도적으로 들어 있음(주석 명시) | 딥 비교 검증에서 코드포인트 단위 비교 필수 |

### 성능 위험

| ID | 지점 | 완화책 |
|----|------|--------|
| E-11 | `public/` 190MB + 관리자 업로드 누적. WebP 0개, 히어로 mp4 최대 20MB | 신규 자산은 전부 Storage. 서버 리사이즈·WebP 변환은 범위 밖 |
| E-12 | 단지 저장 시 153개 상세 경로 광역 재검증 → Hobby 함수 실행량 급증 | 무효화 범위를 해당 단지 + `/cases` 목록으로 한정 |
| E-13 | 관리자가 무제한 섹션·단지 추가 시 페이지 비대화 | 목록 페이지네이션, 이미지 lazy 유지 |
| E-14 | `layout.tsx`에서 메뉴 조회 → 전 페이지에 Supabase 쿼리 1회 추가 | nav 태그 캐시로 사실상 0회. 캐시 미적용 시 최대 성능 저하 지점 |

---

## 6. 마이그레이션 · 전환 · 롤백 3단계

### 단계 1 — 마이그레이션 (DAY 2~3)
1. `supabase/migrations/`에 테이블 6종 + RLS를 새 마이그레이션으로 추가. 기존 마이그레이션은 건드리지 않는다.
2. 시드 스크립트가 `data/site-content.ts`를 읽어 DB에 적재한다. **`data/site-content.ts`는 이 시점에 삭제하지 않는다.**
3. 시드 후 검증: 단지 건수(현재 153 + 과거 19 = 172), slug 코드포인트 일치, 이미지 경로 유효성.

### 단계 2 — 전환 (DAY 4~9) — 읽기 어댑터 폴백
- 모든 컴포넌트는 `data/site-content.ts`를 직접 import 하지 않고 `lib/content/*` 어댑터를 통해 읽는다.
  (현재 직접 import 하는 파일 약 55개 — `grep -rln "data/site-content" app components`)
- 어댑터 동작:
  - `CONTENT_SOURCE=db` (기본) → DB 조회. **조회 실패 시 `data/site-content.ts` 값으로 폴백**하고 에러 로깅.
  - `CONTENT_SOURCE=file` → **킬스위치.** DB를 아예 조회하지 않고 파일 값만 사용.
- 킬스위치는 Vercel 환경변수로 즉시 토글 가능해야 한다(재배포 없이 반영되도록 환경변수 변경 후 재배포 1회 허용).

### 단계 3 — 롤백
| 장애 수준 | 조치 |
|-----------|------|
| 특정 데이터만 잘못됨 | `content_revisions`에서 되돌리기 |
| DB 읽기 오류 산발 | 어댑터 폴백이 자동 흡수. 로그 확인 후 원인 수정 |
| 광범위 장애 | `CONTENT_SOURCE=file`로 킬스위치 → 파일 기반 사이트로 즉시 복귀 |
| 배포 자체가 문제 | Vercel 이전 배포로 즉시 롤백. 마이그레이션은 additive이므로 되돌릴 필요 없음 |

**원칙: 이번 계약 기간 내에 `data/site-content.ts`를 삭제하지 않는다.** 폴백과 킬스위치의 근거가 되는 파일이다.

---

## 7. 진행 체크리스트

> **세션 시작 시 읽는 순서: §11(환경·배포 전제) → §7(이 표) → 해당 DAY 절.**

- [x] DAY 1 — 캐시 API 검증 → **분기 A 확정** · next.config remotePatterns · 회귀 베이스라인 28장 · 마이그레이션 6종+버킷 2종 작성·적용 완료 (§10)
- [x] DAY 2 — 마이그레이션 SQL 6종 + RLS (DAY 1 로 당겨 완료)
- [x] DAY 3(실제 DAY 2) — 시드 스크립트 + slug 코드포인트 검증 통과 · `content_revisions` SELECT admin 전용 · 브랜치 전략 판단(§12)
- [x] DAY 4(실제 DAY 3) — 읽기 어댑터 + 파일 폴백 + `CONTENT_SOURCE` 킬스위치 (§13-1)
- [x] DAY 5(실제 DAY 3) — 관리자 UI: 단지 CRUD + `/cases` 전환 (§13-2, §13-3)
- [x] DAY 6(실제 DAY 4) — 관리자 UI: 사이트 설정 + `/about/*`·`/contact` 전환 + E-6·E-7·E-10 처리 (§14)
- [x] DAY 7(실제 DAY 5) — 사업영역·인허가·인증·연혁·파트너·조직도 편집 UI + 소비처 전환 26개(잔여 0, 사장 코드 4개 제외) + contact 소비처 7개 해소 (§15)
- [x] DAY 8(실제 DAY 6) — 이미지·영상 업로더 + 전 편집 폼 연결 + 히어로 슬라이드 교체(ITEM 02) + E-4 실증 (§16)
- [ ] DAY 7 — **베이스라인 캡처 → 섹션 레지스트리 전환 → 재캡처 비교**
- [ ] DAY 8 — 관리자 UI: 섹션 표시·숨김/순서 + 페이지 공개·비공개
- [ ] DAY 9 — 관리자 UI: 네비게이션 + 변경 이력
- [ ] DAY 10 — 전체 회귀 · 배포 · 라이브 검증 · 인수 문서

부수 확인 항목:
- [ ] 계약서 원문 4개 영역 문구로 §1 교체
- [ ] E-1~E-14를 STEP 1 원본과 대조·정정

---

## 8. 회귀 베이스라인 캡처 규칙

DAY 7 섹션 레지스트리 전환은 11개 `page.tsx`를 건드리는 **가장 위험한 작업**이다. 착수 **전에** 베이스라인을 확보한다.

### 대상
현재 프로덕션 `https://kbgroup-renewal.vercel.app` 기준.

공개 페이지 11개:
1. `/`
2. `/about`
3. `/about/ceo`
4. `/about/history`
5. `/about/location`
6. `/business`
7. `/cases`
8. `/licenses`
9. `/careers`
10. `/contact`
11. `/notices`

추가로 `/cases/[slug]` 샘플 3건 (LH 1건 · 민간 1건 · 과거 단지 1건을 각각 1개씩 고른다. 고른 slug는 아래 표에 기록).

| 구분 | 선택한 단지명 | slug (= `encodeURIComponent(name)`) | 파일명 키 |
|------|--------------|------|------|
| LH | `LH시흥 장현 트리플센텀 (A-8블록)` | `LH%EC%8B%9C%ED%9D%A5%20%EC%9E%A5%ED%98%84%20%ED%8A%B8%EB%A6%AC%ED%94%8C%EC%84%BC%ED%85%80%20(A-8%EB%B8%94%EB%A1%9D)` | `12_cases-detail-lh` |
| 민간 (사진 O) | `계림아이파크 SK뷰` | `%EA%B3%84%EB%A6%BC%EC%95%84%EC%9D%B4%ED%8C%8C%ED%81%AC%20SK%EB%B7%B0` | `13_cases-detail-private` |
| 민간 (사진 X, 모노그램 fallback) | `금남로 센텀시티` | `%EA%B8%88%EB%82%A8%EB%A1%9C%20%EC%84%BC%ED%85%80%EC%8B%9C%ED%8B%B0` | `14_cases-detail-nophoto` |

> **§8 원안 정정 (2026-08-24 DAY 1 실측)** — 세 번째 샘플을 "과거(`pastComplexes`)"에서
> "사진 없는 민간 단지"로 **대체**했다.
> 근거: `app/cases/[slug]/page.tsx:18` 의 `generateStaticParams()` 는 `complexes` 만 순회하고,
> 같은 파일 60행이 `complexes.findIndex(...) === -1` 이면 `notFound()` 한다.
> 즉 **과거 단지는 상세 페이지가 아예 존재하지 않는다(404)**. 캡처 대상이 될 수 없다.
> 대체 샘플은 `image` 미지정 → 모노그램 fallback 렌더 분기를 타므로 회귀 가치가 더 크다.

### 뷰포트
- 데스크탑: `1440x900`
- 모바일: `390x844`
- 전체 페이지 캡처(full page), 애니메이션 정지 후 캡처

### 저장 위치와 파일명 규칙

```
docs/regression/
  before/   # DAY 7 전환 착수 전 (프로덕션 기준)
  after/    # DAY 7 전환 후 (동일 조건)
```

파일명: `{순번2자리}_{경로슬러그}_{뷰포트}.png`
- `경로슬러그` = URL 경로에서 `/`를 `-`로 치환하고 앞뒤 `-` 제거. 루트는 `home`.
- `뷰포트` = `desktop` | `mobile`

예시:
```
docs/regression/before/01_home_desktop.png
docs/regression/before/01_home_mobile.png
docs/regression/before/07_cases_desktop.png
docs/regression/before/12_cases-detail-lh_desktop.png
docs/regression/after/01_home_desktop.png
```

`/cases/[slug]` 샘플 3건은 slug가 한글 퍼센트 인코딩이라 파일명에 쓰지 않는다. `cases-detail-lh`, `cases-detail-private`, `cases-detail-past`로 고정하고 실제 slug는 위 표에 기록한다.

### 캡처 수단 — `scripts/capture-regression.mjs`

```bash
PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
  node scripts/capture-regression.mjs before   # 또는 after

# 일부만 다시 찍기
ONLY=07 VIEWPORT=desktop PLAYWRIGHT_PATH=... node scripts/capture-regression.mjs before
```

- **playwright 를 이 저장소의 의존성으로 추가하지 않았다.** 계약 범위 밖 의존성 추가 금지 원칙에 따라,
  머신에 이미 설치된 playwright(`/home/dev/fordex/node_modules/playwright` 1.62.1)를
  `PLAYWRIGHT_PATH` 로 주입해 쓴다. `package.json` 무수정.
- 기본 `BASE_URL` = `https://kbgroup-renewal.vercel.app` (프로덕션). `BASE_URL` 로 로컬 전환 가능.
- 캡처 전 처리: `reducedMotion: reduce` + 전역 CSS 로 animation/transition 0s 고정,
  `<video>` 는 `visibility:hidden` (히어로 영상 프레임이 매번 달라져 diff 오탐을 유발함),
  페이지 끝까지 스크롤해 lazy 이미지·IntersectionObserver 섹션을 전부 깨운 뒤 최상단 복귀.
- `/cases` 는 카드 153장으로 페이지가 매우 길어 playwright 기본 30s 스크린샷 타임아웃을 넘긴다.
  스크립트에서 180s 로 올려두었다.
- 산출물은 `.vercelignore` 에 `docs/regression` 을 추가해 배포에서 제외한다.

### 비교
전환 후 동일 조건으로 재캡처해 `before/` ↔ `after/` 동일 파일명끼리 비교한다.
**이것이 유일한 회귀 검증 수단이다.** 차이가 발견되면 의도된 변경인지 반드시 명시적으로 판정한 뒤 다음 DAY로 넘어간다.

---

## 9. 코드베이스 사실 요약 (STEP 2 참고용, 951줄 원문 대신)

`data/site-content.ts` 주요 export 구조 (건수는 2026-08-24 기준):

| export | 종류 | 건수 | 이관 대상 |
|--------|------|-----:|-----------|
| `company` | 객체 | 1 | `site_settings` |
| `contact` | 객체 | 1 | `site_settings` |
| `ceoMessage` | 객체 | 1 | `site_settings` |
| `counters` | 배열 | — | `site_settings` |
| `businessAreas` | 배열 | 5 | `site_settings` (또는 전용 테이블 검토) |
| `coreValues` / `differentiators` / `processSteps` / `companyStrengths` | 배열 | — | `site_settings` |
| `complexes` | 배열 | 153 | `complexes` (`is_active = true`) |
| `pastComplexes` | 배열 | 19 | `complexes` (`is_active = false`) |
| `partners` / `collaborators` | 배열 | — | `site_settings` |
| `licenses` | 배열 | 9 | `site_settings` |
| `certifications` | 배열 | 27 | `site_settings` |
| `history` | 배열 | 16 | `site_settings` |
| `organization` | 객체(트리) | 1 | `site_settings` |
| `relatedCompanies` | 배열 | — | `site_settings` |
| `STATS` / `totalCertHolders` / `yearsOfOperation` | 파생·상수 | — | 실제 count는 계산, 마케팅 표기값은 `site_settings` |

기타:
- `data/site-content.ts`를 직접 import 하는 파일: **56개** (전수 목록은 §9.1)
- 기존 마이그레이션 11개 (`supabase/migrations/`) — profiles, posts, attachments, admin_logs, rls_policies, storage_buckets, job_applications, free_board, job_openings, post_comments, member_approval
- `lib/site.ts` — `SITE_URL = "https://kbgroup.kr"` (canonical 기준. 회귀 캡처는 vercel.app 프리뷰 주소로 수행)
- 게시판·채용공고는 이미 DB 기반 (`lib/posts.ts`, `lib/boards.ts`, `lib/job-openings.ts`) — 이번 범위와 무관

### 9.1 `data/site-content.ts` 직접 import 소비처 확정 목록 (56개)

> 2026-08-24 실측. `app/`·`components/`·`lib/`·`scripts/` 전수 grep 결과 **56개 파일**.
> STEP 1 보고의 "57개", 이후 보고의 "약 55개"는 모두 부정확. 이 표가 DAY 4 어댑터 전환 대상 정본이다.

| # | 파일 | import 하는 export |
|---:|------|--------------------|
| 1 | `app/api/contact/route.ts` | `contact` |
| 2 | `app/(auth)/signup/pending/page.tsx` | `contact` |
| 3 | `app/business/[slug]/page.tsx` | `businessAreas`, `complexes` |
| 4 | `app/careers/openings/[id]/page.tsx` | `contact` |
| 5 | `app/careers/openings/page.tsx` | `contact` |
| 6 | `app/cases/[slug]/page.tsx` | `complexes`, `type Complex` |
| 7 | `app/forgot-password/page.tsx` | `contact` |
| 8 | `app/not-found.tsx` | `contact` |
| 9 | `app/privacy/page.tsx` | `company`, `contact` |
| 10 | `app/sitemap.ts` | `businessAreas`, `complexes` |
| 11 | `app/terms/page.tsx` | `company` |
| 12 | `components/layout/Footer.tsx` | `company`, `contact` |
| 13 | `components/layout/Header.tsx` | `businessAreas` |
| 14 | `components/sections/about/CeoMessage.tsx` | `ceoMessage` |
| 15 | `components/sections/about/CeoPortrait.tsx` | `ceoMessage` |
| 16 | `components/sections/about/CollaboratorsTable.tsx` | `collaborators` |
| 17 | `components/sections/about/CompanyOffice.tsx` | `company`, `contact` |
| 18 | `components/sections/about/CompanyStrengths.tsx` | `companyStrengths`, `yearsOfOperation` |
| 19 | `components/sections/about/HistoryTimeline.tsx` | `history`, `type HistoryEntry` |
| 20 | `components/sections/about/LocationInfo.tsx` | `contact` |
| 21 | `components/sections/about/LocationMap.tsx` | `contact` |
| 22 | `components/sections/about/OrganizationChart.tsx` | `organization`, `type OrgNode` |
| 23 | `components/sections/about/RelatedCompaniesGrid.tsx` | `relatedCompanies` |
| 24 | `components/sections/about/WhyDifferentiators.tsx` | `differentiators`, `yearsOfOperation` |
| 25 | `components/sections/about/WhyNumbers.tsx` | `counters`, `type Counter` |
| 26 | `components/sections/about/WhyValues.tsx` | `coreValues` |
| 27 | `components/sections/auth/LoginForm.tsx` | `contact` |
| 28 | `components/sections/business/BusinessCTA.tsx` | `BusinessArea`, `contact` |
| 29 | `components/sections/business/BusinessFAQ.tsx` | `BusinessCategory` |
| 30 | `components/sections/business/BusinessHero.tsx` | `BusinessArea` |
| 31 | `components/sections/business/BusinessIntroAlternating.tsx` | `businessAreas`, `type BusinessCategory` |
| 32 | `components/sections/business/BusinessOverview.tsx` | `BusinessArea`, `BusinessCategory` |
| 33 | `components/sections/business/BusinessProcess.tsx` | `processSteps` |
| 34 | `components/sections/business/BusinessRelatedCases.tsx` | `Complex` |
| 35 | `components/sections/business/BusinessSubServices.tsx` | `BusinessArea` |
| 36 | `components/sections/careers/CareersApply.tsx` | `contact` |
| 37 | `components/sections/careers/CareersOpenings.tsx` | `contact` |
| 38 | `components/sections/cases/CasesGallery.tsx` | `complexes`, `pastComplexes`, `type Complex` |
| 39 | `components/sections/cases/CasesList.tsx` | `complexes`, `type Complex` |
| 40 | `components/sections/cases/CasesMap.tsx` | `complexes` |
| 41 | `components/sections/cases/CasesStats.tsx` | `complexes`, `STATS` |
| 42 | `components/sections/cases/PastProjects.tsx` | `pastComplexes` |
| 43 | `components/sections/Cases.tsx` | `complexes`, `type Complex` |
| 44 | `components/sections/common/ContactForm.tsx` | `contact` |
| 45 | `components/sections/common/ContactInvite.tsx` | `contact` |
| 46 | `components/sections/CTA.tsx` | `contact` |
| 47 | `components/sections/DataCounter.tsx` | `counters` |
| 48 | `components/sections/Hero.tsx` | `contact` |
| 49 | `components/sections/licenses/CertificationsGrid.tsx` | `certifications`, `type Certification` |
| 50 | `components/sections/licenses/LicensesGrid.tsx` | `licenses`, `type License` |
| 51 | `components/sections/licenses/LicensesKPI.tsx` | `certifications`, `licenses`, `STATS` |
| 52 | `components/sections/licenses/LicensesOverview.tsx` | `certifications`, `licenses`, `STATS` |
| 53 | `components/sections/licenses/WorkforceStats.tsx` | `certifications`, `licenses`, `STATS`, `totalCertHolders`, `yearsOfOperation` |
| 54 | `components/sections/Partners.tsx` | `partners`, `type Partner` |
| 55 | `components/sections/ServiceCategories.tsx` | `businessAreas`, `type BusinessCategory` |
| 56 | `components/sections/TrustSignals.tsx` | `licenses`, `partners` |


---

### 9.2 STATS 마케팅 표기값 확정 (2026-08-24 검증)

운영 단지 마케팅 표기값은 **`200+`가 정본**이다. `155+`는 폐기된 이전 값이다.

| 항목 | 값 | 위치 |
|------|---:|------|
| `counters[key="complexes"].value` | 153 | `data/site-content.ts:301` (실제 배열 length와 동기) |
| `counters[key="complexes"].displayValue` / `displaySuffix` | `200` / `"+"` | `data/site-content.ts:302-303` |
| `STATS.activeComplexes` | `complexes.length` (=153) | `data/site-content.ts:801` |
| `STATS.activeComplexesDisplay` | 200 | `data/site-content.ts:803` |
| `STATS.lhProjectsDisplay` | 15 | `data/site-content.ts:805` |
| `companyStrengths` 카피 | "…이래 **200+**개 단지를 직접 운영하며…" | `data/site-content.ts:530` |

- 라이브 검증: `https://kbgroup-renewal.vercel.app/` 메인 DataCounter SSR HTML에 `<span class="stat-number …">200</span><span …>+</span>` + `ACTIVE COMPLEXES` 확인 (200+ 렌더).
- 변경 이력: `155+ → 200+`는 커밋 `8a27ace` "Phase 14-O — 클라 요청 8건 일괄 반영" (2026-05-30). 커밋 메시지에 *"NATIONWIDE PORTFOLIO: 운영 단지 155+ → 200+, LH 발주 → 15+"*로 명시 — **클라이언트 요청에 의한 의도적 변경**이며 무단 변경이 아니다. 되돌릴 필요 없음.
- 따라서 STEP 1 보고의 `activeComplexesDisplay: 200`이 정확하고, "검수 통과값 155+"는 Phase 14-N 시점의 구값이다.
- 시드 시 이 값들은 `site_settings`에 **200 / 15 그대로** 이관한다. E-7(수기 표기값 ↔ 실제값 이원화)의 대표 사례.

---

## 10. DAY 1 실행 결과 (2026-08-24)

### 10-1. 캐시 API 판정 → **분기 A 확정**

`npm install` 후 실제 설치본 `next@16.2.6` 을 직접 검사한 결과다.

| 확인 항목 | 결과 | 근거 |
|-----------|------|------|
| `unstable_cache` 존재·사용 가능 | **가능** | `node_modules/next/cache.d.ts` 가 `unstable_cache` 를 그대로 re-export. 타입 시그니처 `unstable_cache(cb, keyParts?, { revalidate?, tags? })` 로 **변경 없음**. 런타임(`dist/server/web/spec-extension/unstable-cache.js`)에 `cacheComponents` 관련 가드·throw·deprecation 경고가 **하나도 없다** |
| `'use cache'` + `cacheComponents` 요구 여부 | **요구하지 않음** | `cacheComponents` 는 `config-shared.d.ts` 의 **옵트인 옵션**일 뿐이며 기본값 off. off 상태에서 `unstable_cache` 는 정상 동작한다. `cacheTag`/`cacheLife` 도 별도 export 로 공존한다 |
| `revalidatePath` 시그니처 | **변경 없음** | `revalidatePath(path, type?: 'layout' \| 'page')` |
| `revalidateTag` 시그니처 | **변경 있음 — 2번째 인자 필수** | `.d.ts`: `revalidateTag(tag: string, profile: string \| { expire?: number }): undefined`. 1-인자 호출은 **TS 컴파일 에러**(`TS2554: Expected 2 arguments, but got 1` — 실제 `tsc --noEmit` 로 재현 확인). 런타임은 동작하되 deprecation 경고를 찍는다 |
| 신규 API | `updateTag(tag)` / `refresh()` 추가 | 둘 다 **Server Action 안에서만** 호출 가능(라우트 핸들러에서 호출하면 `E872` throw). `updateTag` 는 read-your-own-writes 보장 |

**확정 규약 (DAY 2 이후 코드는 전부 이걸 따른다):**

```ts
import { unstable_cache, revalidateTag, updateTag } from "next/cache";

export const getComplexes = unstable_cache(
  async () => { /* supabase select */ },
  ["complexes"],                       // keyParts
  { tags: ["content:complexes"], revalidate: 3600 },
);

// Server Action 안에서 (관리자 저장 흐름 = 전부 Server Action)
updateTag("content:complexes");        // ← 기본. 저장 직후 본인 요청에 즉시 반영됨
// Server Action 밖(라우트 핸들러 등)에서 어쩔 수 없을 때만:
revalidateTag("content:complexes", "max");   // ← 2번째 인자 생략 금지
```

- 태그 네임스페이스: `content:complexes` · `content:settings` · `content:sections` · `content:nav` · `content:pages`
- E-12(단지 저장 시 광역 재검증) 대응: 태그 단위 무효화로 한정한다. `revalidatePath("/", "layout")` 는 쓰지 않는다.

**분기 B(폴백)로 가지 않았다.** `cacheComponents` 전환은 필요하지 않으며, 이번 계약에서 시도하지 않는다.

### 10-2. `next.config.ts` — `images.remotePatterns` (E-4 해소)

프로젝트 ref `yydvpwjvxyhyplzpxdds` 기준으로 Storage 호스트를 등록했다. 다른 옵션은 건드리지 않았다.

```ts
images: {
  remotePatterns: [{
    protocol: "https",
    hostname: "yydvpwjvxyhyplzpxdds.supabase.co",
    pathname: "/storage/v1/object/public/**",
  }],
}
```

### 10-3. 회귀 베이스라인 캡처 — 완료 (28장)

- `docs/regression/before/` 에 **28장**(14 대상 × 2 뷰포트) 저장. 총 33MB. 전부 HTTP 200.
- 수단·규칙·샘플 slug 는 §8 에 기록. 캡처 스크립트는 `scripts/capture-regression.mjs`.
- **§8 원안 정정 1건**: `/cases/[slug]` 샘플 3건 중 "과거(`pastComplexes`)" 건은 **상세 페이지가 존재하지 않아**(404) 캡처 불가. "사진 없는 민간 단지(모노그램 fallback)"로 대체했다. 상세 근거는 §8.

### 10-4. 빌드 라우트 표 베이스라인 (E-5 재판정)

`npm run build` 성공(컴파일 18.8분 — 로컬 머신이 느림. Vercel 기준 아님). 183개 페이지 프리렌더.
라우트 표 결과: **`○`(Static)은 `/robots.txt`, `/sitemap.xml` 단 2개뿐. 나머지 app 라우트 전부 `ƒ`(Dynamic).**
원인은 `app/layout.tsx:119` 의 `await supabase.auth.getUser()` — 루트 레이아웃이 쿠키를 읽으므로 전 라우트가 동적이 된다.
→ E-5 를 정정했다(§5). 자세한 함의는 아래 "일정 재확인" 참조.

### 10-5. 마이그레이션 — 작성 + **적용 완료**

| 파일 | 내용 |
|------|------|
| `20260824000001_content_complexes.sql` | `complexes` (172건 통합용). slug NOT NULL UNIQUE + **불변 트리거**, `is_active`, `sort_order`, `updated_at` 낙관적 잠금 |
| `20260824000002_site_settings.sql` | `key TEXT PK` / `value JSONB` / `updated_at`. **담을 키 17종을 DDL 주석에 전부 명시** |
| `20260824000003_page_sections.sql` | `(page_key, section_key)` UNIQUE + `is_visible` + `sort_order` |
| `20260824000004_nav_items.sql` | `parent_id` self-ref, `location('header'\|'footer')`, `label`/`kr_label` |
| `20260824000005_pages.sql` | `path` UNIQUE, `is_published` |
| `20260824000006_content_revisions.sql` | `table_name`/`record_id(text)`/`snapshot jsonb`/`actor_id`/`created_at` + 레코드당 최근 20개 유지 트리거. append-only(UPDATE 정책 없음) |
| `20260824000007_content_storage_buckets.sql` | `site-images`(public, 10MB, jpeg·png·webp·avif) · `site-videos`(public, 50MB, mp4·webm). 기존 gallery·resources 정책 무수정 |

적용 검증 (Supabase Management API `/database/query` 실행 결과):
`new_tables=6, new_policies=23, rls_on=6, new_buckets=2, storage_policies=8`

- RLS 전 테이블: SELECT 공개(anon+authenticated), INSERT/UPDATE/DELETE 는 기존 `public.is_admin()` 재사용.
- 기존 테이블(profiles·posts·attachments·admin_logs) 및 기존 마이그레이션 11개는 **무수정**.

#### complexes — `complexes` / `pastComplexes` 필드 차이 흡수 방법

| 필드 | 어디에만 있었나 | 처리 |
|------|-----------------|------|
| `scope` (관리 분야) | `complexes` 타입에만 | `scope text` 컬럼. 과거 단지 행은 `null`. **실제로 두 배열 어디에도 값이 채워진 항목이 없다**(타입에만 선언) — 시드 결과도 전부 null 예상 |
| `period` (계약 기간) | `pastComplexes` 에만 | `period text` 컬럼. 현재 단지 행은 `null` |
| `type` | 양쪽 공통 | `'LH'\|'민간'\|'공공'` check. **실측상 `"민간"` 리터럴이 데이터에 한 번도 등장하지 않는다** (`type` 미지정 = 민간). null 을 그대로 보존한다 — 임의로 `'민간'` 을 채워 넣으면 기존 필터 로직과 어긋난다 |
| `name`·`client`·`region`·`households`·`area`·`kind`·`image`·`images`·`aliases`·`isFeatured` | 양쪽 동일 | 동일 컬럼으로 직행 |
| 배열 순서 | — | **`sort_order` 신설.** 두 배열 모두 지역별로 정렬된 상태이고 그 순서가 곧 화면 출력 순서다. 인덱스를 그대로 넣어 보존한다 |
| 현재/과거 구분 | — | `is_active` (`complexes` → true, `pastComplexes` → false) |

### 10-6. 미결·보고 사항

1. **`content_revisions` SELECT 공개** — 지시서 "RLS 전 테이블 SELECT 공개"를 그대로 따랐다. 다만 이 테이블은 감사 테이블이라 `actor_id`(편집자 uuid)와 편집 이력이 익명에게 노출된다. 스냅샷 내용 자체는 어차피 공개 콘텐츠라 실질 유출은 없지만, admin 전용으로 좁히는 편이 자연스럽다. **한 줄 변경으로 가능. 결정 요청.**
2. **playwright 미추가** — `package.json` 을 건드리지 않고 머신의 기존 playwright 를 `PLAYWRIGHT_PATH` 로 주입했다. 다른 머신에서 캡처하려면 이 경로를 바꿔야 한다.
3. **`middleware` 파일 규약 deprecation 경고** — 빌드 로그에 `"middleware" file convention is deprecated. Please use "proxy" instead` 가 뜬다. 동작에는 문제 없다. 이번 계약 범위 밖이므로 손대지 않았다. **보고만 한다.**

---

## 11. 환경·배포 전제 (세션 시작 시 필독)

> **읽는 순서: §11 → §7 → 해당 DAY 절.** 이 절이 §12·§13·§14·§15(DAY 실행 결과)보다 먼저다.
> 여기 적힌 전제를 모르면 "배포됐겠지" 라고 착각한 채 라이브를 검증하는 사고가 난다.

### 11-1. 배포 주체와 시점 — **에이전트는 배포하지 않는다**

| 항목 | 확정 |
|------|------|
| DAY 5~9 | **커밋 + 푸시까지만.** 프로덕션 배포 없음 |
| DAY 10 | 프로덕션 배포. **사용자가 직접 실행한다** |
| 에이전트 권한 | 빌드·검증·커밋·푸시. **배포 명령 실행 금지** |

- **`vercel` CLI 는 이 환경에서 미인증이다.** `vercel whoami` 는 OAuth 로그인 프롬프트로 넘어가 멈춘다.
  **OAuth 흐름을 시작하지 마라.** (2026-08-25 `npx vercel whoami` 2분 무응답 실측)
- **`git push` 로는 어떤 배포도 일어나지 않는다.** 이 저장소는 Vercel Git 연동이 아니다
  (`git remote -v` → `git@gh-cla2:anhongjun0507-bit/kbgroup-renewal.git`, 배포는 CLI 수동).
  따라서 **푸시 후 "배포 감지" 폴링을 걸지 마라.** 라이브가 안 바뀌는 것이 정상이다.
- DAY 10 배포 절차서(명령 순서·확인 체크리스트·롤백·환경변수)는 **DAY 10 절에 작성한다.**
  사용자는 그 문서만 보고 실행한다.

### 11-2. 라이브 · 로컬 구분

| 대상 | URL | 콘텐츠 소스 |
|------|-----|-------------|
| 프로덕션(라이브) | `https://kbgroup-renewal.vercel.app` | **파일 기반** — DAY 1~9 코드가 아직 배포되지 않았다 |
| 로컬 프로덕션 빌드 | `http://localhost:3210` (`next build && next start`) | **DB 어댑터** |

DAY 5~9 의 "실측"은 전부 **로컬 프로덕션 빌드** 기준이다. 라이브와 대조할 때는
프로덕션이 파일 기반이라는 점을 전제로 읽어야 한다 (§15-5 ①의 SSR 전문 대조가 이 구조다).

**Supabase 는 로컬·프로덕션이 같은 프로젝트다** (`yydvpwjvxyhyplzpxdds`). 즉 로컬에서 관리자
폼을 저장하면 **프로덕션 DB 가 바뀐다.** 검증 스크립트가 쓰기를 하면 반드시 원복까지 한다.

### 11-3. 환경변수

`.env.local` (gitignore). **`NEXT_PUBLIC_` 접두사는 URL·ANON_KEY 에만 붙는다.**

| 키 | 용도 |
|----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 브라우저·서버 공용 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저·서버 공용 (RLS 로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용. 시드 스크립트 |
| `VERCEL_TOKEN` | **DAY 10 배포용.** `vercel --token=$VERCEL_TOKEN` 으로 OAuth 없이 실행 가능 |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI / Management API |
| `CONTENT_SOURCE` | **미설정 = db 모드.** `file` 로 두면 킬스위치(롤백 레벨 2, §6) |

DAY 10 배포 전 Vercel 프로젝트 환경변수에 위 1~3 + (필요 시) `CONTENT_SOURCE` 가 있어야 한다.
**절차서에 이 확인을 반드시 포함한다.**

### 11-4. 금지 사항

1. `vercel` / `vercel --prod` / `vercel login` 등 **배포·인증 명령 실행 금지** (DAY 10 사용자 몫).
2. 푸시 후 **배포 감지 폴링 금지** — 자동 배포가 없으므로 영원히 안 바뀐다.
3. `--no-verify`, `git push --force`, `git reset --hard`, 마이그레이션 미적용 배포 금지.
4. 검증 스크립트가 **프로덕션 DB 에 쓰기를 하면 반드시 원복 + 원복 대조**까지 한다.

---

## 12. DAY 2 실행 결과 (2026-08-24)

> 일정표(§4)의 DAY 번호와 실제 진행 DAY 가 하루 어긋나 있다. §4 의 "DAY 2(마이그레이션)"는
> DAY 1 에 끝냈으므로, **실제 DAY 2 = §4 의 DAY 3(시드 + 검증)** 이다. 이후 DAY 번호는 실제 진행일 기준으로 쓴다.

### 12-1. content_revisions SELECT → admin 전용 (결정 1)

`supabase/migrations/20260824000008_content_revisions_select_admin.sql` 작성·적용 완료.

적용 후 정책 실측 (`pg_policy`):

| 정책 | cmd | roles | using |
|------|-----|-------|-------|
| `content_revisions_select_admin` | SELECT | authenticated | `is_admin()` |
| `content_revisions_admin_insert` | INSERT | authenticated | (with check `is_admin()`) |
| `content_revisions_admin_delete` | DELETE | authenticated | `is_admin()` |

`content_revisions_select_public` 는 drop 됐다. anon 은 이제 감사 이력을 읽을 수 없다. UPDATE 정책 없음(append-only) 유지.

### 12-2. 브랜치 전략 판단 (결정 2) → **불필요. main 직접 진행이 맞다**

지시의 전제("main push = Vercel 프로덕션 배포")가 이 저장소에서는 **성립하지 않는다.** 실측:

| 확인 | 결과 | 근거 |
|------|------|------|
| Vercel 프로젝트 ↔ Git 연동 | **없음** | `GET /v9/projects/kbgroup-renewal` → `link: null`, `productionBranch: null`, `deployHooks: null` |
| 최근 배포 8건의 트리거 | **전부 `source: "cli"`** | `GET /v6/deployments` — 2026-07-22 ~ 07-29 전건 `cli` / `target: production` |

즉 GitHub 푸시로는 어떤 배포도 발생하지 않는다. 프로덕션 배포는 **`vercel --prod` 를 직접 실행할 때만** 일어난다.

**판단:** 별도 브랜치는 이득 없이 머지 비용만 늘린다. DAY 2~9 도 `main` 에 커밋·푸시하고,
프로덕션 배포는 DAY 10 검증 후 `vercel --prod` 를 **명시적으로 실행**하는 시점에만 한다.
(자동 배포 위험이 애초에 존재하지 않으므로 결정 2 의 안전 목표는 이미 충족돼 있다.)

### 12-3. 시드 스크립트 — `scripts/seed-content.ts`

- **Node 22 타입 스트리핑으로 `.ts` 를 그대로 실행한다.** 빌드 단계·의존성 추가 없음(`node scripts/seed-content.ts`).
  `data/site-content.ts` 를 **원본 모듈 그대로 import** 하므로 파싱 오차가 원리적으로 없다.
- 모드: 기본(시드+검증) / `--dry-run`(쓰기 없음, slug 검증만) / `--verify-only`(쓰기 없음, 딥 비교만).
- 쓰기는 `SUPABASE_SERVICE_ROLE_KEY` 로 RLS 우회. upsert(`onConflict: slug` / `key`)라 **재실행 안전(idempotent)**.
- `tsconfig.json` 에 `allowImportingTsExtensions: true` 1줄 추가 — ESM 이 요구하는 `.ts` 확장자 import 를 타입체크가 막던 것(TS5097) 해소. `noEmit: true` 전제라 안전하며 Next 빌드에 영향 없음.

이관 매핑:

| 대상 | 건수 | 비고 |
|------|-----:|------|
| `complexes` (is_active=true) | 153 | `sort_order` = 원본 배열 인덱스 |
| `complexes` (is_active=false) | 19 | `pastComplexes`. `period` 보존, `scope` null |
| `site_settings` | 17키 | company·contact·ceoMessage·counters·businessAreas·coreValues·differentiators·processSteps·companyStrengths·partners·collaborators·licenses·certifications·history·organization·relatedCompanies·stats |

`stats` 키에는 **마케팅 표기값만** 넣었다(E-7): `activeComplexesDisplay:200`, `lhProjectsDisplay:15`,
`managedHouseholds`, `registeredLicenses`, `certificationTypes`, `certifiedProfessionals`, `totalCertHolders`.
**`STATS.activeComplexes`(실제 단지 수)는 넣지 않았다** — `complexes` 테이블에서 계산한다.

### 12-4. 딥 비교 검증 결과 — **불일치 0건**

```
검증 대상: complexes 172행 (현재 153 / 과거 19), site_settings 17키
✅ 전부 일치 — 코드포인트 단위 딥 비교 통과 (7.1s)
```

검증 항목:
1. **slug 코드포인트 일치 (E-1)** — 172/172 이 `encodeURIComponent(name)` 과 코드포인트 단위 완전 일치. slug 중복 0.
2. **complexes 전 필드 딥 비교** — 16컬럼 × 172행. 문자열은 코드포인트 단위, 숫자는 `Object.is`, 배열은 길이+원소별.
3. **건수** — DB 172 = 원본 172, active 153 / past 19. DB 에만 있는 행 0, 원본에만 있는 행 0.
4. **site_settings 17키 딥 비교** — JSONB 왕복 후에도 전부 일치. 원본에 없는 키 0.
5. **E-10 U+2011** — `contact.address` 의 non-breaking hyphen 보존 확인.
6. **이미지 경로 유효성** — `image` + `images` 전 경로가 `public/` 아래 실제 파일로 존재. 누락 0.

DB 직접 SQL 재확인(스크립트와 독립 경로):

```
total=172  active=153  past=19  type='LH'=10  site_settings=17  bad_slug=0
contact.address → position(chr(8209)) = 20,  position('-') = 0   ← U+2011 만 있고 ASCII 하이픈 없음
```

§8 베이스라인 샘플 3건의 slug 가 DB 값과 정확히 일치함도 재확인:

| 구분 | name | sort_order | image |
|------|------|-----------:|-------|
| LH | `LH시흥 장현 트리플센텀 (A-8블록)` | 99 | 있음 |
| 민간(사진 O) | `계림아이파크 SK뷰` | 0 | 있음 |
| 민간(사진 X) | `금남로 센텀시티` | 3 | 없음 |

### 12-5. DAY 3(읽기 어댑터) 필수 검증 항목 — 결정 3 반영

**과거 단지 19건은 상세 페이지가 없다. 통합 테이블로 옮겼다고 상세 페이지가 새로 생기면 안 된다.**
(계약 범위 밖 + 기존 UX 변경). 어댑터 전환 시 아래를 반드시 확인한다.

- [x] `app/cases/[slug]/page.tsx` 의 `generateStaticParams()` 가 **`is_active = true` 행만** 반환한다 → 153건, 과거 미포함 (§13-4)
- [x] 같은 파일의 `notFound()` 분기가 **`is_active = false` 인 slug 에 대해 그대로 404** 를 낸다 → 19/19 실측 404 (§13-4)
- [x] `/cases` 목록(`CasesGallery`·`PastProjects`)에는 과거 단지가 **계속 노출**된다 → 과거 19 · 주요(종료) 2 유지 (§13-5)
- [x] `app/sitemap.ts` 에 과거 단지 URL 이 **추가되지 않는다** → sitemap.ts 무수정, 파일 `complexes` 만 순회 (§13-4)

### 12-6. 미결·보고 사항

1. **DAY 2 지시서 뒷부분이 잘려서 도착했다.** `■ 2-1. 시드 스크립트 (scripts/seed-content.ts)` 의
   `- data/` 이후가 없다. 위 11-3/11-4 는 §6 단계 1·§9·§10-5 의 확정 내용으로 구성했다.
   잘린 부분에 추가 요구가 있었다면 알려주면 반영한다.
2. **시드 대상 DB 는 프로덕션 Supabase 프로젝트 하나뿐이다**(`yydvpwjvxyhyplzpxdds`). 다만 현재 라이브 사이트는
   여전히 `data/site-content.ts` 파일을 읽으므로, 시드 데이터가 라이브 화면에 영향을 주지 않는다.
   실제 전환은 DAY 3 읽기 어댑터 + `CONTENT_SOURCE` 킬스위치부터다.

---

## 13. DAY 3 실행 결과 (2026-08-24)

> DAY 2 잔여 3건 중 **A(감사 테이블 SELECT admin 전용)와 C(브랜치 전략)는 DAY 2 에 이미 처리**돼 있다
> (§12-1, §12-2). 실제 신규 작업은 B(읽기 어댑터)와 §4 의 DAY 5(단지 CRUD)·DAY 3-2(/cases 전환)다.

### 13-1. `lib/content` 읽기 어댑터 — 3모드 통과

| 파일 | 역할 |
|------|------|
| `lib/content/tags.ts` | 캐시 태그 네임스페이스 5종 (`content:complexes` 외) |
| `lib/content/types.ts` | `ContentComplex` — DB snake_case → 파일 camelCase 정규 타입. **null 을 undefined 로 정규화** |
| `lib/content/file-source.ts` | 파일 폴백 소스. `data/site-content.ts` → 정규 형태 변환 (시드 `toRow()` 와 1:1) |
| `lib/content/source.ts` | 킬스위치 판정 + **쿠키 없는 anon 리드 클라이언트** + 폴백 로깅 |
| `lib/content/complexes.ts` | `getAllComplexes/getComplexes/getPastComplexes/getComplexBySlug/toSlug` |
| `lib/content/settings.ts` | `getSetting(key)` / `getSettings()` |
| `lib/content/index.ts` | 공개 API 재수출 |

설계 결정 3가지:

1. **쿠키 없는 리드 클라이언트를 새로 만들었다.** `lib/supabase/server.ts` 의 `createClient()` 는
   `cookies()` 를 읽어 요청 스코프에 묶이므로 `unstable_cache` 안에서 쓸 수 없다. 콘텐츠는 전부
   SELECT 공개(RLS)라 anon 클라이언트로 충분하다.
2. **캐시 엔트리를 키별로 쪼개지 않고 172행 전체를 1개로 잡았다.** 파생 목록(active/past/slug 조회)은
   순수 함수다. 단지 하나를 저장해도 무효화 대상이 엔트리 1개뿐이라 **153개 상세 경로 광역 재검증이
   원리적으로 발생하지 않는다 (E-12)**. `site_settings` 17키도 같은 이유로 1엔트리.
3. **캐시 안에서는 실패 시 throw 하고, 폴백 판단은 바깥 래퍼에서 한다.** 폴백 결과가 캐시에
   1시간 눌러앉는 것을 막기 위해서다. "결과가 비어 있음"도 실패로 친다.

3모드 실측 (`node --experimental-strip-types --import ./scripts/node-ts-register.mjs scripts/verify-content-adapter.ts`):

```
[db]     origin=db   total=172 active=153 past=19 과거slug404=OK → ✅ 파일 원본과 불일치 0건
[file]   origin=file total=172 active=153 past=19 과거slug404=OK → ✅ 파일 원본과 불일치 0건
[broken] origin=file total=172 active=153 past=19 과거slug404=OK → ✅ 파일 원본과 불일치 0건
✅ 3모드 전부 통과
```

- `db` — 기본. Supabase 조회.
- `file` — `CONTENT_SOURCE=file` 킬스위치. DB 미조회.
- `broken` — DB 호스트를 고의로 깨뜨림 → `[content] complexes DB 조회 실패 → data/site-content.ts 폴백:` 로그 후 파일 값 반환.

비교 기준: 172행 × 전 필드(문자열은 **코드포인트 단위**, 숫자 `Object.is`, 배열 원소별) + `site_settings`
17키(JSONB 왕복이 키 순서를 보존하지 않으므로 키 정렬 후 값 비교). **DB 모드 출력 == 파일 모드 출력.**

`data/site-content.ts` 는 삭제하지 않았다. 폴백 소스로 존치한다.

### 13-2. 관리자 단지 관리 (`/admin/content/complexes`)

| 파일 | 내용 |
|------|------|
| `app/admin/content/complexes/page.tsx` | 목록 — 검색(단지명·지역·별칭) / 정렬 5종 / 활성·과거 필터 / 페이지네이션 30건 |
| `app/admin/content/complexes/new/page.tsx` | 등록 |
| `app/admin/content/complexes/[id]/edit/page.tsx` | 수정 |
| `app/admin/content/complexes/actions.ts` | Server Actions 4종 |
| `components/admin/ComplexForm.tsx` | 등록·수정 공용 폼 |
| `components/admin/AdminTabs.tsx` | "단지 관리" 탭 추가 (기존 4탭 → 5탭) |

- 검색·정렬·페이지네이션은 172행을 서버에서 전량 읽어 **메모리에서** 처리한다. 별칭(`text[]`) 부분 일치를
  SQL 로 짜면 쿼리가 복잡해지는데 172행은 페이로드가 무의미하게 작다. 수천 행이 되면 SQL 로 내린다.
- 관리자 화면은 **캐시된 어댑터가 아니라 DB 를 직접 읽는다** (`force-dynamic`). 저장 직후 최신 값이 보여야 한다.
- 모든 Server Action 진입부 `requireAdmin()` — RLS `public.is_admin()` 과 이중 방어.
- **slug 는 읽기 전용 표시만** 한다 (E-1). 편집 UI 없음. DB 트리거로도 물리 차단.
  신규 등록 시에만 `encodeURIComponent(name)` 로 생성하고, 충돌할 때만 `-2`, `-3` 을 덧붙인다.
- **낙관적 잠금 (E-8)** — 폼이 `updated_at` 을 hidden 으로 실어 보내고, 저장 시 ①읽어온 값과 비교
  ②`UPDATE ... WHERE updated_at = <기대값>` 으로 한 번 더 건다. 불일치면 **덮어쓰지 않고** 경고만 띄운다.
- **저장·삭제·상태전환 직전 `content_revisions` 에 직전 값 스냅샷**을 적재한다 (롤백 레벨 1).
- 무효화는 `updateTag("content:complexes")` 1줄. `revalidatePath` 는 쓰지 않는다 (E-12).
- 편집 가능 필드: 단지명 · 지역 · **발주처** · 세대수 · 관리면적 · type(LH 구분) · 계약기간 ·
  별칭 · 대표사진(경로 입력 + Storage 업로드) · 추가사진 · isFeatured · is_active · sort_order.
  **발주처(`client`)는 지시서 필드 목록에 없었으나 추가했다** — 정렬 기준에 "발주처"가 있는데
  편집이 불가능하면 앞뒤가 맞지 않고, 상세 페이지 메타에도 노출되는 값이다.

### 13-3. `/cases` · `/cases/[slug]` 어댑터 전환

- `app/cases/page.tsx` — `async` 서버 컴포넌트로 바꿔 어댑터로 읽고 하위 클라 컴포넌트에 프롭 주입.
  `CasesStats`·`CasesGallery`·`PastProjects` 가 `"use client"` 라 어댑터를 직접 호출할 수 없다.
- `app/cases/[slug]/page.tsx` — `generateStaticParams()`·`generateMetadata()`·본문 전부 `getComplexes()`
  (= `is_active = true` 만) 기준. 카드·prev/next 링크는 **DB 의 불변 slug** 를 쓴다.
- 전환한 소비처 5개. **남은 소비처 51개** (§9.1 의 56개 − 5).
- `app/sitemap.ts` 는 **손대지 않았다** — 이번 전환 대상이 아니고, 파일 `complexes` 만 순회하므로
  과거 단지 URL 이 추가될 여지가 없다.

#### ⚠ 전환 중 잡은 실제 버그 — `params.slug` 인코딩

첫 프로덕션 빌드에서 **활성 153건 상세가 전부 404** 였다. 원인은 새로 만든 `toSlug()` 의 이중 인코딩이다.

실측으로 확정한 사실 (Next 16.2.6):

| 위치 | `params.slug` 형태 |
|------|--------------------|
| **페이지 라우트** `app/cases/[slug]/page.tsx` | **퍼센트 인코딩된 채로 도착** |
| 라우트 핸들러 `app/api/.../[slug]/route.ts` | 디코드돼서 도착 |

전환 전 코드가 `decodeURIComponent(slug)` 를 거쳤던 게 바로 이 때문이다. `toSlug()` 를
`encodeURIComponent(decodeURIComponent(x))` 멱등 정규화로 고쳤다 — 인코딩된 채로 오든 디코드돼 오든
같은 값이 나온다. 단지명에 `%` 가 있으면 이 정규화가 깨지지만 172건 전수 확인 결과 0건이고,
slug 는 불변이라 이후 새 이름이 기존 slug 에 영향을 주지 않는다.

검증: 단일 인코딩 URL → 200, 이중 인코딩 URL → 404 (기대대로).

### 13-4. DAY 3 필수 검증 5개 항목 — 전부 통과

프로덕션 빌드(`npm run build`, EXIT=0) 후 `next start` 로 **실제 HTTP 요청** 검증.

| # | 항목 | 결과 |
|---|------|------|
| ① | `generateStaticParams()` 가 `is_active=true` 153건만 반환 | ✅ 153건 · 과거 미포함 |
| ② | 활성 단지 상세 접근 | ✅ **200 / 153건 전수** |
| ③ | `is_active=false` slug 접근 시 404 유지 | ✅ **404 / 19건 전수** |
| ④ | `/cases` 목록에 과거 단지 계속 노출 | ✅ PAST PROJECTS 섹션 19건 · 카드 "주요(종료)" 2건 |
| ⑤ | `sitemap.ts` 에 과거 단지 URL 추가 안 됨 | ✅ 파일 무수정, `complexes` 만 순회 |
| ⑥ | `dynamicParams=true` 로 신규 단지 즉시 접근 | ✅ 미등록 slug → 404(동적 평가). 빌드타임 목록에 의존하지 않음 |

> ⑥ 보충 — 이 저장소는 §10-4 대로 전 라우트가 `ƒ`(Dynamic) 이라 `prerender-manifest.json` 의
> `routes`/`dynamicRoutes` 가 **비어 있다**. 프리렌더되는 경로가 애초에 없으므로
> `generateStaticParams()` 결과는 프리렌더 목록이 아니라 참고 목록일 뿐이고,
> 관리자가 등록한 새 단지는 재빌드 없이 곧바로 접근된다.

### 13-5. 회귀 확인 (3-4)

**상세 페이지 3건 × 2뷰포트 = 6장 전부 픽셀 동일** (`before/` ↔ `after/`).

`/cases` 는 픽셀 차이가 났으나 **코드 회귀가 아니라 캡처 아티팩트**다. 근거:

- 코드를 하나도 바꾸지 않고 재캡처했더니 desktop 차이가 **36.8% → 8.6%** 로 떨어졌다.
- 차이 구간을 잘라보면 레이아웃·배지·카드 위치는 동일하고 **사진만 미로드**(카드 배경 navy 노출) 상태다.
  로컬 `/_next/image` 최적화가 이 머신(load average 30↑)에서 느려 lazy 이미지가 캡처 시점에 안 붙는다.
- `before/` 는 프로덕션(Vercel), `after/` 는 로컬 빌드라 이미지 파이프라인 조건 자체가 다르다.

그래서 `/cases` 는 **SSR HTML 전수 비교**로 검증했다 (프로덕션 = 파일 기반 / 로컬 = DB 어댑터):

| 항목 | before(프로덕션) | after(로컬 DB) |
|------|-----------------|----------------|
| KEY PROJECTS 카드 수 | 27 | 27 |
| 주요 단지 / 주요(종료) | 15 / 2 | 15 / 2 |
| LH 발주 (카드 / 과거) | 10 / 2 | 10 / 2 |
| 과거 단지 | 19 | 19 |
| 과거 누적 세대수 | 11,374 | 11,374 |
| "종료" 배지 | 23 | 23 |
| `/cases/*` 링크 목록 | 23건 | 23건 · **순서까지 동일** |
| `aria-label="… 상세보기"` | 23건 | 23건 · 동일 |
| `<h3>` 단지명 | 21건 | 21건 · 동일 |
| 계약기간 문자열 | 18건 | 18건 · 동일 |

**전 항목 문자열 단위 완전 일치.**

비교 도구 `scripts/diff-regression.py` 를 추가했다 (PIL 기반, 허용오차 8, 차이 마스크를
`docs/regression/diff/` 에 출력). `docs/regression` 전체는 이미 `.vercelignore` 로 배포 제외.

> **지시서의 "컴팩트 리스트 154건 / LH 필터 / 페이지네이션" 은 현재 사이트에 존재하지 않는다.**
> 해당 기능은 `components/sections/cases/CasesList.tsx`(+`CasesFilter.tsx`) 에 구현돼 있으나
> **어떤 라우트에도 마운트돼 있지 않다**(`CasesMap.tsx` 도 동일). 프로덕션 `/cases` HTML 에
> "154" 가 0회 등장하는 것으로 확인했다. 전환 전후 모두 미노출이므로 회귀는 아니다. 사장된 코드다.

### 13-6. 미결·보고 사항

1. **`npm run dev` 가 main 에서도 전 요청 500 이다.** `app/globals.css:2` 의
   `@import url(pretendard)` 가 `@import "tailwindcss"` 뒤에 있어, Tailwind 인라인 확장 후
   `@import` 가 다른 룰 뒤로 밀리면서 Turbopack CSS 파서가 거부한다(페이지뿐 아니라 API 라우트까지 500).
   변경을 stash 하고 clean main 으로 재현 확인했다 — **기존 이슈이고 이번 작업과 무관**하다.
   **프로덕션 빌드에서는 warning 일 뿐이라 라이브 영향은 없다.** 다만 로컬 개발이 불가능해
   모든 검증을 20분짜리 프로덕션 빌드로 돌려야 한다. 1줄 순서 교체로 끝나고 폰트 결과물은 동일하다.
   계약 범위 밖이라 **손대지 않았다. 결정 요청.**
2. **`next.config.ts` 에 `experimental.serverActions.bodySizeLimit: "10mb"` 를 추가했다.**
   단지 대표 사진 업로드가 Server Action 으로 들어오는데 기본 1MB 로는 `site-images` 버킷
   상한(10MB)에 한참 못 미쳐 업로드가 막힌다. 편집 필드 "이미지"를 동작시키기 위한 필수 설정이다.
3. **`lib/supabase/database.types.ts` 를 재생성했다.** DAY 1 의 신규 테이블 6종이 타입에 없었다.
   Management API `/types/typescript` 로 재생성했고 순수 additive 다(기존 diff 는 알파벳 재정렬뿐).
   단 `posts.post_number` 는 **수동 보정**했다 — DB 상 `not null` + default 없음이라 생성기가 Insert
   필수로 뽑지만 실제로는 `assign_post_number()` BEFORE INSERT 트리거가 채운다. 보정 없이는
   기존 `app/admin/posts/actions.ts`·`app/notices/board/actions.ts` 가 타입 에러가 난다.
4. **`/cases` HTML 페이로드가 175KB → 252KB 로 늘었다.** 클라 컴포넌트에 단지 데이터를 프롭으로
   주입하면서 RSC 페이로드에 실린 결과다. 전환 전에는 같은 데이터가 클라이언트 JS 청크에 번들돼
   있었으므로 총 전송량은 대체로 상쇄되지만, 프롭을 카드 렌더에 필요한 필드로 좁히면 더 줄일 수 있다.
   **지금은 하지 않았다** — 필드를 깎으면 §13-5 의 "전 필드 동일" 보장이 깨져 회귀 판정이 어려워진다.
   DAY 10 최적화 후보로 남긴다.
5. **`"use server"` 파일은 async 함수만 export 할 수 있다.** 첫 빌드가 `actions.ts` 의 상수 export
   하나 때문에 실패했다. 저장소의 `"use server"` 파일 11개를 전수 점검해 동일 패턴이 없음을 확인했다.
6. **`components/sections/cases/CasesList.tsx:75` 에 기존 lint 에러**가 있다
   (`react-hooks/set-state-in-effect`). 손대지 않은 파일이고 어디에도 마운트돼 있지 않다. 보고만 한다.

---

## 14. DAY 4 실행 결과 (2026-08-25)

### 14-0. globals.css `@import` — 결정과 **원안 정정**

지시는 "`@import url(pretendard)` 를 `@import "tailwindcss"` 위로 올리는 1줄 교체" 였다.
**그 방법으로는 해소되지 않는다.** 실측으로 확인한 사실:

| 확인 | 결과 |
|------|------|
| 소스 순서를 pretendard → tailwindcss 로 교체 | dev 500 **그대로**. 에러 위치가 `globals.css:4513` 으로 동일하게 나온다 |
| 이유 | Tailwind v4 가 `@import "tailwindcss"` 를 4,500여 줄로 **인라인 확장**하면서 그 출력이 앞에 놓인다. 소스에서 pretendard 를 위로 올려도 생성된 CSS 에서는 여전히 확장분 **뒤**로 밀려 `@import rules must precede all rules` 위반이 된다 |
| 프로덕션 빌드는? | 경고만 내고 이 `@import` 를 **통째로 버린다**. 배포된 CSS 번들 `_next/static/chunks/13~0m58fe3nd2.css`(95KB) 를 직접 받아 grep 한 결과 **`pretendard` 문자열이 0회** |

즉 **라이브 사이트는 처음부터 Pretendard 를 받은 적이 없다.** `--font-sans` 의 다음 후보로 렌더돼 왔다.

이 사실 때문에 "고치는 방법"이 두 갈래로 갈린다.

| 안 | 내용 | 렌더 결과 |
|----|------|-----------|
| **A (채택)** | 죽어 있던 `@import` 를 **제거**만 한다 | 현재 라이브와 **완전 동일** |
| B | `layout.tsx` 에 `<link rel="stylesheet">` 로 옮겨 실제로 로드시킨다 | **전 페이지 텍스트 메트릭이 바뀐다** |

B 를 먼저 구현해 빌드·재캡처까지 돌려봤고, 실제로 전 페이지 높이가 줄었다
(`01_home_mobile` 12,526px → 12,356px, `02_about_desktop` 9,887px → 9,859px 등 8/12장에서 크기 변화).
지시서 조건이 **"로드되는 폰트 CSS와 최종 렌더 결과가 동일해야 한다"** 였으므로 B 를 되돌리고 **A 로 확정**했다.

- 결과: `npm run dev` 정상 기동 · 전 요청 200. 프로덕션 빌드 EXIT=0, 라우트 표 무변화(`○` 는 `/robots.txt`·`/sitemap.xml` 2개 그대로).
- 재캡처 대조에서 크기 변화 **0건**.

> **결정 요청** — Pretendard 를 실제로 적용할지 여부. 디자인 의도상 본문 한글은 Pretendard 가 맞지만
> (`--font-sans` 1순위로 선언돼 있다) 지금 켜면 전 페이지 줄바꿈·높이가 바뀐다. 이번 계약 범위 밖이라
> **켜지 않았다.** 켜려면 `layout.tsx` 에 `<link>` 1줄이면 되고, 켜는 순간 회귀 베이스라인 28장을
> 전부 다시 잡아야 한다.

### 14-1. 관리자 사이트 설정 (`/admin/content/settings`)

| 파일 | 내용 |
|------|------|
| `app/admin/content/settings/page.tsx` | 편집 화면 셸 + 실제값 집계 + 키 누락 안내 |
| `app/admin/content/settings/actions.ts` | Server Actions 5종 (company·contact·ceoMessage·counters·stats) |
| `components/admin/SettingsForms.tsx` | 5개 독립 폼 (클라이언트) |
| `components/admin/StatsReconciliation.tsx` | 실제값 ↔ 표기값 대조표 (E-7) |
| `components/admin/AdminTabs.tsx` | "사이트 설정" 탭 추가 (5탭 → 6탭) |

- **키마다 독립 `<form>`.** `site_settings` 는 키별로 `updated_at` 이 따로 있으므로 낙관적 잠금(E-8)도
  폼 단위로 걸린다. 연락처를 편집하는 중에 다른 관리자가 인사말을 저장해도 서로 충돌하지 않는다.
- 저장 흐름은 DAY 3 단지 CRUD 와 동일: `requireAdmin()` → 현재 행 읽기 → `updated_at` 비교 →
  `content_revisions` 스냅샷 → `UPDATE ... WHERE updated_at = <기대값>` → `updateTag("content:settings")`.
  `revalidatePath` 는 쓰지 않는다 (E-12).
- 선택 필드(`careersEmail`·`buildingAlias`·`businessHours`·`displayValue`·`displaySuffix`·`context`)는
  **빈 값이면 키 자체를 넣지 않는다.** 빈 문자열을 넣으면 소비처의 `contact.businessHours ? ...`
  분기가 의도와 다르게 참이 된다.
- 관리자 화면은 캐시 어댑터가 아니라 DB 직접 조회(`force-dynamic`). 저장 직후 최신 `updated_at` 이
  보여야 하기 때문이다.

### 14-2. STATS 이원화 UI (E-7)

`StatsReconciliation` 이 실제값과 표기값을 6행으로 나란히 보여주고, 괴리가 있으면 경고 배너를 띄운다.
배너 문구에 **"의도된 불일치"** 와 **"200+ 는 2026-05-30 클라이언트 요청 확정값(커밋 8a27ace)"** 을 명시했다.
자동 동기화 버튼은 만들지 않았다.

실측값 (2026-08-25, DB 직접 SQL):

| 항목 | 실제값 (자동 계산) | 표기값 (수기) | 차이 |
|------|-------------------|--------------|-----:|
| 운영 단지 | `complexes` `is_active = true` = **153** | `stats.activeComplexesDisplay` = **200** | +47 |
| LH 발주 | 운영 단지 중 `type = 'LH'` = **8** | `stats.lhProjectsDisplay` = **15** | +7 |
| 관리 세대수 | 운영 단지 `households` 합계 = **49,469** | `stats.managedHouseholds` = **49,469** | 일치 |
| 보유 인허가 | `licenses` 항목 수 = **9** | `stats.registeredLicenses` = **11** | +2 |
| 기술 인증 | `certifications` 항목 수 = **27** | `stats.certificationTypes` = **27** | 일치 |
| 자격증 보유 인력 | `certifications` 인원 합계 = **1,575** | `stats.certifiedProfessionals` = **1,575** | 일치 |

→ 현재 괴리 3건(운영 단지·LH 발주·보유 인허가). 전부 문서화된 의도적 값이다.
   ※ `type='LH'` 전체는 10건이지만 그중 2건은 과거 단지라 **운영 중 LH 는 8건**이다.
   §12-4 의 `type='LH'=10` 은 활성·과거를 합친 수치이므로 이 표와 모순되지 않는다.

추가로 **카운터 표기값 ↔ STATS 표기값 교차 경고**를 넣었다. `counters(key="complexes").displayValue`(200)와
`stats.activeComplexesDisplay`(200)는 서로 다른 키에 저장되지만 각각 메인 카운터와 `/cases` 통계 카드에
같은 숫자로 노출된다. 한쪽만 고치면 두 페이지가 다른 숫자를 말하므로 불일치 시 경고한다.

### 14-3. E-6 — `counters[1]` 인덱스 하드코딩 제거

`data/site-content.ts:818` 의 invariant 를 `counters.find((c) => c.key === "complexes")` 로 교체했다.
관리자 화면(`page.tsx`)도 전부 key 조회를 쓴다. 인덱스 참조는 저장소 전체에 **0건**
(`grep -rn "counters\[" app components lib data scripts` → invariant 주석 외 히트 없음).

### 14-4. E-10 — U+2011 왕복 보존 **통과**

검증 스크립트 `scripts/verify-settings-roundtrip.ts` 신설. 실행:

```
node --experimental-strip-types --import ./scripts/node-ts-register.mjs \
  scripts/verify-settings-roundtrip.ts
```

결과 — **18개 항목 전부 통과**:

```
✅ actions.ts 에 유니코드 정규화(normalize) 호출 없음
✅ actions.ts 에 하이픈 치환(replace) 호출 없음
✅ 저장 전 DB 주소에 U+2011 포함 — U+0020 U+0032 U+0032 U+0033 U+2011 U+0032 U+0032 U+002C ...
✅ multipart 전송 왕복 후 주소 코드포인트 동일 / U+2011 보존 / ASCII 하이픈 미혼입
✅ 낙관적 잠금 조건부 UPDATE 성공 · 토큰 갱신됨 · 표식 필드 저장 확인
✅ DB 왕복 후 주소 코드포인트 동일 / U+2011 보존 / ASCII 하이픈 미혼입
   SQL: {"nb_hyphen_pos":20,"ascii_hyphen_pos":0,"len":35}
✅ SQL position(chr(8209)) > 0     ← 20
✅ SQL position('-') = 0
✅ 원래 값으로 원복 · 코드포인트 동일 · 표식 제거
```

검증 경로 4단계:
1. **정적 가드** — `actions.ts` 코드(주석 제외)에 `normalize(` 또는 하이픈 치환 `replace(/…-…/)` 가 없는지.
   `normalize("NFKC"|"NFKD")` 는 U+2011 을 U+002D 로 **조용히** 바꾸므로 이 파일에 들어오면 안 된다.
2. **전송 왕복** — 브라우저 폼과 동일하게 `new Request(..., { body: FormData })` → `await req.formData()`
   로 multipart/form-data 인코딩·디코딩을 실제로 태운 뒤 액션이 주소에 적용하는 유일한 처리(`.trim()`)까지 통과.
3. **DB 왕복** — 낙관적 잠금 조건부 `UPDATE` → 재조회 → 코드포인트 단위 비교.
   `buildingAlias` 에 표식을 붙여 UPDATE 가 실제로 실행됐음을 증명한다.
4. **SQL 직접 확인** — Management API `/database/query` 로 `position(chr(8209))` / `position('-')`.

**추가로 실제 브라우저 폼 왕복도 돌렸다.** service_role 로 기존 점검 계정(`inspect-admin@kbgroup.kr`)의
매직링크를 발급해 세션 쿠키를 만든 뒤, playwright 로 `/admin/content/settings` 를 열고
**주소 입력란을 비웠다가 원래 값을 다시 입력해 저장**했다(관리자가 실제로 할 법한 최악의 시나리오).

```
DB 저장 전 주소 : "전남광주특별시 광산구 월계로 223‑22, 2층 201·202호"  U+2011 포함: true
폼에 표시된 주소  : "전남광주특별시 광산구 월계로 223‑22, 2층 201·202호"  코드포인트 동일: true
폼 제출 결과      : 저장 완료 배너 확인
DB 저장 후 주소   : "전남광주특별시 광산구 월계로 223‑22, 2층 201·202호"
  코드포인트 동일 : true | U+2011 보존: true | ASCII 하이픈 혼입: false
  표식 저장 확인  : true | updated_at 갱신: true
SQL 확인          : {"nb":20,"ascii":0}          ← position(chr(8209))=20, position('-')=0
감사 이력         : {"c":1}                       ← content_revisions 스냅샷 1건 적재
원복 확인         : true
```

검증 후 값은 원래대로 원복했다(원복 후 코드포인트 재확인 포함).
점검 과정에서 `content_revisions` 에 `site_settings/contact` 스냅샷이 몇 건 남았다 — 감사 테이블이므로 정상이다.
편집 폼에도 안내를 넣었다 — 주소 입력란 아래에 "번지수 하이픈은 U+2011 이니 일반 하이픈으로 바꾸지 마세요"
문구 + 현재 값에 U+2011 이 있는지 실시간 표시.

### 14-5. 소비처 전환 — 22개 파일

**전환 완료 (22)**

| 구분 | 파일 |
|------|------|
| 루트 레이아웃 경유 | `app/layout.tsx` → `components/layout/Footer.tsx` (company·contact) |
| 서버 페이지·라우트 | `app/api/contact/route.ts`, `app/not-found.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/(auth)/signup/pending/page.tsx`, `app/forgot-password/page.tsx`, `app/careers/openings/page.tsx`, `app/careers/openings/[id]/page.tsx` |
| `/about` | `CompanyOffice`, `WhyValues`, `WhyDifferentiators`, `WhyNumbers`, `OrganizationChart`, `RelatedCompaniesGrid`, `CollaboratorsTable` |
| `/about/ceo` | `CeoPortrait`, `CeoMessage` |
| `/about/history` | `HistoryTimeline` |
| `/about/location` | `LocationMap`, `LocationInfo` |
| `/contact` | `ContactForm` |

- 하위 섹션이 전부 `"use client"` 라 페이지를 `async` 서버 컴포넌트로 바꿔 프롭으로 주입하는
  DAY 3 `/cases` 패턴을 그대로 썼다.
- **`Footer` 는 `app/layout.tsx` 에서 주입**했다. 페이지를 하나도 건드리지 않고 전 페이지 푸터가
  한 번에 DB 를 보게 되는 유일한 지점이라 파급 대비 비용이 가장 싸다.
- 모듈 최상단 파생 상수 3개(`CompanyOffice.FACTS`, `LocationInfo.CONTACT_ROWS`/`ACCESS_CARDS`,
  `terms.SECTIONS`)는 프롭을 받아야 하므로 함수 안으로 옮기거나 팩토리 함수로 바꿨다.
- `yearsOfOperation` 은 설정 키가 아니라 `company.founded` 파생값이라
  **`lib/content/settings.ts` 에 `getYearsOfOperation()` 을 추가**했다. 계산식은 파일 원본과 동일
  (설립 월 1일 기준·365.25일/년 내림). 오늘 기준 양쪽 다 **12** 로 일치 확인.
- **도메인 타입 재수출** — `lib/content/types.ts` 에서 `Counter`·`Contact`·`OrgNode`·`HistoryEntry` 등
  10종을 타입 전용으로 재수출했다. 타입만 쓰겠다고 소비처가 데이터 파일을 직접 import 하면
  "누가 아직 파일을 보고 있나"를 grep 으로 셀 수 없어진다. 번들에는 아무것도 남지 않는다.

**남은 소비처 — 30개** (`grep -rl 'from "@/data/site-content"' app components`)

이 중 5개는 **타입 전용** import 다 (`BusinessHero`·`BusinessSubServices`·`BusinessOverview`·
`BusinessFAQ`·`BusinessRelatedCases`).

### 14-6. ⚠ 미결 — contact 소비처 7개가 아직 파일을 본다

지시서 4-4 의 **"나머지 페이지는 건드리지 말 것"** 을 지키느라 전환하지 못한 `contact` 소비처가 남았다.
전부 **범위 밖 페이지에 마운트돼 있어, 전환하려면 그 페이지를 `async` 로 바꾸고 프롭 1줄을 넘겨야 한다.**

| 파일 | 마운트 위치 | 필요한 페이지 수정 |
|------|-------------|-------------------|
| `components/sections/common/ContactInvite.tsx` | `/`, `/about`, `/about/ceo`, `/about/history`, `/about/location`, `/business`, `/cases`, `/licenses` | `app/page.tsx`·`app/business/page.tsx`·`app/licenses/page.tsx` (나머지는 이미 async) |
| `components/sections/Hero.tsx` | `/` | `app/page.tsx` |
| `components/sections/auth/LoginForm.tsx` | `/login` | `app/(auth)/login/page.tsx` |
| `components/sections/careers/CareersApply.tsx` | `/careers` | `app/careers/page.tsx` |
| `components/sections/careers/CareersOpenings.tsx` | `/careers` | `app/careers/page.tsx` |
| `components/sections/business/BusinessCTA.tsx` | `/business/[slug]` | `app/business/[slug]/page.tsx` (`businessAreas`·`complexes` 전환과 함께 해야 함) |
| `components/sections/CTA.tsx` | **없음 — 어디에도 마운트되지 않음** | 사장된 코드 (`CasesList`·`CasesMap` 과 동일 부류) |

**리스크:** 지금 상태에서 관리자가 대표 전화번호를 바꾸면 **푸터·오시는 길·상담 폼·개인정보처리방침 등
12곳은 즉시 바뀌지만, 메인 히어로·각 페이지 하단 ContactInvite·채용 페이지는 안 바뀐다.**
인수 전에 반드시 해소해야 하는 항목이다. `ContactInvite` + `Hero` 만 처리해도 사용자 눈에 띄는
불일치는 사라진다(페이지 3개에 `async` + 프롭 1줄). **진행 승인을 요청한다.**

### 14-6b. 관리자 UI · 캐시 무효화 실동작 검증

로그인 세션으로 프로덕션 빌드(`next start -p 3210`)에 붙어 실제 HTTP 로 확인했다.

- `/admin/content/settings` → **200**. 대조표·경고 배너·5개 폼 전부 정상 렌더.
  렌더된 값이 DB 실측과 일치: 운영 단지 153/200(+47) · LH 8/15(+7) · 세대수 49,469/49,469(일치) ·
  인허가 9/11(+2) · 기술 인증 27/27(일치) · 인력 1,575/1,575(일치) → **"괴리 3건" 배너 표시 확인**.
- **캐시 태그 무효화 (E-12 규약대로 `updateTag("content:settings")` 1줄)** — 폼에서 대표 전화를
  `062-416-3021` → `062-000-9999` 로 저장한 직후 재배포·재빌드 없이:

| 경로 | 새 번호 노출 | 옛 번호 잔존 |
|------|:---:|:---:|
| `/contact` | ✅ | 없음 |
| `/privacy` | ✅ | 없음 |
| `/notices` (푸터) | ✅ | — |
| `/about/location` | ✅ | **있음** ← `ContactInvite` (§14-6 미전환분) |

`/about/location` 에 옛 번호가 남는 것이 바로 §14-6 이 말하는 문제다. 같은 페이지 안에서
`LocationInfo`(전환됨)는 새 번호를, 하단 `ContactInvite`(미전환)는 옛 번호를 보여준다.
**§14-6 을 처리하지 않으면 인수 시 이 화면이 그대로 노출된다.**

검증 후 전화번호는 폼으로 다시 원복했고 `/contact` 재조회로 원복을 확인했다.

### 14-7. 회귀 대조

프로덕션 빌드(EXIT=0) → `next start -p 3210` → 실제 HTTP 로 검증했다.

**① SSR 텍스트 전수 대조 — 5개 페이지 전부 diff 0줄**

프로덕션(`kbgroup-renewal.vercel.app`, 파일 기반) ↔ 로컬(DB 어댑터) 의 렌더 HTML 에서
`<script>`/`<style>` 을 걷어내고 태그를 제거한 **가시 텍스트 전문**을 비교했다.

| 페이지 | 프로덕션 줄 수 | 로컬 줄 수 | diff |
|--------|---------------:|-----------:|-----:|
| `/about` | 322 | 322 | **0** |
| `/about/ceo` | 117 | 117 | **0** |
| `/about/history` | 175 | 175 | **0** |
| `/about/location` | 128 | 128 | **0** |
| `/contact` | 131 | 131 | **0** |

`/about/location`·`/contact` 렌더 HTML 의 U+2011 등장 횟수도 프로덕션·로컬 **각각 1회로 동일**.

**② 스크린샷 대조 (`before/` ↔ `after/`, 12장)**

| 파일 | 결과 |
|------|------|
| `03_about-ceo_desktop` / `_mobile` | **픽셀 동일** |
| `04_about-history_desktop` / `_mobile` | **픽셀 동일** |
| `10_contact_desktop` / `_mobile` | **픽셀 동일** |
| `02_about_desktop` / `_mobile` | 1.86% / 3.60% — **캡처 아티팩트** (아래) |
| `05_about-location_desktop` / `_mobile` | 0.51% / 2.58% — **캡처 아티팩트** (아래) |
| `01_home_desktop` / `_mobile` | 9.66% / 27.32% — **이번 DAY 에 코드를 하나도 안 바꾼 페이지**. 노이즈 하한선 |

크기 변화 **0건** (13-0 의 B안에서는 8장에서 크기가 바뀌었다).

**아티팩트 판정 근거** — 차이 구간을 잘라 직접 확인했다.

- `02_about` 차이 구간 (1063~1222, 3806~4010 …) 은 **`before` 쪽에서 해당 블록이 통째로 안 보이는** 상태다.
  `after` 에는 「본사 소재지 / 운영 시작 / 자본금」 패널과 「49,469+ / 200+ / 11 / 1,575+」 카운터가 정상 렌더돼 있다.
  섹션 전체 높이는 9,887px 로 **양쪽 동일** — 자리는 차지하고 있고 `opacity` 만 0 이다.
  framer-motion `whileInView` 스태거가 프로덕션 캡처 시점에 발화하지 않은 것으로, **`before` 쪽 캡처 결함**이다.
  같은 텍스트가 프로덕션 HTML 에도 존재함을 ①에서 확인했다(`본사 소재지`·`자본금`·`12억 1천만원` 각 1회, 양쪽 동일).
  덤으로 이 캡처가 **DB 값이 그대로 렌더된다는 증거**가 된다 — 운영 단지 카운터가 `200+` 로 나온다.
- `05_about-location` 차이 구간은 **OpenStreetMap iframe 타일 영역 단일 구간**이다.
  로컬 캡처에서 타일이 안 붙었다. 주소 텍스트·버튼·레이아웃은 동일.
- `01_home` 은 이번 DAY 에 코드 변경이 **전혀 없는** 페이지인데도 9.66%/27.32% 차이가 난다.
  `before` 는 Vercel 프로덕션, `after` 는 이 머신의 로컬 빌드라 이미지 파이프라인 조건 자체가 다르다
  (§13-5 에서 `/cases` 에 대해 이미 확인한 것과 같은 현상). **/about·/about/location 의 차이는 이 하한선보다 작다.**

### 14-8. 검증 요약

| 항목 | 결과 |
|------|------|
| `tsc --noEmit` | EXIT=0 |
| `eslint` (변경 파일 전수) | 신규 error·warning **0건** (기존 `app/api/contact/route.ts` warning 2건은 `git stash` 로 사전 존재 확인) |
| `npm run build` | EXIT=0 · 라우트 표 무변화 · `/admin/content/settings` 신규 등록 |
| `npm run dev` | **정상 기동** — `/`·`/about`·`/about/location`·`/contact` 전부 **200** (기존 전 요청 500 해소) |
| 관리자 UI 실동작 | 로그인 세션으로 `/admin/content/settings` 200 · 대조표/배너/폼 정상 · 저장 → 공개 페이지 즉시 반영 |
| U+2011 왕복 | 18/18 통과 · `position(chr(8209)) = 20`, `position('-') = 0` |
| SSR 텍스트 대조 | 5페이지 diff **0줄** |
| 스크린샷 | 6장 픽셀 동일 · 나머지 4장은 캡처 아티팩트 판정 · 크기 변화 0 |

### 14-9. 미결·보고 사항

1. **§14-6 — contact 소비처 7개 미전환.** 진행 승인 요청. (가장 시급)
2. **§14-0 — Pretendard 실제 적용 여부.** 결정 요청. 지금은 라이브와 동일하게 **로드하지 않는다**.
3. **`components/sections/CTA.tsx` 는 어디에도 마운트돼 있지 않다.** `CasesList`·`CasesMap` 과 같은
   사장된 코드다. 삭제 여부는 범위 밖이라 보고만 한다.
4. **`counters` 항목의 추가·삭제·순서 변경 UI 는 만들지 않았다.** 계약 문구는 "메인 카운터 4종"이고
   순서 변경은 §4 DAY 8(섹션 순서)의 대상이다. 현재는 4개 항목의 값·라벨·표기값만 편집한다.
5. **`scripts/verify-settings-roundtrip.ts` 는 프로덕션 DB 에 실제 쓰기를 한다.** 검증 후 원복하지만
   `content_revisions` 에는 남지 않는다(액션이 아니라 service_role 직접 쓰기라서). 재실행 안전하다.

---

## 15. DAY 5 실행 결과 (2026-08-25)

### 15-0. Pretendard — 별도 안건 (계약 범위 밖)

**결정: 이번 계약에서는 켜지 않는다.** §14-0 의 A안(죽은 `@import` 제거) 상태를 유지한다.

| 사실 | 실측 |
|------|------|
| 배포 CSS 번들의 `pretendard` 문자열 | **0회** — 라이브는 처음부터 Pretendard 를 받은 적이 없다 |
| `--font-sans` 1순위 선언 | `globals.css` 에 **그대로 남아 있다** |
| 지금 적용하면 | 전 페이지 텍스트 메트릭이 바뀐다 — **실측 12장 중 8장에서 크기 변화** (`01_home_mobile` 12,526px → 12,356px 등) |
| 적용하려면 | 회귀 베이스라인 28장 **전부 재수립** 필요 |

이번 계약(PLAN B 350,000원)은 관리자 편집 기능 개발이다. 사이트 폰트 변경은 범위 밖이고,
회귀 검증 기준선이 흔들리면 DAY 5~10 검증이 전부 무의미해진다.
**DAY 10 납품 보고에 이 항목을 포함한다.** 클라이언트 안내는 별도로 진행한다.

### 15-1. contact 소비처 7개 — 전부 해소 (§14-6 미결 종결)

| 컴포넌트 | 처리 | 페이지 수정 |
|----------|------|-------------|
| `ContactInvite` | `contact` 프롭 추가 | `app/page.tsx`·`business/page.tsx`·`licenses/page.tsx` 를 `async` 로. 이미 async 이던 `/about`·`/about/ceo`·`/about/history`·`/about/location`·`/cases`·`/careers` 는 프롭 1줄 |
| `Hero` | `contact` 프롭 추가 | `app/page.tsx` |
| `LoginForm` | `contact` 프롭 추가 | `app/(auth)/login/page.tsx` (이미 async) |
| `CareersApply` | `contact` 프롭 추가 | `app/careers/page.tsx` |
| `CareersOpenings` | `contact` 프롭 추가 (원래 async 서버 컴포넌트) | `app/careers/page.tsx` |
| `BusinessCTA` | `contact` 프롭 추가 | `app/business/[slug]/page.tsx` (businessAreas 전환과 동시) |
| `CTA` | **손대지 않음** — 어디에도 마운트되지 않은 사장 코드 (지시대로 삭제도 하지 않음) |

- 프롭 타입은 DAY 4 규약(`SettingValue<"contact">`)을 그대로 따랐다. 페이지 구조 변경은 하지 않았다 —
  `app/page.tsx` 의 히어로 슬라이드·`FadeIn` 래핑은 그대로다(프롭 주입 6줄 + `async` 1줄이 전부).

**대표 전화 변경 실측** — 관리자 폼에서 `062-416-3021` → `062-000-9999` 저장 직후,
재배포·재빌드 없이 공개 페이지 **14곳 전부**를 HTTP 로 확인했다.

```
✅ 대표 전화 변경 — 공개 페이지 14곳에 옛 번호(062-416-3021) 잔존 0
   새 번호(062-000-9999) 노출: 14/14
✅ 대표 전화 원복
```

대상 14곳: `/` `/about` `/about/ceo` `/about/history` `/about/location` `/business`
`/business/facility` `/cases` `/licenses` `/careers` `/contact` `/notices` `/login` `/privacy`.
§14-6b 에서 옛 번호가 남던 `/about/location` 도 이제 잔존 0이다.

### 15-2. 편집 UI — site_settings 잔여 12키

| 파일 | 내용 |
|------|------|
| `components/admin/settings-schema.ts` | 목록형 11키의 **필드 정의 단일 출처**. 폼과 Server Action 이 같은 스키마를 읽는다 |
| `components/admin/ListEditor.tsx` | 목록형 공용 편집기 (추가·삭제·위/아래 이동·이미지 업로드) |
| `components/admin/org-tree.ts` | 트리 ↔ 아웃라인 변환 + 노드 카운트 (순수 모듈 — 클라이언트·서버 공용) |
| `components/admin/OrgChartEditor.tsx` | 조직도 아웃라인 편집기 |
| `app/admin/content/settings/actions.ts` | `saveListSetting`(11키 공용) · `saveOrganization` · `uploadSettingImage` 추가 |
| `app/admin/content/settings/page.tsx` | 편집기 12개 렌더 + 항목 바로가기 목차 (총 17개 편집 블록) |

설계 결정 3가지:

1. **11개 키를 폼 하나로 묶지 않고, 폼을 11번 쓰지도 않았다.** 스키마 기반 범용 편집기 1개다.
   같은 코드를 11번 복사하면 그중 한 곳만 고치는 실수가 곧바로 데이터 유실이 된다.
   Server Action 도 하나(`saveListSetting`)이고, 폼이 실어 보낸 `settingKey` 는
   **스키마 화이트리스트에 없으면 거절**한다 — 임의 키로 `site_settings` 를 덮어쓸 수 없다.
2. **`businessAreas`·`processSteps` 는 값만 수정 가능**(항목 추가·삭제·순서 변경 차단).
   `businessAreas.id` 는 코드의 `BusinessCategory` 유니온이자 FAQ·비주얼 맵의 키이고,
   `slug` 는 `/business/[slug]` URL 이다(E-1). `processSteps` 는 `numberLabel`(01~04)이 배열 순서와 짝이라
   순서만 바꾸면 번호가 어긋난다. 섹션 순서 변경은 DAY 8 의 주제다.
3. **이미지 업로드는 `licenses.image`·`relatedCompanies.logo` 2곳에 붙였다** (계약 ITEM 01 "로고" 항목).
   단지 CRUD 와 같은 `site-images` 버킷·같은 ASCII 파일명 규약. 비워두면 기존 이미지를 유지한다.

낙관적 잠금(E-8)·`content_revisions` 스냅샷·`updateTag("content:settings")` 무효화는
DAY 4 의 `persist()` 를 그대로 재사용했다. `revalidatePath` 는 여전히 쓰지 않는다 (E-12).

### 15-3. 조직도 트리 편집 — 자식 유실 0

트리를 **들여쓰기 목록(아웃라인)** 으로 평탄화해 편집한다. 한 노드의 하위 트리는 곧
"바로 아래에 이어지는 더 깊은 depth 행들의 연속 구간"이라, 구간을 통째로 옮기고 지우면
**자식 유실이 원리적으로 일어나지 않는다.** 저장 시 depth 스택으로 트리를 다시 세운다.

3중 방어:
- **화면** — 노드 총 개수를 상단에 항상 표시하고, 불러올 때와 달라지면 경고 배너를 띄운다.
  하위가 있는 노드를 지울 때는 "아래 N개 하위 조직도 함께 삭제됩니다" 확인을 받는다.
- **서버** — 아웃라인 행 수와 변환된 트리의 노드 수가 다르면 **저장하지 않는다.**
  이름이 빈 노드도 조용히 버리지 않고 오류로 돌려준다(버리면 그 자식들이 다른 부모로 옮겨 붙는다).
- **검증 스크립트** — `scripts/verify-org-roundtrip.ts`.

```
조직도 원본 — 본사 11노드 · 지사 2노드 · 합계 13
✅ 아웃라인 행 수 == 원본 노드 수 — 11 + 2 vs 13
✅ 트리 → 아웃라인 → 트리 가 원본과 구조·문자열까지 동일
✅ 하위 추가 — 노드 +1
✅ 하위 트리 삭제 — "총괄사장"(자식 9) 삭제 후 노드 -10
✅ 형제 이동 — "사장" ↔ "부동산임대관리" 후 노드 수 불변 · 이름 집합 불변
✅ 들여쓰기 — "총무부" 하위 트리 이동 후 노드 수 불변
✅ DB 왕복 후 노드 수 보존 — 13 vs 13 · 원복 확인
```

**편집 전후 노드 총 개수: 13 → 13** (브라우저 실동작에서도 동일, §15-5).

### 15-4. 소비처 전환 — 26개 파일, 잔여 4개(전부 사장 코드)

**전환 완료 (26)**

| 구분 | 파일 |
|------|------|
| 메인 | `app/page.tsx` → `Hero`·`TrustSignals`·`DataCounter`·`ServiceCategories`·`Cases`·`Partners`·`ContactInvite` |
| `/business` | `app/business/page.tsx` → `BusinessIntroAlternating` |
| `/business/[slug]` | `app/business/[slug]/page.tsx` → `BusinessOverview`·`BusinessSubServices`·`BusinessProcess`·`BusinessFAQ`·`BusinessRelatedCases`·`BusinessCTA` |
| `/licenses` | `app/licenses/page.tsx` → `WorkforceStats`·`LicensesKPI`·`LicensesOverview`·`LicensesGrid`·`CertificationsGrid` |
| `/careers` | `app/careers/page.tsx` → `CareersOpenings`·`CareersApply` |
| `/login` | `app/(auth)/login/page.tsx` → `LoginForm` |
| 전역 | `app/layout.tsx` → `Header` (businessAreas), `app/sitemap.ts` |

- **`Header` (E-2)** — `NAV_ITEMS` 모듈 상수를 `buildNavItems(businessAreas)` 팩토리로 바꾸고
  `app/layout.tsx` 에서 프롭 1줄로 주입했다. `LayoutGroup`·`usePathname`·framer-motion 로직은
  **한 줄도 건드리지 않았다.** 변경분은 import 1줄 + 프롭 1줄 + 팩토리 감싸기 + 참조 2곳(`NAV_ITEMS` → `navItems`)뿐이다.
- **`app/sitemap.ts` (E-1)** — `encodeURIComponent(c.name)` → `c.slug`(DB 불변 slug)로 교체했다.
  프로덕션 sitemap 과 **191개 URL 전부 일치** (아래 검증).
- **`Cases.tsx` (E-1)** — 메인 단지 카드 링크도 `encodeURIComponent(c.name)` → `c.slug`.
  저장소 전체에서 `/cases/` URL 을 이름으로 만드는 코드는 이제 **0건**이다.
- **타입 전용 5개**(`BusinessHero`·`BusinessSubServices`·`BusinessOverview`·`BusinessFAQ`·`BusinessRelatedCases`)도
  `@/lib/content` 재수출로 옮겨 `grep` 잔여를 0으로 만들었다.
- `LicensesKPI` 의 모듈 최상단 파생 함수 2개(`latestAcquired`·`uniqueIssuerCount`)는 인자를 받는 함수로 바꿨다.

**잔여 소비처 — 4개. 전부 어디에도 마운트되지 않은 사장 코드다.**

| 파일 | 상태 |
|------|------|
| `components/sections/CTA.tsx` | 마운트 0건 (지시대로 삭제하지 않음) |
| `components/sections/cases/CasesList.tsx` | 마운트 0건 (`CasesGallery` 주석에만 언급) |
| `components/sections/cases/CasesMap.tsx` | 마운트 0건 |
| `components/sections/about/CompanyStrengths.tsx` | 마운트 0건 (2026-05 `/about` 에서 제외, 주석만 남음) |

즉 **살아 있는 소비처 기준 잔여 0**, 타입 전용 잔여 0. 사장 코드 정리는 범위 밖이라 보고만 한다.

### 15-5. 검증

**① SSR 가시 텍스트 전문 대조 — 18개 경로 전부 diff 0줄** (`scripts/diff-ssr-text.mjs` 신설)

프로덕션(`kbgroup-renewal.vercel.app`, 파일 기반) ↔ 로컬 프로덕션 빌드(DB 어댑터).

```
✅ /(164줄) /about(194) /about/ceo(71) /about/history(79) /about/location(74)
✅ /business(87) /business/facility(109) /business/sanitation(112)
✅ /business/security(110) /business/construction(110) /business/others(111)
✅ /cases(223) /licenses(191) /careers(120) /contact(62) /notices(53) /login(47) /privacy(75)
✅ 전 경로 diff 0줄
```

**② sitemap 대조** — 프로덕션 191 URL ↔ 로컬 191 URL, **diff 0**. (`/cases/*` 153건 + `/business/*` 5건 포함)

**③ 관리자 UI 실동작** (`scripts/verify-day5-admin.mjs` 신설 — 실제 브라우저 로그인 후 폼 조작)

```
✅ 편집 섹션 17개 전부 렌더
✅ 인허가 9건 / 인증 27건 / 연혁 16건 / 조직도 13노드 렌더
✅ 무변경 왕복 — coreValues(3)·differentiators(5)·companyStrengths(5)·history(16)·
   partners(8)·collaborators(15)·relatedCompanies(4)·licenses(9)·certifications(27)·
   businessAreas(5)·processSteps(4) 저장 전후 JSON 완전 일치       ← 11/11
✅ 대표 전화 변경 — 공개 페이지 14곳 옛 번호 잔존 0 · 새 번호 14/14 · 원복
✅ 연혁 추가 → DB 17건 → /about/history 즉시 반영 → 삭제 → 16건 원복(원본과 완전 동일)
✅ 조직도 형제 이동 저장 → 노드 13 유지 · 이름 집합 불변 · /about 렌더 정상 · 원복
```

**무변경 왕복 11/11 이 이 DAY 의 핵심 증거다.** 범용 편집기의 유일한 치명적 실패 모드는
"화면에 없는 필드가 저장 때 조용히 사라지는 것"인데, 아무것도 고치지 않고 저장했을 때
저장 전후 JSON 이 완전히 같다는 것은 11개 키 × 101개 항목의 전 필드가 왕복을 통과했다는 뜻이다.

**④ 어댑터 3모드 재검증** — 위 저장 왕복을 전부 거친 뒤에도 DB 값이 파일 원본과 **불일치 0건**.

```
[db] total=172 active=153 past=19 → ✅ 파일 원본과 불일치 0건
[file] … ✅   [broken] … ✅        → ✅ 3모드 전부 통과
```

**⑤ U+2011 왕복 재검증 — 18/18 통과.** 정적 가드가 새 `uploadSettingImage` 의
확장자 정리(`.replace(/[^a-z0-9]/g, "")`)를 하이픈 치환으로 오탐해 1건 실패했다.
문자 클래스 안의 하이픈은 범위 표기이므로, **문자 클래스를 지운 뒤 검사**하도록 가드를 정정했다.
진짜 하이픈 치환(`.replace(/‑/g, "-")`)은 그대로 걸린다.

**⑥ 빌드·정적 검사**

| 항목 | 결과 |
|------|------|
| `tsc --noEmit` | EXIT=0 |
| `eslint` (변경·신규 44파일) | **신규 error·warning 0건**. 보고된 3 error·1 warning 은 `git stash` 로 사전 존재 확인 (`Header`·`Hero`·`LicensesOverview`·`BusinessRelatedCases`). `LicensesOverview` 의 미사용 import warning 1건은 이번 전환으로 **없어졌다** |
| `npm run build` | EXIT=0 · **라우트 표 무변화** (`○` 는 `/robots.txt`·`/sitemap.xml` 2개 그대로, 나머지 51개 `ƒ`) |
| `next start` 실HTTP | 공개 19경로 전부 **200** |

### 15-6. 보고 사항

1. **계열사(`relatedCompanies`)는 6종이 아니라 4종이다.** DB·파일 모두 4건
   (㈜케이비뷰·㈜금태건설·㈜더케이금융대부·㈜케이위더스). `data/site-content.ts` 주석의
   "기존 4개 → 6개 확장" 문구가 실제 배열과 어긋나 있다. 데이터 자체는 건드리지 않았다 —
   6종이 맞다면 관리자 화면에서 2건 추가하면 된다.
2. **`partners.placeholder` 필드는 편집 UI 에 넣지 않았다.** 타입에는 있으나 소비처가 한 곳도
   읽지 않고, 현재 8건 어디에도 값이 없다. 넣으면 쓰이지 않는 체크박스가 관리자에게 노출된다.
3. **`companyStrengths` 는 어느 페이지에도 노출되지 않는다**(2026-05 `/about` 에서 제외).
   편집은 가능하게 두되, 편집기 상단에 "현재 어느 페이지에도 노출되지 않습니다"를 명시했다.
4. **무변경 왕복 검증이 `content_revisions` 에 스냅샷 11건 + 편집 검증분 몇 건을 남겼다.**
   감사 테이블이므로 정상이다.
5. **`scripts/verify-day5-admin.mjs` 는 프로덕션 DB 에 실제 쓰기를 한다.** 검증 후 전부 원복하며
   원복 결과를 다시 대조한다. 재실행 안전하다. playwright 는 `PLAYWRIGHT_PATH` 주입 방식 유지
   (`package.json` 무수정).

---

## 16. DAY 6 실행 결과 (2026-08-25)

### 16-0. 설계 결정 — 업로드를 Server Action 으로 보내지 않는다

DAY 3·5 의 이미지 업로드는 파일을 **Server Action 본문**에 실어 보냈다. 로컬에서는 동작하지만
**프로덕션에서는 4.5MB 를 넘는 순간 막힌다** — Vercel 서버리스 함수의 요청 본문 상한이 4.5MB 이고,
`next.config.ts` 의 `serverActions.bodySizeLimit` 을 아무리 올려도 이 상한은 그대로다.
히어로 영상은 이미 20MB(버킷 상한 50MB)라 이 경로로는 **원천적으로 불가능**하다.

그래서 `components/admin/MediaUploader.tsx` 는 **브라우저에서 Storage 로 직접 올린다.**

| 항목 | 처리 |
|------|------|
| 인증 | 브라우저 Supabase 클라이언트(anon key) + Storage RLS `is_admin()` (마이그레이션 007). 서버 경유와 보안 등가 |
| 경로 | `{scope}/{entity-id}/{timestamp}-{slug}.{ext}` · 파일명은 ASCII 로만 (한글 원본명은 Storage 키를 깨뜨린다) |
| 덮어쓰기 | **하지 않는다** (`upsert: false`). 항상 새 키로 올린다 |
| 포인터 교체 | **업로드 성공 후에만** hidden input 값을 바꾼다. 실패하면 기존 값 그대로 — 액션은 포인터 교체만 책임진다 |
| 삭제 | **포인터만 비운다. Storage 객체는 지우지 않는다** — 지우면 `content_revisions` 스냅샷으로 되돌려도 이미지가 404 가 되어 롤백이 반쪽이 된다 |
| 검증 | 클라이언트에서 MIME·크기를 버킷 스펙(이미지 10MB / 영상 50MB)과 대조한 뒤 올린다 |

Server Action 쪽에서는 `uploadSettingImage()`·`uploadImage()`(단지) 두 함수와 `File` 처리 분기를
전부 걷어냈다. 액션이 받는 것은 **문자열 하나**뿐이다.

### 16-1. 신규·변경 파일

| 파일 | 내용 |
|------|------|
| `components/admin/MediaUploader.tsx` | **신규.** 업로드·교체·삭제·미리보기 공용 위젯 (이미지·영상 겸용) |
| `components/admin/ListEditor.tsx` | `kind: "image"` 필드를 MediaUploader 로 교체 · 행 삭제 버튼에 `data-row-delete` |
| `components/admin/settings-schema.ts` | `accept` 필드 추가 · **`heroSlides`·`businessGallery` 스키마 2종 신설** |
| `components/admin/SettingsForms.tsx` | 대표 인사말 폼에 대표 프로필 사진 업로더 |
| `components/admin/ComplexForm.tsx` | 단지 대표 사진을 MediaUploader 로 교체 |
| `components/sections/Hero.tsx` | 모듈 상수 `SLIDES` 제거 → `slides` 프롭 주입 |
| `components/sections/business/BusinessSubServices.tsx` | 모듈 상수 `GALLERY_IMAGES` 제거 → `gallery` 프롭 주입 |
| `components/sections/about/CeoPortrait.tsx` | 하드코딩 사진 경로 → `ceoMessage.portrait` |
| `data/site-content.ts` | `heroSlides`·`businessGallery` export 추가 · `ceoMessage.portrait` 추가 |
| `lib/content/*` | FILE_SETTINGS 17키 → **19키** · 타입 재수출 2종 |
| `supabase/migrations/20260825000001·2` | `heroSlides` · `businessGallery` 삽입 + `ceoMessage.portrait` 덧붙이기 (**적용 완료**) |
| `scripts/lib/admin-session.mjs` | **신규.** 관리자 로그인 브라우저 세션 (DAY 5·6 검증 스크립트 공용) |
| `scripts/verify-day6-media.mjs` | **신규.** 실제 파일 업로드 → 저장 → 반영 → 원복 전 과정 검증 |

편집 블록은 17개 → **19개**, 목록형 키는 11개 → **13개**가 됐다.

### 16-2. 히어로 영상·사진 교체 (계약 ITEM 02)

- 기존 8슬라이드(영상 5 + 사진 3)를 `site_settings.heroSlides` 로 올렸다. **값·순서·문자열 동일.**
- 관리자가 **추가·삭제·순서 변경·교체**를 모두 할 수 있다. 슬라이드 카운터(`01 / 08`)는
  하드코딩이 아니라 배열 길이에서 계산하므로 개수를 바꾸면 **자동으로 따라간다** (9슬라이드 → `09` 실측).
- `src` 필드는 `accept: "both"` 다 — **파일 종류(MIME)로 버킷을 자동 선택**한다.
  영상이면 `site-videos`(50MB), 사진이면 `site-images`(10MB).
- crossfade·자동전환·영상 onEnded 핸드오프·Ken Burns·reduced-motion 로직은 **한 줄도 바꾸지 않았다.**
  변경분은 모듈 상수를 프롭으로 바꾼 것과 `SLIDES.length` → `count` 치환이 전부다.

### 16-3. 기존 자산과 공존 (6-2)

`/images/...` 로컬 경로와 `https://...supabase.co/...` Storage URL 이 **같은 필드에 섞여 들어간다.**
렌더러는 분기하지 않고 `next/image`·`<video>` 에 그대로 넘긴다. `public/images` 190MB 는
**마이그레이션하지 않았다**(범위 밖) — 8슬라이드 전부 로컬 경로로 시작해 필요한 것만 갈아 끼우면 된다.

### 16-4. 검증 — `scripts/verify-day6-media.mjs` (실제 업로드)

```
업로드 대상 — 이미지 2.4MB · 영상 19.3MB

✅ 히어로 슬라이드 8개 렌더 (영상 5 · 사진 3) · 사업영역 현장 사진 6장 렌더
✅ 업로더 위젯 36개 렌더
✅ 이미지 업로드 — site-images/related-companies/0/1787661029901-slide-06.png · 직접 접근 200
✅ 저장 후 DB 포인터 교체 · 나머지 계열사 3건 무변경 · /about 즉시 반영(재빌드 없이)
✅ E-4 remotePatterns — /_next/image?url=<Storage URL> → HTTP 200 · image/png
✅ 영상 업로드 (19.3MB) — site-videos/hero/0/… · 200 · 20,192,088 bytes 크기 일치
✅ heroSlides[0].src 교체 · 슬라이드 수 유지 · 나머지 7슬라이드 무변경 · 메인 즉시 반영
✅ 카운터 08 · 다음 버튼 → 02 · video 5 / img 3 렌더
✅ 슬라이드 추가 → 9개 · 카운터 09 자동 증가 → 순서 변경(이름 집합 불변) → 삭제 → 8개 원복
✅ heroSlides·relatedCompanies 원복 — 원본과 완전 일치
✅ 무변경 왕복(캐시 무효화 겸용) → 메인·/about 원래 경로로 복귀
✅ DAY 6 전 항목 통과
```

**E-4 는 이것으로 해소됐다.** DAY 1 에 `remotePatterns` 를 넣기만 했지 Storage URL 이 실제로
`/_next/image` 를 통과하는지는 확인한 적이 없었다. 이제 200 + `image/png` 로 실측했다.

**50MB 상한 실측** — 19.3MB 영상이 업로드·저장·재생까지 전부 통과했다. Server Action 경로였다면
프로덕션에서 4.5MB 에서 막혔을 크기다.

### 16-5. 회귀

| 항목 | 결과 |
|------|------|
| 무변경 왕복 (DAY 5 스크립트, **13키**) | heroSlides(8)·businessGallery(6) 포함 **13/13 저장 전후 JSON 완전 일치** |
| 단지 편집 폼 | 기존 로컬 경로(`/images/ipark/계림아이파크 SK뷰.PNG`) 유지 · 무변경 저장 시 **전 컬럼 완전 일치** |
| DAY 5 전 항목 | 대표 전화 14곳·연혁 추가/삭제·조직도 13노드 이동·원복 **전부 통과** |
| 어댑터 3모드 | `[db]`·`[file]`·`[broken]` 전부 파일 원본과 불일치 0건 |
| 시드 딥 비교 | complexes 172행 + **site_settings 19키** 코드포인트 단위 **전부 일치** |
| SSR 가시 텍스트 (18경로) | 프로덕션(파일) ↔ 로컬(DB) **전 경로 diff 0줄** |
| 메인 스크린샷 | `01_home_desktop` 0.29% / `_mobile` 0.58% — DAY 4 노이즈 하한선(9.66%/27.32%)보다 **훨씬 작다.** 크기 변화 0 |
| 모바일 히어로 | 390×844 에서 높이 844px 풀스크린 · 카운터 `01/08` · 9초 후 `02` 자동 전환 · video 5 |
| `tsc --noEmit` | EXIT=0 |
| `eslint` (변경 22파일) | **신규 error·warning 0건.** 보고된 1 error 는 `Hero.tsx:37` 의 사전 존재분(§15-6) |
| `npm run build` | EXIT=0 · **라우트 표 무변화** (`○` 2개 그대로, 나머지 51개 `ƒ`) |

### 16-6. 보고 사항

1. **DAY 3·5 의 업로드 경로는 프로덕션에서 4.5MB 초과 파일을 올릴 수 없는 상태였다.**
   로컬에서만 검증했기 때문에 드러나지 않았다. DAY 6 에서 브라우저 직접 업로드로 바꿔 해소했다.
   `next.config.ts` 의 `serverActions.bodySizeLimit: "10mb"` 는 이제 업로드와 무관하다 —
   설정 자체는 건드리지 않았다(텍스트 폼 여유분으로 남긴다).
2. **`ceoMessage` 에 `portrait` 키를 덧붙였다.** 마이그레이션은 기존 값(인사말 7문단)을 보존한 채
   `value || '{"portrait":…}'` 로 병합한다. 적용 후 문단·작성자·직함 보존을 실측 확인했다.
3. **`businessGallery` 는 5개 사업영역이 공유하는 6장이다.** 영역별로 다른 사진을 쓰려면
   구조 자체를 바꿔야 한다(영역당 배열). 현재 구조를 유지했다 — alt 는 사업영역명에서 생성되므로
   SSR 텍스트에 영향이 없고, 그래서 18경로 diff 가 0줄로 유지됐다.
4. **`/images/hero` 에는 쓰이지 않는 영상 4개(합계 약 37MB)와 PNG 다수가 남아 있다.**
   슬라이드에 연결된 것은 `video-01~05.mp4` + `slide-01~08.png` 뿐이다. 정리는 범위 밖이라 보고만 한다.
5. **업로드 후 교체·삭제로 버려진 Storage 객체는 지우지 않는다** (16-0 의 롤백 근거).
   장기적으로 미참조 객체가 쌓이면 정리가 필요하다 — 별도 안건.
6. 검증이 `content_revisions` 에 스냅샷을 남겼고, `site-images`/`site-videos` 에 테스트 파일
   3건(이미지 2 · 영상 1)이 남아 있다. 감사·롤백 근거라 지우지 않았다.
