"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readSessionTeamId } from "@/lib/session";
import { readPhotoUpload } from "@/lib/photo-upload";
import {
  addEquipment,
  addOperator,
  getOperatorForTeam,
  removeEquipment,
  removeOperator,
  updateTeamProfile,
} from "@/lib/roster-data";

const FICHA_PATH = "/equipes/ficha";

// `resetToken` is bumped on every successful submit and left unchanged on
// error. Add-forms use it as a React `key` to reset their (uncontrolled)
// fields and photo preview after a successful add, while keeping whatever
// the user typed if the submission was rejected.
export type ActionState = {
  error: string | null;
  resetToken: number;
};

export async function updateTeamProfileAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const photoResult = await readPhotoUpload(formData.get("photo"));
  if (photoResult.kind === "error") {
    return { error: photoResult.message, resetToken: prevState.resetToken };
  }

  const foundedDateRaw = String(formData.get("foundedDate") ?? "").trim();
  const eventsOrg = String(formData.get("eventsOrg") ?? "")
    .trim()
    .slice(0, 2000);

  updateTeamProfile(teamId, {
    ...(photoResult.kind === "ok" ? { photo: photoResult.dataUri } : {}),
    foundedDate: foundedDateRaw || null,
    eventsOrg,
  });

  revalidatePath(FICHA_PATH);
  return { error: null, resetToken: prevState.resetToken + 1 };
}

export async function addOperatorAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const photoResult = await readPhotoUpload(formData.get("photo"));
  if (photoResult.kind === "error") {
    return { error: photoResult.message, resetToken: prevState.resetToken };
  }

  const name = String(formData.get("name") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();
  const startMonth = String(formData.get("startMonth") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!name || !tag) {
    return {
      error: "Informe ao menos o nome e a TAG do operador.",
      resetToken: prevState.resetToken,
    };
  }

  const result = addOperator(teamId, {
    photo: photoResult.kind === "ok" ? photoResult.dataUri : null,
    name: name.slice(0, 120),
    tag: tag.slice(0, 40),
    startMonth: startMonth.slice(0, 7),
    category: category.slice(0, 80),
  });

  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken };
  }

  revalidatePath(FICHA_PATH);
  return { error: null, resetToken: prevState.resetToken + 1 };
}

export async function removeOperatorAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  if (operatorId) {
    removeOperator(teamId, operatorId);
  }

  revalidatePath(FICHA_PATH);
}

export async function addEquipmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  const operator = getOperatorForTeam(teamId, operatorId);
  if (!operator) {
    return { error: "Operador não encontrado.", resetToken: prevState.resetToken };
  }

  const photoResult = await readPhotoUpload(formData.get("photo"));
  if (photoResult.kind === "error") {
    return { error: photoResult.message, resetToken: prevState.resetToken };
  }

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  // Hard cap re-validated server-side — never trust the client's maxLength alone.
  const description = String(formData.get("description") ?? "")
    .trim()
    .slice(0, 200);

  if (!name) {
    return {
      error: "Informe ao menos o nome do equipamento.",
      resetToken: prevState.resetToken,
    };
  }

  const result = addEquipment(operator.id, {
    photo: photoResult.kind === "ok" ? photoResult.dataUri : null,
    name: name.slice(0, 120),
    brand: brand.slice(0, 80),
    description,
  });

  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken };
  }

  revalidatePath(FICHA_PATH);
  return { error: null, resetToken: prevState.resetToken + 1 };
}

export async function removeEquipmentAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  const equipmentId = String(formData.get("equipmentId") ?? "");
  const operator = getOperatorForTeam(teamId, operatorId);
  if (operator && equipmentId) {
    removeEquipment(operator.id, equipmentId);
  }

  revalidatePath(FICHA_PATH);
}
