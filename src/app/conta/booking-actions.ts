"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readUserSessionId } from "@/lib/user-session";
import { requestBooking, cancelBooking } from "@/lib/field-bookings";
import { getWindowsForDate, isDateBookable } from "@/lib/field-schedule";

const AGENDAMENTOS_PATH = "/conta/agendamentos";

export type BookingState = {
  error: string | null;
};

export async function requestBookingAction(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  // Re-validate server-side — the client only ever renders windows/dates
  // this same schedule config produced, but never trust that alone.
  if (!isDateBookable(date)) {
    return { error: "Data inválida ou fora da janela de agendamento (até 1 mês de antecedência)." };
  }
  const validWindow = getWindowsForDate(date).some(
    (w) => w.start === startTime && w.end === endTime
  );
  if (!validWindow) {
    return { error: "Horário inválido para essa data." };
  }

  const result = await requestBooking(userId, date, startTime, endTime);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(AGENDAMENTOS_PATH);
  return { error: null };
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const bookingId = String(formData.get("bookingId") ?? "");
  if (bookingId) {
    await cancelBooking(userId, bookingId);
  }

  revalidatePath(AGENDAMENTOS_PATH);
}
