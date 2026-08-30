"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { removeUser, setUserPassword } from "@/lib/users";

const ADMIN_LOGIN_PATH = "/equipes/admin/login";
const ADMIN_PATH = "/equipes/admin";

export async function removeUserAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const userId = String(formData.get("userId") ?? "");
  if (userId) {
    await removeUser(userId);
  }

  revalidatePath(ADMIN_PATH);
}

// `resetToken` is bumped on every successful submit and left unchanged on
// error — same convention as team-actions.ts / roster-actions.ts. UserRow.tsx
// uses it to collapse the "Alterar senha" form back to the closed state
// after a successful save.
export type ChangePasswordState = {
  error: string | null;
  resetToken: number;
};

export async function changeUserPasswordAction(
  prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const userId = String(formData.get("userId") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const result = await setUserPassword(userId, newPassword);
  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken };
  }

  revalidatePath(ADMIN_PATH);
  return { error: null, resetToken: prevState.resetToken + 1 };
}
