"use client";

import { useActionState, useState } from "react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import PhotoUploadField from "@/components/PhotoUploadField";
import {
  removeOperatorAction,
  togglePublicAction,
  updateOperatorAction,
  type ActionState,
} from "../../roster-actions";
import type { Operator } from "@/lib/roster-data";

const initialState: ActionState = { error: null, resetToken: 0 };

/**
 * Owns the operator card's action row (público/privado, editar, excluir)
 * and the expandable edit form together, so the row stays a compact flex
 * line while the edit form renders as its own block below it — a single
 * client component can lay both out correctly; splitting the toggle button
 * from the form it opens can't.
 */
export default function OperatorActions({ operator }: { operator: Operator }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateOperatorAction, initialState);

  // Collapse the edit form once a save actually succeeds (resetToken only
  // bumps on success). Adjusted during render, not in an effect — React's
  // documented pattern for "reset state when a value changes".
  const [seenResetToken, setSeenResetToken] = useState(state.resetToken);
  if (state.resetToken !== seenResetToken) {
    setSeenResetToken(state.resetToken);
    setEditing(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <form action={togglePublicAction}>
          <input type="hidden" name="operatorId" value={operator.id} />
          <input type="hidden" name="nextIsPublic" value={operator.isPublic ? "false" : "true"} />
          <button
            type="submit"
            className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest transition-colors ${
              operator.isPublic
                ? "border-accent text-accent hover:opacity-80"
                : "border-line-strong text-muted hover:border-accent hover:text-accent"
            }`}
            title={
              operator.isPublic
                ? "Visível na página pública de Operadores — clique para tornar privado"
                : "Não aparece no site — clique para tornar público"
            }
          >
            <span className={`h-1.5 w-1.5 rounded-full ${operator.isPublic ? "bg-accent" : "bg-muted"}`} />
            {operator.isPublic ? "Público" : "Privado"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {editing ? "Cancelar edição" : "Editar"}
        </button>

        <form action={removeOperatorAction}>
          <input type="hidden" name="operatorId" value={operator.id} />
          <ConfirmDeleteButton
            label="Excluir operador"
            confirmMessage="Tem certeza que deseja excluir este operador? Essa ação não pode ser desfeita."
          />
        </form>
      </div>

      {editing && (
        <form
          action={formAction}
          className="mt-3 border border-dashed border-line-strong bg-surface-2 p-5"
        >
          <input type="hidden" name="operatorId" value={operator.id} />

          <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
            <PhotoUploadField
              name="photo"
              label="Foto do operador"
              existingPhoto={operator.photo}
              ratio="square"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`edit-name-${operator.id}`}
                  className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
                >
                  Nome
                </label>
                <input
                  id={`edit-name-${operator.id}`}
                  name="name"
                  type="text"
                  required
                  defaultValue={operator.name}
                  className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-tag-${operator.id}`}
                  className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
                >
                  TAG
                </label>
                <input
                  id={`edit-tag-${operator.id}`}
                  name="tag"
                  type="text"
                  required
                  defaultValue={operator.tag}
                  className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 font-mono-safe text-sm uppercase text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-start-${operator.id}`}
                  className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
                >
                  Início
                </label>
                <input
                  id={`edit-start-${operator.id}`}
                  name="startMonth"
                  type="month"
                  defaultValue={operator.startMonth}
                  className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-category-${operator.id}`}
                  className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
                >
                  Categoria
                </label>
                <input
                  id={`edit-category-${operator.id}`}
                  name="category"
                  type="text"
                  defaultValue={operator.category}
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

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="border border-line-strong px-4 py-2 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-mono-safe text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
