"use client";

import { useActionState } from "react";
import PhotoUploadField from "@/components/PhotoUploadField";
import { updateProfilePhotoAction, type ProfilePhotoState } from "../actions";
import type { Fit } from "@/lib/image-processing";

const initialState: ProfilePhotoState = { error: null };

export default function ProfilePhotoForm({
  existingPhoto,
  existingFit,
}: {
  existingPhoto: string | null;
  existingFit: Fit;
}) {
  const [state, formAction, pending] = useActionState(updateProfilePhotoAction, initialState);

  return (
    <form action={formAction} className="flex items-end gap-4">
      <PhotoUploadField
        name="photo"
        label="Sua foto"
        existingPhoto={existingPhoto}
        existingFit={existingFit}
        ratio="square"
        className="w-24 shrink-0"
      />
      <div>
        <button
          type="submit"
          disabled={pending}
          className="border border-line-strong px-4 py-2.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Salvar foto"}
        </button>
        {state.error && (
          <p role="alert" className="mt-2 max-w-[220px] text-xs text-accent">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
