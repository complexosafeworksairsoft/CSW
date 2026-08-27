"use client";

import { useActionState } from "react";
import PhotoUploadField from "@/components/PhotoUploadField";
import { addOperatorAction, type ActionState } from "../../roster-actions";

const initialState: ActionState = { error: null, resetToken: 0 };

export default function AddOperatorForm() {
  const [state, formAction, pending] = useActionState(addOperatorAction, initialState);

  return (
    <form action={formAction} className="border border-dashed border-line-strong bg-surface p-6 sm:p-8">
      <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
        Adicionar operador
      </p>

      {/* Keyed by resetToken so fields (incl. the file input/preview) clear after a successful add, but stay filled in if the submission was rejected. */}
      <div key={state.resetToken} className="mt-4 grid gap-5 sm:grid-cols-[160px_1fr]">
        <PhotoUploadField name="photo" label="Foto do operador" ratio="square" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="op-name" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              Nome
            </label>
            <input
              id="op-name"
              name="name"
              type="text"
              required
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="op-tag" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              TAG
            </label>
            <input
              id="op-tag"
              name="tag"
              type="text"
              required
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 font-mono-safe text-sm uppercase text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="op-start" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              Início
            </label>
            <input
              id="op-start"
              name="startMonth"
              type="month"
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="op-category" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              Categoria
            </label>
            <input
              id="op-category"
              name="category"
              type="text"
              placeholder="Ex: Atirador, Suporte, Líder de esquadrão"
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 border border-line-strong px-5 py-3 rounded-sm font-mono-safe text-sm uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar operador"}
      </button>
    </form>
  );
}
