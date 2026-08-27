"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { findTeamByCredentials } from "@/lib/teams";
import { createSession, destroySession, readSessionTeamId } from "@/lib/session";
import { toggleConfirmation } from "@/lib/agenda-data";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const teamCode = String(formData.get("teamCode") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!teamCode || !password) {
    return { error: "Informe o código da equipe e a senha." };
  }

  const team = findTeamByCredentials(teamCode, password);
  if (!team) {
    return { error: "Código de equipe ou senha inválidos." };
  }

  await createSession(team.id);
  redirect("/equipes");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/equipes/login");
}

export async function confirmPresenceAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const matchId = String(formData.get("matchId") ?? "");
  if (matchId) {
    toggleConfirmation(matchId, teamId);
  }

  revalidatePath("/equipes/agenda");
  revalidatePath("/equipes");
}
