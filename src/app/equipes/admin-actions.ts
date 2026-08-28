"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isValidAdminAccessCode } from "@/lib/admin";
import { createAdminSession, destroyAdminSession, readAdminSession } from "@/lib/admin-session";
import { readPhotoUpload } from "@/lib/photo-upload";
import { isKnownSiteImageSlot, setSiteImage, clearSiteImage } from "@/lib/site-images";

const ADMIN_LOGIN_PATH = "/equipes/admin/login";

export type LoginState = {
  error: string | null;
};

export async function loginAdminAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const code = String(formData.get("code") ?? "");

  if (!code.trim()) {
    return { error: "Informe o código de acesso." };
  }

  if (!isValidAdminAccessCode(code)) {
    return { error: "Código de acesso inválido." };
  }

  await createAdminSession();
  redirect("/equipes/admin");
}

export async function logoutAdminAction(): Promise<void> {
  await destroyAdminSession();
  redirect(ADMIN_LOGIN_PATH);
}

// `resetToken` is bumped on every successful submit and left unchanged on
// error — same pattern as roster-actions.ts's ActionState. Each of the ~27
// upload forms on /equipes/admin keeps its own instance of this state (its
// own useActionState call), so one form's error/reset never affects another.
export type ActionState = {
  error: string | null;
  resetToken: number;
};

export async function updateSiteImageAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const slotKey = String(formData.get("slotKey") ?? "");
  if (!isKnownSiteImageSlot(slotKey)) {
    return { error: "Slot de imagem desconhecido.", resetToken: prevState.resetToken };
  }

  const photoResult = await readPhotoUpload(formData.get("photo"));
  if (photoResult.kind === "error") {
    return { error: photoResult.message, resetToken: prevState.resetToken };
  }
  if (photoResult.kind === "none") {
    return { error: "Selecione uma imagem para enviar.", resetToken: prevState.resetToken };
  }

  setSiteImage(slotKey, photoResult.dataUri);

  revalidatePath("/", "layout");
  return { error: null, resetToken: prevState.resetToken + 1 };
}

export async function clearSiteImageAction(formData: FormData): Promise<void> {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const slotKey = String(formData.get("slotKey") ?? "");
  if (isKnownSiteImageSlot(slotKey)) {
    clearSiteImage(slotKey);
  }

  revalidatePath("/", "layout");
}
