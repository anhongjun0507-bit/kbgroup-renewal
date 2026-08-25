"use client";

import { useCallback, useRef, useState } from "react";
import { FormShell, type Action } from "./SettingsForms";
import type { ListField, ListSchema } from "./settings-schema";

/**
 * 목록형 site_settings 키 공용 편집기 (PLAN B / DAY 5).
 *
 * 11개 키(연혁·인허가·자격증·협력업체·계열사·파트너·핵심가치·차별점·강점·사업영역·프로세스)가
 * "같은 모양의 항목이 N개 반복"이라는 구조를 공유한다. 키마다 폼을 따로 쓰면 같은 코드를 11번
 * 반복하게 되고, 그중 한 곳만 고치는 실수가 곧바로 데이터 유실이 된다.
 * 필드 정의는 `settings-schema.ts` 한 곳에 있고 Server Action 도 같은 스키마를 읽는다.
 *
 * 값 보존 규칙 — 항목은 **rowId 를 React key 로 삼는 비제어 입력**이다.
 * 순서를 바꾸거나 중간 항목을 지워도 DOM 노드가 통째로 이동·제거되므로 나머지 입력값이 그대로 남는다.
 * (index 를 key 로 쓰면 위·아래 이동이 값 뒤섞임으로 나타난다.)
 */

type Item = Record<string, unknown>;
type Row = { rowId: number; data: Item };

/* ── 값 → 입력창 초기값 ──────────────────────────────────────────────── */

function initialValue(field: ListField, data: Item): string {
  const v = data[field.name];
  if (field.kind === "lines") {
    return Array.isArray(v) ? (v as string[]).join("\n") : "";
  }
  if (field.kind === "pairs") {
    const [a, b] = field.pairKeys ?? ["title", "description"];
    if (!Array.isArray(v)) return "";
    return (v as Record<string, string>[])
      .map((p) => `${p?.[a] ?? ""}|${p?.[b] ?? ""}`)
      .join("\n");
  }
  if (v === undefined || v === null) return "";
  return String(v);
}

/* ── 필드 1개 ──────────────────────────────────────────────────────────── */

const INPUT =
  "block w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong placeholder:text-ink-placeholder focus:border-navy-700 focus:outline-none";

function Field({
  field,
  index,
  data,
}: {
  field: ListField;
  index: number;
  data: Item;
}) {
  const name = `${field.name}_${index}`;
  const id = `le-${name}`;
  const value = initialValue(field, data);

  if (field.kind === "readonly") {
    return (
      <div className={field.wide ? "sm:col-span-2" : undefined}>
        <span className="eyebrow mb-2 block">{field.label}</span>
        <p className="rounded-sm border border-line bg-bg-soft px-4 py-3 font-mono-num text-[14px] text-ink-muted">
          {value || "—"}
        </p>
        <input type="hidden" name={name} value={value} />
        {field.hint && <p className="mt-2 text-[12px] text-ink-faint">{field.hint}</p>}
      </div>
    );
  }

  if (field.kind === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-3 text-[13px] text-ink-muted sm:col-span-2">
        <input
          type="checkbox"
          name={name}
          defaultChecked={Boolean(data[field.name])}
          className="h-5 w-5 shrink-0 accent-[var(--color-accent-500)]"
        />
        {field.label}
      </label>
    );
  }

  const label = (
    <label htmlFor={id} className="eyebrow mb-2 block">
      {field.label}
      {field.required && " *"}
    </label>
  );
  const hint = field.hint && <p className="mt-2 text-[12px] text-ink-faint">{field.hint}</p>;
  const wrap = field.wide ? "sm:col-span-2" : undefined;

  if (field.kind === "select") {
    return (
      <div className={wrap}>
        {label}
        <select id={id} name={name} defaultValue={value} className={INPUT}>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {hint}
      </div>
    );
  }

  if (field.kind === "textarea" || field.kind === "lines" || field.kind === "pairs") {
    return (
      <div className={wrap}>
        {label}
        <textarea
          id={id}
          name={name}
          rows={field.rows ?? 3}
          defaultValue={value}
          className={`${INPUT} resize-y leading-[1.7]`}
        />
        {hint}
      </div>
    );
  }

  if (field.kind === "image") {
    return (
      <div className={wrap}>
        {label}
        <input id={id} name={name} type="text" defaultValue={value} className={INPUT} />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id={`${id}-file`}
            name={`${field.name}File_${index}`}
            type="file"
            accept="image/*"
            className="block w-full text-[13px] text-ink-muted file:mr-3 file:rounded-sm file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white"
          />
          {value && (
            /* next/image 는 도메인 등록이 필요하고 관리자 미리보기는 최적화 이득이 없다. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-14 w-auto shrink-0 rounded-sm border border-line bg-white object-contain p-1"
            />
          )}
        </div>
        <p className="mt-2 text-[12px] text-ink-faint">
          파일을 고르면 업로드 후 위 경로가 자동으로 교체됩니다. 비워두면 기존 이미지를 유지합니다.
        </p>
        {hint}
      </div>
    );
  }

  return (
    <div className={wrap}>
      {label}
      <input
        id={id}
        name={name}
        type={field.kind === "number" ? "number" : "text"}
        defaultValue={value}
        className={INPUT}
      />
      {hint}
    </div>
  );
}

/* ── 편집기 ────────────────────────────────────────────────────────────── */

export function ListEditor({
  schema,
  action,
  value,
  updatedAt,
}: {
  schema: ListSchema;
  action: Action;
  value: Item[];
  updatedAt: string;
}) {
  const nextId = useRef(value.length);
  const [rows, setRows] = useState<Row[]>(() =>
    value.map((data, i) => ({ rowId: i, data })),
  );

  const add = useCallback(() => {
    setRows((prev) => [...prev, { rowId: nextId.current++, data: {} }]);
  }, []);

  const remove = useCallback((rowId: number) => {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  }, []);

  /** 위·아래 한 칸 이동. 자유 DnD 는 계약 범위 밖이다 (PROGRESS §1). */
  const move = useCallback((rowId: number, dir: -1 | 1) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.rowId === rowId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  return (
    <FormShell
      id={`setting-${schema.key}`}
      title={schema.title}
      desc={schema.desc}
      action={action}
      updatedAt={updatedAt}
      note={
        <p className="mt-2 text-[12px] text-ink-faint">
          노출 위치: {schema.where} · 현재 {rows.length}개 항목
        </p>
      }
    >
      <input type="hidden" name="settingKey" value={schema.key} />
      <input type="hidden" name="count" value={rows.length} />

      <div className="space-y-4">
        {rows.map((row, i) => (
          <fieldset key={row.rowId} data-list-row={schema.key} className="rounded-md border border-line bg-bg-soft p-4">
            <legend className="eyebrow px-2">
              {i + 1}. {String(row.data[schema.labelField] ?? "새 항목")}
            </legend>

            {schema.mutable && (
              <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => move(row.rowId, -1)}
                  disabled={i === 0}
                  aria-label={`${i + 1}번 항목 위로`}
                  className="btn-reset inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-white text-[15px] text-ink-strong hover:border-navy-700 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(row.rowId, 1)}
                  disabled={i === rows.length - 1}
                  aria-label={`${i + 1}번 항목 아래로`}
                  className="btn-reset inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-white text-[15px] text-ink-strong hover:border-navy-700 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.rowId)}
                  className="btn-reset inline-flex h-9 items-center rounded-sm border border-red-300 bg-white px-3 text-[13px] font-semibold text-red-700 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {schema.fields.map((f) => (
                <Field key={f.name} field={f} index={i} data={row.data} />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {schema.mutable ? (
        <button
          type="button"
          onClick={add}
          className="btn-reset inline-flex h-11 items-center gap-2 rounded-sm border border-navy-700 px-5 text-[14px] font-semibold text-navy-900 hover:bg-navy-900 hover:text-white"
        >
          + {schema.addLabel ?? "항목 추가"}
        </button>
      ) : (
        <p className="text-[12px] text-ink-faint">
          이 목록은 항목 추가·삭제·순서 변경을 지원하지 않습니다. 값만 수정할 수 있습니다.
        </p>
      )}
    </FormShell>
  );
}
