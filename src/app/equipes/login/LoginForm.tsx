"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="teamCode"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Código da equipe
        </label>
        <input
          id="teamCode"
          name="teamCode"
          type="text"
          autoComplete="username"
          autoCapitalize="characters"
          placeholder="EX: LOBOS-01"
          required
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 font-mono-safe text-sm uppercase tracking-widest text-ink placeholder:text-muted focus:border-accent focus:outline-none"
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
          autoComplete="current-password"
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
        {pending ? "Verificando…" : "Entrar"}
      </button>

      <p className="text-xs text-muted">
        Acesso restrito a equipes cadastradas no Complexo. Para registrar sua
        equipe, fale com a administração do Safe Works.
      </p>
    </form>
  );
}
