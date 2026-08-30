import { formatDateLabel } from "@/lib/field-schedule";
import { confirmBookingAction, rejectBookingAction } from "./booking-actions";

export type PendingBookingRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  username: string;
  displayName: string;
};

/** Pending field-booking requests waiting on admin review — "Agendamentos do Campo" section of the admin panel. */
export default function PendingBookingsList({ bookings }: { bookings: PendingBookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-4 py-3">
        Nenhuma solicitação de agendamento pendente.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{booking.displayName}</p>
            <p className="text-xs text-muted">
              @{booking.username} · {formatDateLabel(booking.date)} · {booking.startTime}–{booking.endTime}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <form action={confirmBookingAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                type="submit"
                className="rounded-sm bg-accent px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest font-semibold text-[#231400] hover:opacity-90 transition-opacity"
              >
                Confirmar
              </button>
            </form>
            <form action={rejectBookingAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                type="submit"
                className="rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-muted hover:border-accent hover:text-accent transition-colors"
              >
                Recusar
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
