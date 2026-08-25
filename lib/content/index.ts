/**
 * 콘텐츠 읽기 어댑터 공개 API.
 *
 * 소비처는 `data/site-content.ts` 를 직접 import 하지 않고 여기를 통해 읽는다.
 * 3모드: DB(기본) · DB 실패 시 파일 폴백 · CONTENT_SOURCE=file 킬스위치.
 */
export {
  getAllComplexes,
  getComplexes,
  getPastComplexes,
  getComplexBySlug,
  toSlug,
} from "./complexes";
export { getSetting, getSettings, getYearsOfOperation } from "./settings";
export { CONTENT_TAGS, type ContentTag } from "./tags";
export type { ContentComplex, ContentOrigin } from "./types";
export type {
  BusinessArea,
  BusinessCategory,
  Certification,
  Complex,
  Contact,
  Counter,
  HistoryEntry,
  License,
  OrgNode,
  Partner,
} from "./types";
export type { SettingKey, SettingValue } from "./settings";
