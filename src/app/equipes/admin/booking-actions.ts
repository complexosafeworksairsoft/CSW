"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { confirmBooking, rejectBooking } from "@/lib/field-bookings";

const ADMIN_LOGIN_PATH = "/equipes/admin/login";
const ADMIN_PATH = "/equipes/admin";

export async function confirmBookingAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const bookingId = String(formData.get("bookingId") ?? "");
  if (bookingId) {
    await confirmBooking(bookingId);
  }

  revalidatePath(ADMIN_PATH);
}

export async function rejectBookingAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const bookingId = String(formData.get("bookingId") ?? "");
  if (bookingId) {
    await rejectBooking(bookingId);
  }

  revalidatePath(ADMIN_PATH);
}
