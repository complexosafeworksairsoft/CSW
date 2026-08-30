"use client";

import { useState } from "react";

const DESCRIPTION_MAX = 200;

/**
 * Owns its own local state so the parent can reset it for free: this whole
 * component gets remounted (fresh useState) whenever the parent's `key`
 * changes, with no effect required to clear it after a successful submit.
 * Shared between the team's AddEquipmentForm and the operator's own
 * self-service equipment form (src/app/conta/(protected)/AddEquipmentForm.tsx).
 */
export function DescriptionField({ id }: { id: string }) {
  const [value, setValue] = useState("");

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft"
        >
          Descrição
        </label>
        <span className="font-mono-safe text-[11px] text-muted">
          {value.length}/{DESCRIPTION_MAX}
        </span>
      </div>
      <textarea
        id={id}
        name="description"
        rows={2}
        maxLength={DESCRIPTION_MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      />
    </div>
  );
}

export function SelectField({
  id,
  name,
  label,
  options,
}: {
  id: string;
  name: string;
  label: string;
  options: readonly string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      >
        <option value="">Não informado</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxGroup({
  legend,
  name,
  options,
  idPrefix,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  idPrefix: string;
}) {
  return (
    <fieldset>
      <legend className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
        {legend}
      </legend>
      <div className="mt-1 grid gap-1 sm:grid-cols-2">
        {options.map((option) => {
          const id = `${idPrefix}-${option}`;
          return (
            <label key={option} htmlFor={id} className="flex items-center gap-2 text-xs text-ink-soft">
              <input
                id={id}
                type="checkbox"
                name={name}
                value={option}
                className="h-3.5 w-3.5 shrink-0 rounded-sm border border-line-strong bg-surface accent-accent"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
