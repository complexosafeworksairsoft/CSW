"use client";

import { useActionState } from "react";
import { createTeamAction, type CreateTeamState } from "./team-actions";

const initialState: CreateTeamState = { error: null, resetToken: 0, created: null };

export default function CreateTeamForm() {
  const [state, formAction, pending] = useActionState(createTeamAction, initialState);

  return (
    <form
      action={formAction}
      className="border border-dashed border-line-strong bg-surface p-6 sm:p-8"
    >
      <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
        Criar acesso de equipe
      </p>

      {/* Keyed by resetToken so fields clear after a successful create, but stay filled in if the submission was rejected. */}
      <div key={state.resetToken} className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="team-name"
            className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
          >
            Nome da equipe
          </label>
          <input
            id="team-name"
            name="teamName"
            type="text"
            required
            className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="team-code"
            className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
          >
            Código
          </label>
          <input
            id="team-code"
            name="teamCode"
            type="text"
            required
            placeholder="Ex: CSA"
            className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 font-mono-safe text-sm uppercase text-ink placeholder:text-muted placeholder:normal-case focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="team-password"
            className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
          >
            Senha
          </label>
          <input
            id="team-password"
            name="password"
            type="text"
            required
            className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 font-mono-safe text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          {state.error}
        </p>
      )}

      {state.created && (
        <p className="mt-4 border border-accent bg-accent/10 px-3 py-2 text-sm text-ink">
          Equipe criada. Código: <strong className="font-mono-safe">{state.created.teamCode}</strong>
          {" · "}
          Senha: <strong className="font-mono-safe">{state.created.password}</strong>
          {" — "}
          anote agora, essa senha não será mostrada de novo.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 border border-line-strong px-5 py-3 rounded-sm font-mono-safe text-sm uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar acesso"}
      </button>
    </form>
  );
}
