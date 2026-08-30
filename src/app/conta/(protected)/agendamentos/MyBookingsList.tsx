import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import type { FieldBooking } from "@/lib/field-bookings";
import { formatDateLabel } from "@/lib/field-schedule";
import { cancelBookingAction } from "../../booking-actions";

const STATUS_LABEL: Record<FieldBooking["status"], string> = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  rejected: "Recusado",
  cancelled: "Cancelado",
};

const STATUS_COLOR: Record<FieldBooking["status"], string> = {
  pending: "text-muted",
  confirmed: "text-accent",
  rejected: "text-muted",
  cancelled: "text-muted",
};

export default function MyBookingsList({ bookings }: { bookings: FieldBooking[] }) {
  if (bookings.length === 0) {
    return <p className="mt-4 text-sm text-muted">Você ainda não tem agendamentos.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3"
        >
          <div>
            <p className="text-sm text-ink">
              {formatDateLabel(booking.date)} · {booking.startTime}–{booking.endTime}
            </p>
            <p className={`font-mono-safe text-xs uppercase tracking-widest ${STATUS_COLOR[booking.status]}`}>
              {STATUS_LABEL[booking.status]}
            </p>
          </div>

          {(booking.status === "pending" || booking.status === "confirmed") && (
            <form action={cancelBookingAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <ConfirmDeleteButton
                label="Cancelar"
                confirmMessage="Cancelar esse agendamento?"
                size="sm"
              />
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
