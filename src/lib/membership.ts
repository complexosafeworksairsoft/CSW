// Server-only module: join requests linking an individual user account
// (src/lib/users.ts) to a team. A user requests to join one team at a time
// (enforced by the partial unique index on team_membership_requests, see
// supabase/schema.sql); the team reviews and approves/rejects using its
// existing shared portal login — no new "captain" role in this pass, any
// holder of the team's login can decide.
//
// Approving a request creates the person's `operators` row (or reuses the
// approval flow's own insert) and links it to their user_id, so from then on
// their individual account and their roster entry are the same person.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { addOperator } from "./roster-data";
import { findUserById } from "./users";

function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

export type MembershipStatus = "pending" | "approved" | "rejected";

export type MembershipRequest = {
  id: string;
  userId: string;
  teamId: string;
  status: MembershipStatus;
  requestedOperatorName: string | null;
  createdAt: number;
};

type MembershipRequestRow = {
  id: string;
  user_id: string;
  team_id: string;
  status: MembershipStatus;
  requested_operator_name: string | null;
  created_at: string;
};

function rowToRequest(row: MembershipRequestRow): MembershipRequest {
  return {
    id: row.id,
    userId: row.user_id,
    teamId: row.team_id,
    status: row.status,
    requestedOperatorName: row.requested_operator_name,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** The user's current active (pending or approved) request, if any — this is what enforces "one team at a time" for reads. */
export async function getActiveRequestForUser(userId: string): Promise<MembershipRequest | null> {
  const { data, error } = await db()
    .from("team_membership_requests")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["pending", "approved"])
    .maybeSingle<MembershipRequestRow>();

  if (error || !data) return null;
  return rowToRequest(data);
}

/**
 * Submits a join request. Rejected on the app side if the user already has
 * an active request (belt-and-suspenders alongside the database's partial
 * unique index, which is the real enforcement).
 */
export async function requestMembership(
  userId: string,
  teamId: string,
  requestedOperatorName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const active = await getActiveRequestForUser(userId);
  if (active) {
    return {
      ok: false,
      error: "Você já tem uma solicitação pendente ou aprovada. Só é possível pertencer a uma equipe por vez.",
    };
  }

  const { error } = await db().from("team_membership_requests").insert({
    id: generateId("req"),
    user_id: userId,
    team_id: teamId,
    status: "pending",
    requested_operator_name: requestedOperatorName.trim().slice(0, 120) || null,
  });

  if (error) {
    return { ok: false, error: "Não foi possível enviar a solicitação. Tente novamente." };
  }
  return { ok: true };
}

/** Every active (pending or approved) request across all teams — used by the admin's "Acessos individuais" list to show each account's current team affiliation. */
export async function getAllActiveRequests(): Promise<MembershipRequest[]> {
  const { data, error } = await db()
    .from("team_membership_requests")
    .select("*")
    .in("status", ["pending", "approved"])
    .returns<MembershipRequestRow[]>();

  if (error || !data) return [];
  return data.map(rowToRequest);
}

/** Pending requests for one team, oldest first — what the "Solicitações" tab in the team portal lists. */
export async function getPendingRequestsForTeam(teamId: string): Promise<MembershipRequest[]> {
  const { data, error } = await db()
    .from("team_membership_requests")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .returns<MembershipRequestRow[]>();

  if (error || !data) return [];
  return data.map(rowToRequest);
}

/**
 * Approves a pending request, scoped to the reviewing team (a team can never
 * approve another team's request): creates the operator row for that person
 * and links it to their user account. New operators start private
 * (isPublic: false) — the team can toggle that from the Ficha, same as any
 * operator they add by hand.
 */
export async function approveRequest(
  teamId: string,
  requestId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: request, error: fetchError } = await db()
    .from("team_membership_requests")
    .select("*")
    .eq("id", requestId)
    .eq("team_id", teamId)
    .eq("status", "pending")
    .maybeSingle<MembershipRequestRow>();

  if (fetchError || !request) {
    return { ok: false, error: "Solicitação não encontrada ou já revisada." };
  }

  const user = await findUserById(request.user_id);
  if (!user) {
    return { ok: false, error: "Usuário não encontrado." };
  }

  const operatorName = request.requested_operator_name?.trim() || user.displayName;
  const result = await addOperator(teamId, {
    photo: null,
    name: operatorName,
    tag: user.username.toUpperCase().slice(0, 40),
    startMonth: "",
    category: "",
    isPublic: false,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  await db().from("operators").update({ user_id: user.id }).eq("id", result.operator.id);
  await db()
    .from("team_membership_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  return { ok: true };
}

/** Rejects a pending request, scoped to the reviewing team. */
export async function rejectRequest(teamId: string, requestId: string): Promise<void> {
  await db()
    .from("team_membership_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("team_id", teamId)
    .eq("status", "pending");
}
