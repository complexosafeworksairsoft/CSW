"use client";

import { useActionState } from "react";
import { requestMembershipAction, type MembershipState } from "@/app/conta/actions";

const initialState: MembershipState = { error: null };

/** Lets a logged-in user with no active team request/membership ask to join this specific team, right from the team's own page. */
export default function JoinTeamForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(requestMembershipAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 flex flex-wrap items-end gap-3 border border-line-strong bg-surface-2 rounded-sm p-5"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <div className="flex-1 min-w-[200px]">
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
          className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-accent px-5 py-2.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-[#231400] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Solicitar entrada"}
      </button>

      {state.error && (
        <p role="alert" className="w-full border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          {state.error}
        </p>
      )}
    </form>
  );
}
