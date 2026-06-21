/**
 * 소식(NEWS) 게시판 설정 — 단일 출처.
 *
 * posts.board_type 4종(notice·gallery·news·resources)을 관리자 CRUD 대상으로 정의한다.
 * (free=자유게시판은 회원 게시판으로 별도 흐름: /notices/board)
 *
 * 서버·클라이언트 양쪽에서 import하므로 순수 데이터/함수만 둔다 (Supabase import 금지).
 */

export type BoardType = "notice" | "gallery" | "news" | "resources";

export type BoardLayout = "list" | "gallery" | "resources";

export type AttachmentPolicy = {
  /** Storage 버킷 (마이그레이션 006에서 생성됨) */
  bucket: "gallery" | "resources";
  /** 게시글당 최대 첨부 수 (DB 트리거 check_attachment_count와 일치해야 함) */
  max: number;
  /** <input accept> 속성 */
  accept: string;
  /** 업로드 MIME 화이트리스트 (버킷 설정과 일치) */
  mimes: string[];
  /** 단일 파일 최대 바이트 (버킷 file_size_limit와 일치) */
  maxBytes: number;
  /** 첨부 종류 라벨 ("이미지" / "문서") */
  noun: string;
  /** 글 작성 시 첨부 필수 여부 */
  requiredOnCreate: boolean;
};

export type BoardConfig = {
  type: BoardType;
  /** 한글 라벨 (공지사항·갤러리·단지소식·자료실) */
  label: string;
  /** PageHero kicker (대문자 영문) */
  kicker: string;
  /** PageHero italicWord (제목 강조 단어) */
  italicWord: string;
  /** PageHero subtitle */
  subtitle: string;
  /** 공개 목록 경로 */
  listPath: string;
  /** breadcrumb 마지막 라벨 (영문) */
  crumb: string;
  /** 목록 표현 방식 */
  layout: BoardLayout;
  /** 본문(content) 필수 여부 */
  contentRequired: boolean;
  /** content 입력 라벨 */
  contentLabel: string;
  /** 첨부 정책 (null이면 첨부 없음) */
  attach: AttachmentPolicy | null;
};

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_PDF_MIMES = [...IMAGE_MIMES, "application/pdf"];
const DOC_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/msword",
  "application/x-hwp",
  "application/haansofthwp",
  "application/vnd.hancom.hwp",
];

const MB = 1024 * 1024;

export const BOARD_CONFIGS: Record<BoardType, BoardConfig> = {
  notice: {
    type: "notice",
    label: "공지사항",
    kicker: "NOTICES",
    italicWord: "공지",
    subtitle: "(주)케이비개발의 공지·안내를 전달드립니다.",
    listPath: "/notices",
    crumb: "NOTICES",
    layout: "list",
    contentRequired: true,
    contentLabel: "내용",
    attach: {
      bucket: "gallery",
      max: 3,
      accept: "image/*,application/pdf",
      mimes: IMAGE_PDF_MIMES,
      maxBytes: 5 * MB,
      noun: "이미지·PDF",
      requiredOnCreate: false,
    },
  },
  gallery: {
    type: "gallery",
    label: "갤러리",
    kicker: "GALLERY",
    italicWord: "갤러리",
    subtitle: "현장과 행사의 순간을 사진으로 전달드립니다.",
    listPath: "/notices/gallery",
    crumb: "GALLERY",
    layout: "gallery",
    contentRequired: false,
    contentLabel: "설명 (선택)",
    attach: {
      bucket: "gallery",
      max: 10,
      accept: "image/*",
      mimes: IMAGE_MIMES,
      maxBytes: 5 * MB,
      noun: "이미지",
      requiredOnCreate: true,
    },
  },
  news: {
    type: "news",
    label: "단지소식",
    kicker: "DISTRICT NEWS",
    italicWord: "단지",
    subtitle: "관리 단지의 운영 소식과 입주민 안내를 전달드립니다.",
    listPath: "/notices/news",
    crumb: "NEWS",
    layout: "list",
    contentRequired: true,
    contentLabel: "내용",
    attach: {
      bucket: "gallery",
      max: 3,
      accept: "image/*,application/pdf",
      mimes: IMAGE_PDF_MIMES,
      maxBytes: 5 * MB,
      noun: "이미지·PDF",
      requiredOnCreate: false,
    },
  },
  resources: {
    type: "resources",
    label: "자료실",
    kicker: "RESOURCES",
    italicWord: "자료실",
    subtitle: "회사소개서·홍보물 등 자료를 제공해드립니다.",
    listPath: "/notices/resources",
    crumb: "RESOURCES",
    layout: "resources",
    contentRequired: false,
    contentLabel: "설명 (선택)",
    attach: {
      bucket: "resources",
      max: 1,
      accept:
        ".pdf,.xlsx,.xls,.docx,.doc,.hwp,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-excel",
      mimes: DOC_MIMES,
      maxBytes: 10 * MB,
      noun: "문서",
      requiredOnCreate: true,
    },
  },
};

/** 관리 대상 게시판 순서 (허브·탭 노출 순) */
export const BOARD_ORDER: BoardType[] = [
  "notice",
  "gallery",
  "news",
  "resources",
];

export function isBoardType(v: unknown): v is BoardType {
  return (
    v === "notice" || v === "gallery" || v === "news" || v === "resources"
  );
}

export function getBoardConfig(type: BoardType): BoardConfig {
  return BOARD_CONFIGS[type];
}

/** 공개 상세 경로. notice는 /notices/[id], 나머지는 listPath/[id]. */
export function postDetailPath(type: BoardType, id: string): string {
  return `${BOARD_CONFIGS[type].listPath}/${id}`;
}

/** 관리자 경로 헬퍼 */
export const adminBoardPath = (type: BoardType) => `/admin/posts/${type}`;
export const adminNewPath = (type: BoardType) => `/admin/posts/${type}/new`;
export const adminEditPath = (type: BoardType, id: string) =>
  `/admin/posts/${type}/${id}/edit`;

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

/** 확장자 → MIME (브라우저가 .hwp 등에서 빈 type을 주는 경우 대비) */
const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  hwp: "application/x-hwp",
};

export function extOf(name: string): string | null {
  return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? null;
}

/** 파일의 MIME을 확장자 우선으로 확정 (버킷 화이트리스트와 일치시키기 위함) */
export function resolveMime(file: { name: string; type: string }): string {
  const ext = extOf(file.name);
  if (ext && EXT_MIME[ext]) return EXT_MIME[ext];
  return file.type || "application/octet-stream";
}

/** 파일 크기 사람이 읽는 형식 (KB/MB) */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

/** 문서 확장자 추출 (자료실 아이콘/라벨용) */
export function fileExtLabel(fileName: string): string {
  const m = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1].toUpperCase() : "FILE";
}
