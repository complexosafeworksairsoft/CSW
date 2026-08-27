"use client";

import { useActionState } from "react";
import PhotoTile from "@/components/PhotoTile";
import PhotoUploadField from "@/components/PhotoUploadField";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import type { SiteImageSlot } from "@/lib/site-images";
import { updateSiteImageAction, clearSiteImageAction, type ActionState } from "../admin-actions";

const initialState: ActionState = { error: null, resetToken: 0 };

/**
 * One card in the /equipes/admin grid: the slot's current photo (or empty
 * state) on the left, an upload form on the right, and — only when a photo
 * already exists — a "Remover imagem" control under the current photo.
 * Each card owns its own useActionState instance, so submitting one slot's
 * form never resets or shows errors on another slot's form.
 */
export default function AdminSlotCard({
  slot,
  photo,
}: {
  slot: SiteImageSlot;
  photo: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateSiteImageAction, initialState);

  return (
    <div className="border border-line bg-surface p-6">
      <p className="font-mono-safe text-[10px] uppercase tracking-widest text-accent">
        {slot.key}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{slot.label}</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <span className="block font-mono-safe text-[10px] uppercase tracking-widest text-muted mb-2">
            Atual
          </span>
          <PhotoTile photo={photo} label={slot.label} ratio={slot.ratio} />
          {photo && (
            <form action={clearSiteImageAction} className="mt-3">
              <input type="hidden" name="slotKey" value={slot.key} />
              <ConfirmDeleteButton
                label="Remover imagem"
                confirmMessage="Remover esta imagem e voltar ao placeholder neste local do site?"
                size="sm"
              />
            </form>
          )}
        </div>

        <form action={formAction}>
          <span className="block font-mono-safe text-[10px] uppercase tracking-widest text-muted mb-2">
            Nova imagem
          </span>
          <input type="hidden" name="slotKey" value={slot.key} />
          <PhotoUploadField name="photo" label={slot.label} ratio={slot.ratio} />

          {state.error && (
            <p
              role="alert"
              className="mt-3 border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-3 w-full border border-line-strong px-4 py-2.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Enviar imagem"}
          </button>
        </form>
      </div>
    </div>
  );
}
