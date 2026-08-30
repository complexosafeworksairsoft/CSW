"use client";

import { useActionState } from "react";
import { requestBookingAction, type BookingState } from "../../booking-actions";

const initialState: BookingState = { error: null };

export default function RequestSlotForm({
  date,
  start,
  end,
  disabled,
}: {
  date: string;
  start: string;
  end: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(requestBookingAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="startTime" value={start} />
      <input type="hidden" name="endTime" value={end} />
      <button
        type="submit"
        disabled={disabled || pending}
        className="border border-line-strong px-4 py-2 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-line-strong disabled:hover:text-ink"
      >
        {disabled ? "Lotado" : pending ? "Enviando…" : "Solicitar vaga"}
      </button>
      {state.error && (
        <p role="alert" className="max-w-[220px] text-right text-xs text-accent">
          {state.error}
        </p>
      )}
    </form>
  );
}
