"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createUser, findUserByCredentials } from "@/lib/users";
import { createUserSession, destroyUserSession, readUserSessionId } from "@/lib/user-session";
import { requestMembership } from "@/lib/membership";

export type AuthState = {
  error: string | null;
};

// Registering does NOT log the person in — every new account starts
// 'pending' (see src/lib/users.ts) and needs an admin to approve it first
// (src/app/equipes/admin/account-actions.ts). `submitted` tells
// RegisterForm.tsx to show a "aguardando aprovação" message instead of the
// error UI or a redirect.
export type RegisterState = {
  error: string | null;
  submitted: boolean;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!username || !displayName || !password) {
    return { error: "Preencha todos os campos.", submitted: false };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem.", submitted: false };
  }

  const result = await createUser({ username, password, displayName });
  if (!result.ok) {
    return { error: result.error, submitted: false };
  }

  return { error: null, submitted: true };
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
  if (user.status === "pending") {
    return { error: "Sua conta ainda está aguardando aprovação da administração." };
  }
  if (user.status === "rejected") {
    return { error: "Seu cadastro não foi aprovado. Fale com a administração do Complexo." };
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
