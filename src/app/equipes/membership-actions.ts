"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readSessionTeamId } from "@/lib/session";
import { approveRequest, rejectRequest } from "@/lib/membership";

const SOLICITACOES_PATH = "/equipes/solicitacoes";

export async function approveRequestAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const requestId = String(formData.get("requestId") ?? "");
  if (requestId) {
    await approveRequest(teamId, requestId);
  }

  revalidatePath(SOLICITACOES_PATH);
  revalidatePath("/equipes/ficha");
}

export async function rejectRequestAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const requestId = String(formData.get("requestId") ?? "");
  if (requestId) {
    await rejectRequest(teamId, requestId);
  }

  revalidatePath(SOLICITACOES_PATH);
}
