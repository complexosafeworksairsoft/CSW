import type { Metadata } from "next";
import { readUserSessionId } from "@/lib/user-session";
import {
  formatDateLabel,
  getWindowsForDate,
  isDateBookable,
  maxBookableDateISO,
  todayISO,
} from "@/lib/field-schedule";
import { FIELD_CAPACITY, getBookingsForUser, getSlotOccupancy } from "@/lib/field-bookings";
import RequestSlotForm from "./RequestSlotForm";
import MyBookingsList from "./MyBookingsList";

export const metadata: Metadata = {
  title: "Agendamentos | Safe Works",
  description: "Agende seu horário para jogar no campo do Complexo Safe Works.",
};

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const userId = await readUserSessionId();
  if (!userId) return null; // o layout já redireciona antes de chegar aqui

  const { date: rawDate } = await searchParams;
  const selectedDate = rawDate && isDateBookable(rawDate) ? rawDate : null;
  const dateOutOfRange = Boolean(rawDate) && !selectedDate;

  const [myBookings, occupancy] = await Promise.all([
    getBookingsForUser(userId),
    selectedDate ? getSlotOccupancy(selectedDate) : Promise.resolve({} as Record<string, number>),
  ]);

  const windows = selectedDate ? getWindowsForDate(selectedDate) : [];

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <p className="eyebrow">Campo de jogo</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Agendar horário para jogar
      </h1>
      <p className="mt-2 text-ink-soft">
        Horários disponíveis: terça a sexta das 19h às 22h, sábado das 15h às
        18h, e domingo das 8h às 11h e das 15h às 18h. Limite de{" "}
        {FIELD_CAPACITY} pessoas por horário.
      </p>
      <p className="mt-2 text-sm font-medium text-accent">
        Todo agendamento é uma solicitação — sua vaga só é garantida depois
        que a administração confirmar.
      </p>

      <form
        method="GET"
        className="mt-6 flex flex-wrap items-end gap-3 border border-line-strong bg-surface-2 rounded-sm p-5"
      >
        <div>
          <label
            htmlFor="date"
            className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
          >
            Escolha uma data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={selectedDate ?? rawDate ?? ""}
            min={todayISO()}
            max={maxBookableDateISO()}
            required
            className="mt-2 rounded-sm border border-line-strong bg-surface px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="border border-line-strong px-4 py-2.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors"
        >
          Ver horários
        </button>
      </form>

      {dateOutOfRange && (
        <p className="mt-4 border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          Escolha uma data entre hoje e {formatDateLabel(maxBookableDateISO())}.
        </p>
      )}

      {selectedDate &&
        (windows.length === 0 ? (
          <p className="mt-6 border border-dashed border-line-strong bg-surface-2 rounded-sm p-5 text-sm text-muted">
            Não há horários disponíveis em {formatDateLabel(selectedDate)} — o
            campo abre de terça a domingo, conforme os horários acima.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {windows.map((w) => {
              const count = occupancy[w.start] ?? 0;
              const full = count >= FIELD_CAPACITY;
              return (
                <div
                  key={w.start}
                  className="flex flex-wrap items-center justify-between gap-3 border border-line-strong bg-surface-2 rounded-sm p-4"
                >
                  <div>
                    <p className="font-mono-safe text-sm text-ink">
                      {w.start} – {w.end}
                    </p>
                    <p className="text-xs text-muted">
                      {count}/{FIELD_CAPACITY} solicitações ativas
                    </p>
                  </div>
                  <RequestSlotForm
                    date={selectedDate}
                    start={w.start}
                    end={w.end}
                    disabled={full}
                  />
                </div>
              );
            })}
          </div>
        ))}

      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">
          Meus agendamentos
        </h2>
        <MyBookingsList bookings={myBookings} />
      </div>
    </section>
  );
}
