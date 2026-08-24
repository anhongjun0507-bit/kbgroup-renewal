# PLAN B — 콘텐츠 관리(CMS) 전환 진행 문서

> 이 파일 하나만 읽고 STEP 2를 시작할 수 있도록 작성한다.
> 최종 갱신: 2026-08-24 (STEP 2 / DAY 2 완료 — §11 참조)
> 대상 저장소: `kbgroup-renewal` / Next.js 16.2.6 + React 19.2.4 + Supabase + Vercel

---

## 0. 현재 상태 한 줄

STEP 2 / DAY 2 완료. 시드 완료 — `complexes` 172행 + `site_settings` 17키 적재, **코드포인트 단위 딥 비교 불일치 0건**. `content_revisions` SELECT admin 전용으로 축소. 다음: DAY 3(읽기 어댑터 + 파일 폴백 + `CONTENT_SOURCE` 킬스위치).

---

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

- [x] DAY 1 — 캐시 API 검증 → **분기 A 확정** · next.config remotePatterns · 회귀 베이스라인 28장 · 마이그레이션 6종+버킷 2종 작성·적용 완료 (§10)
- [x] DAY 2 — 마이그레이션 SQL 6종 + RLS (DAY 1 로 당겨 완료)
- [x] DAY 3(실제 DAY 2) — 시드 스크립트 + slug 코드포인트 검증 통과 · `content_revisions` SELECT admin 전용 · 브랜치 전략 판단(§11)
- [ ] DAY 4 — 읽기 어댑터 + 파일 폴백 + `CONTENT_SOURCE` 킬스위치
- [ ] DAY 5 — 관리자 UI: 단지 CRUD
- [ ] DAY 6 — 관리자 UI: 사이트 설정
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

## 11. DAY 2 실행 결과 (2026-08-24)

> 일정표(§4)의 DAY 번호와 실제 진행 DAY 가 하루 어긋나 있다. §4 의 "DAY 2(마이그레이션)"는
> DAY 1 에 끝냈으므로, **실제 DAY 2 = §4 의 DAY 3(시드 + 검증)** 이다. 이후 DAY 번호는 실제 진행일 기준으로 쓴다.

### 11-1. content_revisions SELECT → admin 전용 (결정 1)

`supabase/migrations/20260824000008_content_revisions_select_admin.sql` 작성·적용 완료.

적용 후 정책 실측 (`pg_policy`):

| 정책 | cmd | roles | using |
|------|-----|-------|-------|
| `content_revisions_select_admin` | SELECT | authenticated | `is_admin()` |
| `content_revisions_admin_insert` | INSERT | authenticated | (with check `is_admin()`) |
| `content_revisions_admin_delete` | DELETE | authenticated | `is_admin()` |

`content_revisions_select_public` 는 drop 됐다. anon 은 이제 감사 이력을 읽을 수 없다. UPDATE 정책 없음(append-only) 유지.

### 11-2. 브랜치 전략 판단 (결정 2) → **불필요. main 직접 진행이 맞다**

지시의 전제("main push = Vercel 프로덕션 배포")가 이 저장소에서는 **성립하지 않는다.** 실측:

| 확인 | 결과 | 근거 |
|------|------|------|
| Vercel 프로젝트 ↔ Git 연동 | **없음** | `GET /v9/projects/kbgroup-renewal` → `link: null`, `productionBranch: null`, `deployHooks: null` |
| 최근 배포 8건의 트리거 | **전부 `source: "cli"`** | `GET /v6/deployments` — 2026-07-22 ~ 07-29 전건 `cli` / `target: production` |

즉 GitHub 푸시로는 어떤 배포도 발생하지 않는다. 프로덕션 배포는 **`vercel --prod` 를 직접 실행할 때만** 일어난다.

**판단:** 별도 브랜치는 이득 없이 머지 비용만 늘린다. DAY 2~9 도 `main` 에 커밋·푸시하고,
프로덕션 배포는 DAY 10 검증 후 `vercel --prod` 를 **명시적으로 실행**하는 시점에만 한다.
(자동 배포 위험이 애초에 존재하지 않으므로 결정 2 의 안전 목표는 이미 충족돼 있다.)

### 11-3. 시드 스크립트 — `scripts/seed-content.ts`

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

### 11-4. 딥 비교 검증 결과 — **불일치 0건**

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

### 11-5. DAY 3(읽기 어댑터) 필수 검증 항목 — 결정 3 반영

**과거 단지 19건은 상세 페이지가 없다. 통합 테이블로 옮겼다고 상세 페이지가 새로 생기면 안 된다.**
(계약 범위 밖 + 기존 UX 변경). 어댑터 전환 시 아래를 반드시 확인한다.

- [ ] `app/cases/[slug]/page.tsx` 의 `generateStaticParams()` 가 **`is_active = true` 행만** 반환한다 (현행: `complexes` 배열만 순회).
- [ ] 같은 파일의 `notFound()` 분기가 **`is_active = false` 인 slug 에 대해 그대로 404** 를 낸다 (현행: `findIndex === -1`).
- [ ] `/cases` 목록(`CasesGallery`·`PastProjects`)에는 과거 단지가 **계속 노출**된다.
- [ ] `app/sitemap.ts` 에 과거 단지 URL 이 **추가되지 않는다**.

### 11-6. 미결·보고 사항

1. **DAY 2 지시서 뒷부분이 잘려서 도착했다.** `■ 2-1. 시드 스크립트 (scripts/seed-content.ts)` 의
   `- data/` 이후가 없다. 위 11-3/11-4 는 §6 단계 1·§9·§10-5 의 확정 내용으로 구성했다.
   잘린 부분에 추가 요구가 있었다면 알려주면 반영한다.
2. **시드 대상 DB 는 프로덕션 Supabase 프로젝트 하나뿐이다**(`yydvpwjvxyhyplzpxdds`). 다만 현재 라이브 사이트는
   여전히 `data/site-content.ts` 파일을 읽으므로, 시드 데이터가 라이브 화면에 영향을 주지 않는다.
   실제 전환은 DAY 3 읽기 어댑터 + `CONTENT_SOURCE` 킬스위치부터다.
