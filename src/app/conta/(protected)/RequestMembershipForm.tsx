"use client";

import { useActionState } from "react";
import { requestMembershipAction, type MembershipState } from "../actions";

const initialState: MembershipState = { error: null };

export default function RequestMembershipForm({
  teams,
}: {
  teams: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(requestMembershipAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-6 space-y-5 border border-line-strong bg-surface-2 rounded-sm p-6"
    >
      <div>
        <label
          htmlFor="teamId"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Equipe
        </label>
        <select
          id="teamId"
          name="teamId"
          required
          defaultValue=""
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
        >
          <option value="" disabled>
            Selecione uma equipe
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="operatorName"
          className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
        >
          Seu nome/apelido em campo (opcional)
        </label>
        <input
          id="operatorName"
          name="operatorName"
          type="text"
          placeholder="Como a equipe deve te reconhecer"
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
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
        {pending ? "Enviando…" : "Solicitar entrada"}
      </button>
    </form>
  );
}
