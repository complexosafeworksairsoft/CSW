"use client";

import { useActionState } from "react";
import { loginAdminAction, type LoginState } from "../../admin-actions";

const initialState: LoginState = { error: null };

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="code"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Código de acesso
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          required
          placeholder="Código de acesso"
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-accent px-5 py-3 rounded-sm font-mono-safe text-sm uppercase tracking-widest text-[#231400] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "Verificando…" : "Entrar"}
      </button>

      <p className="text-xs text-muted">
        Acesso restrito à administração do Complexo Safe Works.
      </p>
    </form>
  );
}
