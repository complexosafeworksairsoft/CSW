"use client";

import { useActionState } from "react";
import PhotoUploadField from "@/components/PhotoUploadField";
import { updateTeamProfileAction, type ActionState } from "../../roster-actions";
import type { TeamProfile } from "@/lib/roster-data";

const initialState: ActionState = { error: null, resetToken: 0 };

export default function TeamProfileForm({
  teamName,
  profile,
}: {
  teamName: string;
  profile: TeamProfile;
}) {
  const [state, formAction, pending] = useActionState(updateTeamProfileAction, initialState);

  return (
    <div className="border border-line bg-surface p-6 sm:p-8">
      <p className="eyebrow">Perfil da equipe</p>

      <form action={formAction} className="mt-4 grid gap-8 lg:grid-cols-[220px_1fr]">
        <PhotoUploadField
          name="photo"
          label="Foto da equipe"
          existingPhoto={profile.photo}
          ratio="square"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="teamName"
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Nome da equipe
            </label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              required
              defaultValue={teamName}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 font-display text-lg font-semibold text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="foundedDate"
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Data de fundação
            </label>
            <input
              id="foundedDate"
              name="foundedDate"
              type="date"
              defaultValue={profile.foundedDate ?? ""}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="eventsOrg"
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Organização de Eventos
            </label>
            <p className="mt-1 text-xs text-muted">
              Descreva a atuação da equipe na organização de eventos.
            </p>
            <textarea
              id="eventsOrg"
              name="eventsOrg"
              rows={4}
              defaultValue={profile.eventsOrg}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="sm:col-span-2 border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent"
            >
              {state.error}
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-accent px-5 py-3 rounded-sm font-mono-safe text-sm uppercase tracking-widest text-[#231400] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar perfil"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
