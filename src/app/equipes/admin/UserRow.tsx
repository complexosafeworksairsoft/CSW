"use client";

import { useActionState, useState } from "react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import {
  changeUserPasswordAction,
  removeUserAction,
  type ChangePasswordState,
} from "./user-actions";

const initialState: ChangePasswordState = { error: null, resetToken: 0 };

export type UserRowData = {
  id: string;
  username: string;
  displayName: string;
  teamLabel: string;
};

/**
 * One account row: identity + team affiliation, a delete button, and an
 * expandable "Alterar senha" form — same owns-the-toggle-and-the-form shape
 * as OperatorActions.tsx (Ficha da Equipe), for the same reason: the toggle
 * button sits in a flex row while the form it opens renders as its own
 * block below, so one client component has to own both.
 */
export default function UserRow({ user }: { user: UserRowData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(changeUserPasswordAction, initialState);

  // Collapse the form once a save actually succeeds (resetToken only bumps
  // on success) — adjusted during render, not in an effect, same convention
  // as OperatorActions.tsx.
  const [seenResetToken, setSeenResetToken] = useState(state.resetToken);
  if (state.resetToken !== seenResetToken) {
    setSeenResetToken(state.resetToken);
    setEditing(false);
  }

  return (
    <li className="border border-line bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{user.displayName}</p>
          <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
            @{user.username}
          </p>
          <p className="mt-0.5 text-xs text-muted">{user.teamLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {editing ? "Cancelar" : "Alterar senha"}
          </button>

          <form action={removeUserAction}>
            <input type="hidden" name="userId" value={user.id} />
            <ConfirmDeleteButton
              label="Excluir conta"
              confirmMessage={`Excluir a conta de "${user.displayName}" (@${user.username})? A pessoa não conseguirá mais entrar em /conta. O operador já cadastrado na equipe (se houver) NÃO é apagado, só fica desvinculado da conta.`}
              size="sm"
            />
          </form>
        </div>
      </div>

      {editing && (
        <form
          action={formAction}
          className="mt-3 flex flex-wrap items-end gap-3 border border-dashed border-line-strong bg-surface-2 p-4"
        >
          <input type="hidden" name="userId" value={user.id} />
          <div className="flex-1 min-w-[180px]">
            <label
              htmlFor={`new-password-${user.id}`}
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Nova senha
            </label>
            <input
              id={`new-password-${user.id}`}
              name="newPassword"
              type="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Mínimo 6 caracteres"
              required
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-2.5 font-mono-safe text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="border border-line-strong px-4 py-2.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar nova senha"}
          </button>

          {state.error && (
            <p role="alert" className="w-full border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
              {state.error}
            </p>
          )}
        </form>
      )}
    </li>
  );
}
