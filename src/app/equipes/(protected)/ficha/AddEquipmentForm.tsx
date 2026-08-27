"use client";

import { useActionState, useState } from "react";
import PhotoUploadField from "@/components/PhotoUploadField";
import { addEquipmentAction, type ActionState } from "../../roster-actions";

const initialState: ActionState = { error: null, resetToken: 0 };
const DESCRIPTION_MAX = 200;

/**
 * Owns its own local state so the parent can reset it for free: this whole
 * component gets remounted (fresh useState) whenever the parent's `key`
 * changes, with no effect required to clear it after a successful submit.
 */
function DescriptionField({ id }: { id: string }) {
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

export default function AddEquipmentForm({ operatorId }: { operatorId: string }) {
  const [state, formAction, pending] = useActionState(addEquipmentAction, initialState);

  return (
    <form action={formAction} className="border border-dashed border-line-strong bg-surface-2 p-4">
      <input type="hidden" name="operatorId" value={operatorId} />

      <p className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
        Adicionar equipamento
      </p>

      {/* Keyed by resetToken so fields (incl. the file input/preview and the description counter) clear after a successful add, but stay filled in if the submission was rejected. */}
      <div key={state.resetToken} className="mt-3 grid gap-3 sm:grid-cols-[100px_1fr]">
        <PhotoUploadField name="photo" label="Foto do item" ratio="square" />

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`eq-name-${operatorId}`}
                className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft"
              >
                Nome
              </label>
              <input
                id={`eq-name-${operatorId}`}
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor={`eq-brand-${operatorId}`}
                className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft"
              >
                Marca
              </label>
              <input
                id={`eq-brand-${operatorId}`}
                name="brand"
                type="text"
                className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <DescriptionField id={`eq-desc-${operatorId}`} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-3 border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 border border-line-strong px-4 py-2 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar equipamento"}
      </button>
    </form>
  );
}
