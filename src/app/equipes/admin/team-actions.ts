"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { createTeam, removeTeam } from "@/lib/teams";

const ADMIN_LOGIN_PATH = "/equipes/admin/login";
const ADMIN_PATH = "/equipes/admin";

// `resetToken` is bumped on every successful submit and left unchanged on
// error — same pattern as admin-actions.ts / roster-actions.ts. On success
// this also carries the just-created team's code/password back to the form,
// since that's the only time the admin will ever see the plaintext password
// (the team list below never displays it again).
export type CreateTeamState = {
  error: string | null;
  resetToken: number;
  created: { teamCode: string; password: string; teamName: string } | null;
};

export async function createTeamAction(
  prevState: CreateTeamState,
  formData: FormData
): Promise<CreateTeamState> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const teamCode = String(formData.get("teamCode") ?? "");
  const password = String(formData.get("password") ?? "");
  const teamName = String(formData.get("teamName") ?? "");

  const result = createTeam({ teamCode, password, teamName });
  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken, created: null };
  }

  revalidatePath(ADMIN_PATH);
  return {
    error: null,
    resetToken: prevState.resetToken + 1,
    created: {
      teamCode: result.team.teamCode,
      password: result.team.password,
      teamName: result.team.teamName,
    },
  };
}

export async function removeTeamAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const teamId = String(formData.get("teamId") ?? "");
  if (teamId) {
    removeTeam(teamId);
  }

  revalidatePath(ADMIN_PATH);
}
