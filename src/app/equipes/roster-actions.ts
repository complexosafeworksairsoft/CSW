"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readSessionTeamId } from "@/lib/session";
import { readPhotoUpload } from "@/lib/photo-upload";
import { updateTeamName } from "@/lib/teams";
import {
  addEquipment,
  addOperator,
  getOperatorForTeam,
  removeEquipment,
  removeOperator,
  setOperatorPublic,
  updateOperator,
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

  const teamName = String(formData.get("teamName") ?? "").trim();
  const nameResult = await updateTeamName(teamId, teamName);
  if (!nameResult.ok) {
    return { error: nameResult.error, resetToken: prevState.resetToken };
  }

  const foundedDateRaw = String(formData.get("foundedDate") ?? "").trim();
  const eventsOrg = String(formData.get("eventsOrg") ?? "")
    .trim()
    .slice(0, 2000);

  await updateTeamProfile(teamId, {
    ...(photoResult.kind === "ok" ? { photo: photoResult.dataUri } : {}),
    foundedDate: foundedDateRaw || null,
    eventsOrg,
  });

  revalidatePath(FICHA_PATH);
  // Team name shows up on the public Operadores directory too (static page),
  // so a rename needs an explicit bust there, not just on the ficha itself.
  revalidatePath("/operadores");
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
  const isPublic = formData.get("isPublic") === "on";

  if (!name || !tag) {
    return {
      error: "Informe ao menos o nome e a TAG do operador.",
      resetToken: prevState.resetToken,
    };
  }

  const result = await addOperator(teamId, {
    photo: photoResult.kind === "ok" ? photoResult.dataUri : null,
    name: name.slice(0, 120),
    tag: tag.slice(0, 40),
    startMonth: startMonth.slice(0, 7),
    category: category.slice(0, 80),
    isPublic,
  });

  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken };
  }

  revalidatePath(FICHA_PATH);
  return { error: null, resetToken: prevState.resetToken + 1 };
}

export async function updateOperatorAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  const operator = await getOperatorForTeam(teamId, operatorId);
  if (!operator) {
    return { error: "Operador não encontrado.", resetToken: prevState.resetToken };
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

  const result = await updateOperator(teamId, operator.id, {
    ...(photoResult.kind === "ok" ? { photo: photoResult.dataUri } : {}),
    name: name.slice(0, 120),
    tag: tag.slice(0, 40),
    startMonth: startMonth.slice(0, 7),
    category: category.slice(0, 80),
  });

  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken };
  }

  revalidatePath(FICHA_PATH);
  revalidatePath("/operadores");
  return { error: null, resetToken: prevState.resetToken + 1 };
}

export async function removeOperatorAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  if (operatorId) {
    await removeOperator(teamId, operatorId);
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
  const operator = await getOperatorForTeam(teamId, operatorId);
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

  const result = await addEquipment(operator.id, {
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
  const operator = await getOperatorForTeam(teamId, operatorId);
  if (operator && equipmentId) {
    await removeEquipment(operator.id, equipmentId);
  }

  revalidatePath(FICHA_PATH);
}

/**
 * Flips an operator's public/private flag. Lets a team change its mind about
 * showing someone on the public site without deleting and re-adding them.
 * `nextIsPublic` travels as a hidden field set to the opposite of the
 * operator's current state, so the button always toggles regardless of how
 * many times the page has been revalidated.
 */
export async function togglePublicAction(formData: FormData): Promise<void> {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const operatorId = String(formData.get("operatorId") ?? "");
  const nextIsPublic = formData.get("nextIsPublic") === "true";
  if (operatorId) {
    await setOperatorPublic(teamId, operatorId, nextIsPublic);
  }

  revalidatePath(FICHA_PATH);
}
