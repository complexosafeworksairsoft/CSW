"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { approveUserAccount, findUserById, rejectUserAccount } from "@/lib/users";
import { createOperatorForApprovedUser, getOperatorByUserId } from "@/lib/roster-data";

const ADMIN_LOGIN_PATH = "/equipes/admin/login";
const ADMIN_PATH = "/equipes/admin";

/**
 * Approving an account also creates its operator record (team_id null —
 * see roster-data.ts's createOperatorForApprovedUser): from this point on
 * the person IS an operator, whether or not they've joined a team yet.
 */
export async function approveUserAccountAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const userId = String(formData.get("userId") ?? "");
  if (userId) {
    await approveUserAccount(userId);

    const user = await findUserById(userId);
    const existingOperator = user ? await getOperatorByUserId(user.id) : null;
    if (user && !existingOperator) {
      await createOperatorForApprovedUser(user.id, user.displayName, user.username.toUpperCase());
    }
  }

  revalidatePath(ADMIN_PATH);
}

export async function rejectUserAccountAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const userId = String(formData.get("userId") ?? "");
  if (userId) {
    await rejectUserAccount(userId);
  }

  revalidatePath(ADMIN_PATH);
}
