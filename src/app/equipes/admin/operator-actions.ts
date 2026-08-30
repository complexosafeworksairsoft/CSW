"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { setOperatorScore } from "@/lib/roster-data";

const ADMIN_LOGIN_PATH = "/equipes/admin/login";
const ADMIN_PATH = "/equipes/admin";

export async function setOperatorScoreAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  const score = Number(formData.get("score") ?? 0);
  if (operatorId && Number.isFinite(score)) {
    const operator = await setOperatorScore(operatorId, score);
    if (operator) {
      revalidatePath(`/operadores/${operatorId}`);
    }
  }

  revalidatePath(ADMIN_PATH);
}
