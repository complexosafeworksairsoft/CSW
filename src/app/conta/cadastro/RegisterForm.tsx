"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "../actions";

const initialState: AuthState = { error: null };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="displayName"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Nome
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Usuário
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="3 a 32 caracteres, sem espaços"
          required
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Mínimo 6 caracteres"
          required
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
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
        {pending ? "Criando…" : "Criar conta"}
      </button>
    </form>
  );
}
