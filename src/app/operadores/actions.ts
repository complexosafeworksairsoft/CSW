"use server";

import { revalidatePath } from "next/cache";
import { readAdminSession } from "@/lib/admin-session";
import { getPublicOperators } from "@/lib/roster-data";
import { findTeamById } from "@/lib/teams";
import {
  addComment,
  addReaction,
  isReactionKind,
} from "@/lib/engagement-data";

// Both actions below are PUBLIC — unlike everything else in this codebase,
// they are callable with no team session and no admin session. The only
// server-side identity check either of them does is: is the *caller*
// currently signed in as the site admin (readAdminSession())? That check
// decides comment attribution ("Allis" vs. anonymous) — see
// addCommentAction. Nothing about which operator gets reacted to /
// commented on requires any session at all, by design (this is the public,
// no-login "Operadores" directory).

const OPERADORES_PATH = "/operadores";

// resetToken shape mirrors src/app/equipes/roster-actions.ts's ActionState.
export type ActionState = {
  error: string | null;
  resetToken: number;
};

/**
 * Looks up an operator by id, but ONLY among currently-public operators —
 * this is the gate that stops these public actions from ever touching a
 * private operator's data (e.g. by someone guessing/reusing an id after a
 * team flips an operator back to private).
 */
async function findPublicOperator(operatorId: string) {
  const publicOperators = await getPublicOperators();
  return publicOperators.find((o) => o.id === operatorId) ?? null;
}

/** Revalidates both the "Destaques" directory page and the operator's team roster page. */
async function revalidateOperatorPages(teamId: string): Promise<void> {
  revalidatePath(OPERADORES_PATH);
  const team = await findTeamById(teamId);
  if (team) {
    revalidatePath(`/operadores/equipe/${team.teamCode}`);
  }
}

export async function reactAction(formData: FormData): Promise<void> {
  const operatorId = String(formData.get("operatorId") ?? "");
  const kindRaw = String(formData.get("kind") ?? "");

  const operator = await findPublicOperator(operatorId);
  if (!operator || !isReactionKind(kindRaw)) {
    return;
  }

  await addReaction(operator.id, kindRaw);
  await revalidateOperatorPages(operator.teamId);
}

const COMMENT_TEXT_MAX = 100;

export async function addCommentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const operatorId = String(formData.get("operatorId") ?? "");
  const operator = await findPublicOperator(operatorId);
  if (!operator) {
    return { error: "Operador não encontrado.", resetToken: prevState.resetToken };
  }

  // Hard cap re-validated server-side — never trust the client's maxLength alone.
  const text = String(formData.get("text") ?? "")
    .trim()
    .slice(0, COMMENT_TEXT_MAX);

  if (!text) {
    return {
      error: "Escreva algo antes de comentar.",
      resetToken: prevState.resetToken,
    };
  }

  // This is the ENTIRE "except if the commenter is Allis" mechanism: a
  // server-side check of the admin session cookie. There is no visitor
  // login, so there's no client-supplied "who am I" to trust — every
  // submitter who is not currently signed in as admin is stored anonymous.
  const isAdmin = await readAdminSession();
  const authorName = isAdmin ? "Allis" : null;

  await addComment(operator.id, text, authorName);
  await revalidateOperatorPages(operator.teamId);
  return { error: null, resetToken: prevState.resetToken + 1 };
}
