"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createUser, findUserByCredentials } from "@/lib/users";
import { createUserSession, destroyUserSession, readUserSessionId } from "@/lib/user-session";
import { requestMembership } from "@/lib/membership";
import { updateSafetyInfo } from "@/lib/safety-info";
import { readPhotoUpload } from "@/lib/photo-upload";
import { addEquipment, getOperatorByUserId, removeEquipment, updateOperatorPhoto } from "@/lib/roster-data";
import {
  WEAPON_CLASSES,
  PROPULSION_TYPES,
  RED_DOT_OPTICS,
  SCOPE_OPTICS,
  LIGHTS_LASERS,
  MUZZLE_DEVICES,
  STOCKS,
  GEAR_RATIOS,
  MOTOR_TYPES,
  SHAFT_SIZES,
  BATTERIES,
  BB_WEIGHTS,
  readCatalogSelect,
  readCatalogMulti,
} from "@/lib/equipment-catalog";

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

export type SafetyInfoState = {
  error: string | null;
  saved: boolean;
};

/**
 * Saves the account's own private safety/emergency data (see
 * src/lib/safety-info.ts). Never touches `operators` or anything a team or
 * the public site can read.
 */
export async function updateSafetyInfoAction(
  _prevState: SafetyInfoState,
  formData: FormData
): Promise<SafetyInfoState> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const birthDateRaw = String(formData.get("birthDate") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim().slice(0, 120);
  const bloodTypeRaw = String(formData.get("bloodType") ?? "").trim();
  const medicalConditions = String(formData.get("medicalConditions") ?? "").trim().slice(0, 500);
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim().slice(0, 120);
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim().slice(0, 40);

  await updateSafetyInfo(userId, {
    birthDate: birthDateRaw || null,
    city,
    bloodType: bloodTypeRaw || null,
    medicalConditions,
    emergencyContactName,
    emergencyContactPhone,
  });

  revalidatePath("/conta");
  return { error: null, saved: true };
}

export type ProfilePhotoState = {
  error: string | null;
};

/** Lets the logged-in account owner set their own operator photo — separate from updateOperator, which only the team's own Ficha da Equipe can call. */
export async function updateProfilePhotoAction(
  _prevState: ProfilePhotoState,
  formData: FormData
): Promise<ProfilePhotoState> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const operator = await getOperatorByUserId(userId);
  if (!operator) {
    return { error: "Operador não encontrado para esta conta." };
  }

  const photoResult = await readPhotoUpload(formData.get("photo"), "square", formData.get("photoFit") === "contain" ? "contain" : "cover");
  if (photoResult.kind === "error") {
    return { error: photoResult.message };
  }
  if (photoResult.kind === "none") {
    return { error: "Selecione uma foto para enviar." };
  }

  await updateOperatorPhoto(operator.id, photoResult.dataUri, photoResult.fit);

  revalidatePath("/conta");
  revalidatePath("/conta/ficha");
  revalidatePath("/operadores");
  return { error: null };
}

// `resetToken` is bumped on every successful submit and left unchanged on
// error — same convention as src/app/equipes/roster-actions.ts's
// ActionState, which the add-equipment form uses as a React `key` to reset
// its (uncontrolled) fields after a successful add.
export type EquipmentActionState = {
  error: string | null;
  resetToken: number;
};

function readFit(formData: FormData, key: string): "cover" | "contain" {
  return formData.get(key) === "contain" ? "contain" : "cover";
}

/**
 * Lets the account owner add their own equipment — separate from
 * addEquipment's team-portal caller (roster-actions.ts's addEquipmentAction),
 * which resolves the operator by teamId; this one resolves it by the logged-
 * in userId instead, so an operator can describe their own loadout without
 * needing their team to do it for them.
 */
export async function addEquipmentAction(
  prevState: EquipmentActionState,
  formData: FormData
): Promise<EquipmentActionState> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const operator = await getOperatorByUserId(userId);
  if (!operator) {
    return { error: "Operador não encontrado para esta conta.", resetToken: prevState.resetToken };
  }

  const photoResult = await readPhotoUpload(formData.get("photo"), "square", readFit(formData, "photoFit"));
  if (photoResult.kind === "error") {
    return { error: photoResult.message, resetToken: prevState.resetToken };
  }

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const description = String(formData.get("description") ?? "")
    .trim()
    .slice(0, 200);

  if (!name) {
    return { error: "Informe ao menos o nome do equipamento.", resetToken: prevState.resetToken };
  }

  const result = await addEquipment(operator.id, {
    photo: photoResult.kind === "ok" ? photoResult.dataUri : null,
    photoFit: photoResult.kind === "ok" ? photoResult.fit : undefined,
    name: name.slice(0, 120),
    brand: brand.slice(0, 80),
    description,
    weaponClass: readCatalogSelect(formData, "weaponClass", WEAPON_CLASSES),
    propulsion: readCatalogSelect(formData, "propulsion", PROPULSION_TYPES),
    optics: readCatalogMulti(formData, "optics", RED_DOT_OPTICS),
    scopes: readCatalogMulti(formData, "scopes", SCOPE_OPTICS),
    lightsLasers: readCatalogMulti(formData, "lightsLasers", LIGHTS_LASERS),
    muzzleDevices: readCatalogMulti(formData, "muzzleDevices", MUZZLE_DEVICES),
    stocks: readCatalogMulti(formData, "stocks", STOCKS),
    gearRatio: readCatalogSelect(formData, "gearRatio", GEAR_RATIOS),
    motorType: readCatalogSelect(formData, "motorType", MOTOR_TYPES),
    shaftSize: readCatalogSelect(formData, "shaftSize", SHAFT_SIZES),
    battery: readCatalogSelect(formData, "battery", BATTERIES),
    bbWeight: readCatalogSelect(formData, "bbWeight", BB_WEIGHTS),
  });

  if (!result.ok) {
    return { error: result.error, resetToken: prevState.resetToken };
  }

  revalidatePath("/conta");
  revalidatePath("/conta/ficha");
  revalidatePath("/operadores");
  revalidatePath("/central-do-airsoft");
  revalidatePath(`/operadores/${operator.id}`);
  return { error: null, resetToken: prevState.resetToken + 1 };
}

/** Removes one of the account owner's own equipment items — scoped to their own operatorId, resolved by userId, same as addEquipmentAction above. */
export async function removeEquipmentAction(formData: FormData): Promise<void> {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const operator = await getOperatorByUserId(userId);
  const equipmentId = String(formData.get("equipmentId") ?? "");
  if (operator && equipmentId) {
    await removeEquipment(operator.id, equipmentId);
  }

  revalidatePath("/conta");
  revalidatePath("/conta/ficha");
  revalidatePath("/operadores");
  if (operator) revalidatePath(`/operadores/${operator.id}`);
}
