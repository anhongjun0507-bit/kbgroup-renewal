/**
 * 일회성 데이터 이관 — 기존 정적 공지(app/notices/data.ts) 5건을
 * posts 테이블(board_type='notice')로 옮긴다.
 *
 * 실행: node --env-file=.env.local scripts/migrate-notices.mjs
 * 안전장치: 이미 notice 글이 존재하면 중단(중복 방지).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("환경변수 미설정: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 오래된 순서대로 (post_number 1..5가 시간순이 되도록)
const NOTICES = [
  {
    date: "2025-10-30",
    title: "리뉴얼 홈페이지 오픈 안내",
    body: [
      "(주)케이비개발이 2025년 10월 공식 홈페이지를 전면 리뉴얼했습니다. 새 도메인은 kbgroup.kr 입니다.",
      "리뉴얼 핵심 변경 — 회사 소개·사업영역·관리 단지·인허가·채용·공지 6개 정보 영역 재구성, 실시간 단지 운영 현황 시각화, 모바일 사용성 강화, 사업 상담 폼 전면 개편.",
      "기존 사이트(kb-dvp.com)의 핵심 정보는 모두 이전되었으며, 추후 페이지는 영업일 기준 14일 이내 신 사이트로 자동 리다이렉트됩니다. 콘텐츠 누락이 발견되시면 운영팀(info@kbgroup.kr)으로 알려주시면 즉시 반영하겠습니다.",
    ],
  },
  {
    date: "2025-11-04",
    title: "현장 관리소장·시설 기술인력 상시 채용",
    body: [
      "(주)케이비개발이 신규 수주 단지 운영 인력을 보강하기 위해 관리소장·시설반장·경비반장 직무를 상시 채용합니다.",
      "모집 직무 — 주택관리사보 이상 자격 보유 관리소장(광주·수도권·호남권), 전기·기계·소방 분야 시설반장, 시설경비 자격 보유 경비반장.",
      "지원 방법 — 채용 페이지 인재 풀 등록 또는 인사담당(062-416-3021) 회선으로 이력서 발송. 서류 통과 후 본사 면접, 단지 매칭, 4대보험·근로계약 체결 순으로 진행합니다.",
      "상시 채용으로 진행되며 모집 마감일은 별도 공지되지 않습니다.",
      "▸ 채용 페이지 바로가기: /careers",
    ],
  },
  {
    date: "2025-12-12",
    title: "안전보건경영시스템 ISO 45001 재인증",
    body: [
      "(주)케이비개발이 2025년 12월 한국표준협회(KSA)로부터 안전보건경영시스템 ISO 45001:2018 인증을 재취득했습니다.",
      "ISO 45001은 사업장의 안전보건 위험 식별·평가·관리 체계를 국제 표준에 맞춰 운영하고 있음을 입증하는 글로벌 인증입니다. 케이비개발은 2023년 최초 인증 이후 본사·전남지사·서울 경인지사 전 영업장을 인증 범위에 포함해 운영해 왔습니다.",
      "이번 재인증으로 케이비개발은 ISO 45001 운영 3년차에 진입하며, 전국 155+개 단지의 안전관리 표준 일관성을 외부 인증으로 검증받았습니다.",
    ],
  },
  {
    date: "2026-01-22",
    title: "광주 양림1휴먼시아 관리 개시",
    body: [
      "(주)케이비개발이 2026년 1월부터 광주광역시 남구 양림동 휴먼시아 1차 아파트(987세대)의 위탁관리·경비·청소 통합 운영을 개시합니다.",
      "본 단지는 LH 발주 임대 단지로, 입주자대표회의·관리주체와의 협의를 거쳐 다음 운영 표준을 적용합니다 — 관리소장 1인 상주, 시설반장 1인, 경비반장 1인 포함 총 18명의 자격 인력 배치, 24시간 통합 관제 운영, 월 2회 정밀 청소·방역 사이클.",
      "단지 입주민 대상 운영 설명회는 2026년 2월 첫째 주 단지 내 커뮤니티 센터에서 진행할 예정입니다.",
    ],
  },
  {
    date: "2026-02-15",
    title: "전남지사 이전 안내 (2026.02)",
    body: [
      "(주)케이비개발은 2026년 2월 호남권 운영 거점을 강화하기 위해 기존 목포지사를 확장 이전하여 전남지사로 새롭게 출범합니다.",
      "전남지사는 인력·장비 보유 규모를 1.8배 확장하여 광주·전남·전북 권역의 단지 운영을 더 빠르게 응대할 수 있도록 준비했습니다. 긴급 출동 응답 목표는 기존 30분에서 20분으로 단축됩니다.",
      "기존 목포지사 단지 운영은 별도 통보 없이 이전 그대로 유지되며, 신규 상담은 본사(062-416-3021) 또는 전남지사 직통 회선으로 접수하실 수 있습니다.",
    ],
  },
];

const { count, error: countErr } = await supabase
  .from("posts")
  .select("id", { count: "exact", head: true })
  .eq("board_type", "notice");

if (countErr) {
  console.error("기존 글 조회 실패:", countErr.message);
  process.exit(1);
}
if ((count ?? 0) > 0) {
  console.log(`이미 notice 글 ${count}건 존재 — 이관 중단(중복 방지).`);
  process.exit(0);
}

let n = 0;
for (const notice of NOTICES) {
  const { error } = await supabase.from("posts").insert({
    board_type: "notice",
    title: notice.title,
    content: notice.body.join("\n\n"),
    author_id: null,
    author_name: "관리자",
    is_pinned: false,
    created_at: `${notice.date}T09:00:00+09:00`,
    updated_at: `${notice.date}T09:00:00+09:00`,
  });
  if (error) {
    console.error(`실패 — ${notice.title}:`, error.message);
    process.exit(1);
  }
  n += 1;
  console.log(`이관 ${n}/${NOTICES.length}: ${notice.title} (${notice.date})`);
}
console.log(`완료 — 공지사항 ${n}건 이관.`);
