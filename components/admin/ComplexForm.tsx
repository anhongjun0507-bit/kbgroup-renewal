"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ComplexFormState } from "@/app/admin/content/complexes/actions";

/**
 * 단지 등록·수정 폼 (PLAN B / DAY 3-1).
 *
 * slug 는 읽기 전용 표시만 한다. 편집 UI 를 제공하지 않는다 (E-1) —
 * DB 트리거(complexes_slug_immutable)가 물리적으로도 변경을 막는다.
 * updated_at 은 hidden 으로 함께 보내 낙관적 잠금 비교에 쓴다 (E-8).
 */

const INITIAL: ComplexFormState = { error: null, fieldErrors: {} };

export type ComplexInitial = {
  id: string;
  slug: string;
  name: string;
  region: string;
  client: string | null;
  households: number | null;
  area: number | null;
  type: string | null;
  period: string | null;
  aliases: string[];
  image: string | null;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
};

export function ComplexForm({
  action,
  initial,
  submitLabel = "등록",
}: {
  action: (prev: ComplexFormState, fd: FormData) => Promise<ComplexFormState>;
  initial?: ComplexInitial;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-7">
      {initial && (
        <>
          <input type="hidden" name="id" value={initial.id} />
          <input type="hidden" name="updatedAt" value={initial.updatedAt} />
        </>
      )}

      {state.conflict && (
        <div
          role="alert"
          className="rounded-sm border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-[14px] text-amber-900"
        >
          <p className="font-semibold">다른 관리자가 먼저 저장했습니다.</p>
          <p className="mt-1 text-[13px]">
            덮어쓰지 않고 중단했습니다. 이 페이지를 새로고침해 최신 값을 확인한 뒤 다시
            수정해주세요. (입력한 내용은 아직 저장되지 않았습니다)
          </p>
        </div>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border-l-2 border-red-600 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {state.error}
        </p>
      )}

      {/* slug — 읽기 전용. 기존 URL·검색 색인 보존을 위해 불변이다 (E-1). */}
      {initial && (
        <div className="rounded-md border border-line bg-bg-soft p-4">
          <p className="eyebrow mb-2">URL SLUG (읽기 전용)</p>
          <p className="break-all font-mono-num text-[13px] text-ink-muted">
            /cases/{initial.slug}
          </p>
          <p className="mt-2 text-[12px] text-ink-faint">
            단지명을 바꿔도 URL 은 바뀌지 않습니다. 기존 링크·검색 색인을 보존하기 위한
            의도된 동작입니다.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Text
          name="name"
          label="단지명 *"
          defaultValue={initial?.name}
          placeholder="예) 계림아이파크 SK뷰"
          error={state.fieldErrors?.name}
        />
        <Text
          name="region"
          label="지역"
          defaultValue={initial?.region}
          placeholder="예) 전남광주광역시 동구"
          error={state.fieldErrors?.region}
        />
        <Text
          name="client"
          label="발주처"
          defaultValue={initial?.client ?? ""}
          placeholder="예) LH 광주전남지역본부"
        />
        <Select
          name="type"
          label="구분 (LH 구분)"
          defaultValue={initial?.type ?? ""}
          options={[
            { value: "", label: "미지정 (= 민간)" },
            { value: "LH", label: "LH" },
            { value: "민간", label: "민간" },
            { value: "공공", label: "공공" },
          ]}
        />
        <Text
          name="households"
          label="세대수"
          type="number"
          defaultValue={initial?.households != null ? String(initial.households) : ""}
          placeholder="비우면 미표시"
          error={state.fieldErrors?.households}
        />
        <Text
          name="area"
          label="관리면적 (㎡)"
          type="number"
          step="0.0001"
          defaultValue={initial?.area != null ? String(initial.area) : ""}
          placeholder="비우면 미표시"
          error={state.fieldErrors?.area}
        />
        <Text
          name="period"
          label="계약 기간 (과거 단지용)"
          defaultValue={initial?.period ?? ""}
          placeholder="예) 2019.3.1 ~ 2025.10.31"
        />
        <Text
          name="sortOrder"
          label="정렬 순서 (작을수록 위)"
          type="number"
          defaultValue={String(initial?.sortOrder ?? 0)}
        />
      </div>

      <Area
        name="aliases"
        label="별칭 (한 줄에 하나씩 · 검색·필터 보조)"
        defaultValue={(initial?.aliases ?? []).join("\n")}
        rows={3}
        placeholder={"계림 아이파크\n계림 SK뷰"}
      />

      {/* 이미지 — 업로드하면 Storage 공개 URL 로 대표 사진을 교체한다. */}
      <div className="space-y-4 rounded-md border border-line bg-bg-soft p-4">
        <p className="eyebrow">대표 사진</p>
        {initial?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initial.image}
            alt={`${initial.name} 현재 대표 사진`}
            className="h-32 w-full max-w-xs rounded-sm object-cover"
          />
        )}
        <Text
          name="image"
          label="대표 사진 경로 / URL (비우면 모노그램 표시)"
          defaultValue={initial?.image ?? ""}
          placeholder="/images/cases/featured/단지명.png"
        />
        <div>
          <label htmlFor="cf-imageFile" className="eyebrow mb-2 block">
            새 파일 업로드 (선택 · jpeg·png·webp·avif, 10MB 이하)
          </label>
          <input
            id="cf-imageFile"
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[14px] text-ink-muted file:mr-4 file:rounded-sm file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white"
          />
          <p className="mt-2 text-[12px] text-ink-faint">
            업로드하면 위 경로 입력값 대신 업로드된 파일이 대표 사진이 됩니다.
          </p>
        </div>
      </div>

      <Area
        name="images"
        label="추가 사진 경로 (한 줄에 하나씩 · 상세 페이지 캐러셀용)"
        defaultValue={(initial?.images ?? []).join("\n")}
        rows={3}
        placeholder="/images/cases/featured/단지명-2.png"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Toggle
          name="isActive"
          defaultChecked={initial ? initial.isActive : true}
          title="현재 운영 단지"
          desc="끄면 과거 단지로 분류됩니다. 과거 단지는 /cases 목록의 PAST PROJECTS 섹션에만 노출되고 상세 페이지는 404 입니다."
        />
        <Toggle
          name="isFeatured"
          defaultChecked={initial?.isFeatured ?? false}
          title="주요 단지 (카드 노출)"
          desc="켜면 /cases 상단 KEY PROJECTS 카드 영역에 노출됩니다. LH 단지는 자동 노출이라 별도 지정이 필요 없습니다."
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
        <Link
          href="/admin/content/complexes"
          className="inline-flex min-h-12 items-center rounded-sm border border-line px-6 text-[14px] font-semibold text-ink-muted transition-colors hover:border-ink-strong hover:text-ink-strong"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-accent-500 px-8 text-[15px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)] disabled:opacity-50"
        >
          {isPending ? "저장 중..." : submitLabel}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

function Text({
  name,
  label,
  type = "text",
  step,
  defaultValue,
  placeholder,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={`cf-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={`cf-${name}`}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
      {error && <p className="mt-2 text-[12px] text-red-700">{error}</p>}
    </div>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={`cf-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <select
        id={`cf-${name}`}
        name={name}
        defaultValue={defaultValue}
        className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong focus:border-navy-700 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={`cf-${name}`} className="eyebrow mb-2 block">
        {label}
      </label>
      <textarea
        id={`cf-${name}`}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[15px] leading-[1.7] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none"
      />
    </div>
  );
}

function Toggle({
  name,
  defaultChecked,
  title,
  desc,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  desc: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-bg-soft p-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent-500)]"
      />
      <span>
        <span className="block text-[14px] font-semibold text-ink-strong">{title}</span>
        <span className="mt-0.5 block text-[13px] text-ink-muted">{desc}</span>
      </span>
    </label>
  );
}
