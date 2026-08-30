"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createUser, findUserByCredentials } from "@/lib/users";
import { createUserSession, destroyUserSession, readUserSessionId } from "@/lib/user-session";
import { requestMembership } from "@/lib/membership";

export type AuthState = {
  error: string | null;
};

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!username || !displayName || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const result = await createUser({ username, password, displayName });
  if (!result.ok) {
    return { error: result.error };
  }

  await createUserSession(result.user.id);
  redirect("/conta");
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Informe o usuário e a senha." };
  }

  const user = await findUserByCredentials(username, password);
  if (!user) {
    return { error: "Usuário ou senha inválidos." };
  }

  await createUserSession(user.id);
  redirect("/conta");
}

export async function logoutAction(): Promise<void> {
  await destroyUserSession();
  redirect("/conta/login");
}

export type MembershipState = {
  error: string | null;
};

export async function requestMembershipAction(
  _prevState: MembershipState,
  formData: FormData
): Promise<MembershipState> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const teamId = String(formData.get("teamId") ?? "");
  const operatorName = String(formData.get("operatorName") ?? "").trim();

  if (!teamId) {
    return { error: "Selecione uma equipe." };
  }

  const result = await requestMembership(userId, teamId, operatorName);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/conta");
  return { error: null };
}
