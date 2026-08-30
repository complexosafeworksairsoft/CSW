// Server-only module: booking REQUESTS for a slot to play at the field
// (distinct from `matches`/agenda-data.ts, which is admin-published
// operations that teams confirm attendance for — this is individual users
// requesting their own time to play, see supabase/schema.sql's
// `field_bookings` table).
//
// Every booking starts 'pending' and only becomes 'confirmed' once an admin
// reviews it (see src/app/equipes/admin/booking-actions.ts) — deliberately
// NOT auto-confirmed, since the field has a real person-per-slot capacity
// that needs a human check, not just a counter.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

export const FIELD_CAPACITY = 16;

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type FieldBooking = {
  id: string;
  userId: string;
  date: string; // "AAAA-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: BookingStatus;
  createdAt: number;
};

type FieldBookingRow = {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
};

function rowToBooking(row: FieldBookingRow): FieldBooking {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Pending+confirmed booking count for one date+window — what enforces FIELD_CAPACITY. Rejected/cancelled don't count. */
export async function getActiveCountForSlot(date: string, startTime: string): Promise<number> {
  const { count } = await db()
    .from("field_bookings")
    .select("*", { count: "exact", head: true })
    .eq("date", date)
    .eq("start_time", startTime)
    .in("status", ["pending", "confirmed"]);

  return count ?? 0;
}

/** Active booking counts per start_time for a date, in one query — powers the "X/16" readout per window on the booking page. */
export async function getSlotOccupancy(date: string): Promise<Record<string, number>> {
  const { data } = await db()
    .from("field_bookings")
    .select("start_time")
    .eq("date", date)
    .in("status", ["pending", "confirmed"])
    .returns<{ start_time: string }[]>();

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.start_time] = (counts[row.start_time] ?? 0) + 1;
  }
  return counts;
}

/**
 * Submits a booking request. Rejects if the slot is already at capacity, or
 * if this user already has an active (pending/confirmed) request for the
 * exact same date+window — re-checked here, not just trusted from the
 * client, since occupancy can change between page load and submit.
 */
export async function requestBooking(
  userId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ ok: true; booking: FieldBooking } | { ok: false; error: string }> {
  const { data: existing } = await db()
    .from("field_bookings")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .eq("start_time", startTime)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Você já tem uma solicitação para esse horário." };
  }

  const activeCount = await getActiveCountForSlot(date, startTime);
  if (activeCount >= FIELD_CAPACITY) {
    return {
      ok: false,
      error: `Esse horário já atingiu o limite de ${FIELD_CAPACITY} pessoas. Escolha outro horário.`,
    };
  }

  const id = generateId("bk");
  const { data, error } = await db()
    .from("field_bookings")
    .insert({
      id,
      user_id: userId,
      date,
      start_time: startTime,
      end_time: endTime,
      status: "pending",
    })
    .select("*")
    .maybeSingle<FieldBookingRow>();

  if (error || !data) {
    return { ok: false, error: "Não foi possível enviar a solicitação. Tente novamente." };
  }
  return { ok: true, booking: rowToBooking(data) };
}

/** A user's own bookings, most recent date first — "Meus agendamentos". */
export async function getBookingsForUser(userId: string): Promise<FieldBooking[]> {
  const { data, error } = await db()
    .from("field_bookings")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })
    .returns<FieldBookingRow[]>();

  if (error || !data) return [];
  return data.map(rowToBooking);
}

/** Cancels a booking, scoped to the requesting user — one user can never cancel another's booking. */
export async function cancelBooking(userId: string, bookingId: string): Promise<void> {
  await db()
    .from("field_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("user_id", userId)
    .in("status", ["pending", "confirmed"]);
}

// --- Admin review -----------------------------------------------------

/** Every pending request across all users, oldest date first — the admin's "Agendamentos do Campo" queue. */
export async function getPendingBookings(): Promise<FieldBooking[]> {
  const { data, error } = await db()
    .from("field_bookings")
    .select("*")
    .eq("status", "pending")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .returns<FieldBookingRow[]>();

  if (error || !data) return [];
  return data.map(rowToBooking);
}

export async function confirmBooking(bookingId: string): Promise<void> {
  await db()
    .from("field_bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("status", "pending");
}

export async function rejectBooking(bookingId: string): Promise<void> {
  await db()
    .from("field_bookings")
    .update({ status: "rejected" })
    .eq("id", bookingId)
    .eq("status", "pending");
}
