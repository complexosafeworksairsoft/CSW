// Server-only module for the "Ficha da Equipe" roster: one team profile,
// its operadores (members, max MAX_OPERATORS_PER_TEAM per team) and each
// operador's equipamentos (max MAX_EQUIPMENT_PER_OPERATOR per operador).
//
// Backed by Supabase (see supabase/schema.sql for the `team_profiles`,
// `operators` and `equipment` tables) — replaced the earlier in-memory
// arrays, which reset on every server restart and were inconsistent across
// Vercel's serverless instances (e.g. a team could add an operator, then get
// "Operador não encontrado" adding that operator's equipment because the
// next request hit a fresh instance with an empty array).
//
// TODO (production): photos are still stored as base64 data URIs (now in a
// `text` column instead of in memory) — see the TODO in
// src/lib/photo-upload.ts. That's inherited from the old in-memory version,
// not fixed in this pass; swapping it for real object storage (e.g. Supabase
// Storage) is a separate, larger change.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// supabase() (src/lib/supabase.ts) is typed as `ReturnType<typeof createClient>`
// without a generated Database type, which — through a TypeScript quirk in how
// ReturnType resolves createClient's generics — makes every .insert()/.update()/
// .upsert() call type-error as accepting `never`. Re-asserting the client type
// here (this module only) sidesteps that without touching supabase.ts.
function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

export const MAX_OPERATORS_PER_TEAM = 15;
export const MAX_EQUIPMENT_PER_OPERATOR = 3;

export type TeamProfile = {
  teamId: string;
  photo: string | null; // base64 data URI — see TODO above
  foundedDate: string | null; // "AAAA-MM-DD"
  eventsOrg: string; // "Organização de Eventos" — free text
};

export type Operator = {
  id: string;
  teamId: string;
  photo: string | null;
  name: string;
  tag: string;
  startMonth: string; // "AAAA-MM"
  category: string;
  isPublic: boolean; // shows on the public /operadores page when true
  updatedAt: number; // epoch ms — see touchOperator() for what bumps this
};

export type Equipment = {
  id: string;
  operatorId: string;
  photo: string | null;
  name: string;
  brand: string;
  description: string; // hard max 200 chars, enforced in roster-actions.ts too
};

type TeamProfileRow = {
  team_id: string;
  photo: string | null;
  founded_date: string | null;
  events_org: string;
};

type OperatorRow = {
  id: string;
  team_id: string;
  photo: string | null;
  name: string;
  tag: string;
  start_month: string;
  category: string;
  is_public: boolean;
  updated_at: string;
};

type EquipmentRow = {
  id: string;
  operator_id: string;
  photo: string | null;
  name: string;
  brand: string;
  description: string;
};

function rowToTeamProfile(row: TeamProfileRow): TeamProfile {
  return {
    teamId: row.team_id,
    photo: row.photo,
    foundedDate: row.founded_date,
    eventsOrg: row.events_org,
  };
}

function rowToOperator(row: OperatorRow): Operator {
  return {
    id: row.id,
    teamId: row.team_id,
    photo: row.photo,
    name: row.name,
    tag: row.tag,
    startMonth: row.start_month,
    category: row.category,
    isPublic: row.is_public,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function rowToEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    operatorId: row.operator_id,
    photo: row.photo,
    name: row.name,
    brand: row.brand,
    description: row.description,
  };
}

let nextIdCounter = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(nextIdCounter++).toString(36)}`;
}

function defaultProfile(teamId: string): TeamProfile {
  return { teamId, photo: null, foundedDate: null, eventsOrg: "" };
}

/** Returns the team's profile, or sensible defaults if none was ever saved (no row is force-inserted just from a read). */
export async function getTeamProfile(teamId: string): Promise<TeamProfile> {
  const { data, error } = await db()
    .from("team_profiles")
    .select("*")
    .eq("team_id", teamId)
    .maybeSingle<TeamProfileRow>();

  if (error || !data) return defaultProfile(teamId);
  return rowToTeamProfile(data);
}

export async function updateTeamProfile(
  teamId: string,
  updates: Partial<Pick<TeamProfile, "photo" | "foundedDate" | "eventsOrg">>
): Promise<TeamProfile> {
  const current = await getTeamProfile(teamId);
  const next: TeamProfile = {
    teamId,
    photo: updates.photo !== undefined ? updates.photo : current.photo,
    foundedDate: updates.foundedDate !== undefined ? updates.foundedDate : current.foundedDate,
    eventsOrg: updates.eventsOrg !== undefined ? updates.eventsOrg : current.eventsOrg,
  };

  const { data, error } = await db()
    .from("team_profiles")
    .upsert(
      {
        team_id: next.teamId,
        photo: next.photo,
        founded_date: next.foundedDate,
        events_org: next.eventsOrg,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "team_id" }
    )
    .select("*")
    .maybeSingle<TeamProfileRow>();

  if (error || !data) return next;
  return rowToTeamProfile(data);
}

export async function getOperators(teamId: string): Promise<Operator[]> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true })
    .returns<OperatorRow[]>();

  if (error || !data) return [];
  return data.map(rowToOperator);
}

/** The operator row linked to an approved individual user account (see src/lib/membership.ts), or null if the user has none. */
export async function getOperatorByUserId(userId: string): Promise<Operator | null> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<OperatorRow>();

  if (error || !data) return null;
  return rowToOperator(data);
}

/** Looks up an operator, scoped to the given team so one team can never touch another's roster. */
export async function getOperatorForTeam(
  teamId: string,
  operatorId: string
): Promise<Operator | null> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("id", operatorId)
    .eq("team_id", teamId)
    .maybeSingle<OperatorRow>();

  if (error || !data) return null;
  return rowToOperator(data);
}

export type AddOperatorInput = {
  photo: string | null;
  name: string;
  tag: string;
  startMonth: string;
  category: string;
  isPublic: boolean;
};

export async function addOperator(
  teamId: string,
  input: AddOperatorInput
): Promise<{ ok: true; operator: Operator } | { ok: false; error: string }> {
  const { count } = await db()
    .from("operators")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if ((count ?? 0) >= MAX_OPERATORS_PER_TEAM) {
    return {
      ok: false,
      error: `Limite de ${MAX_OPERATORS_PER_TEAM} operadores atingido.`,
    };
  }

  const id = generateId("op");
  const nowIso = new Date().toISOString();
  const { data, error } = await db()
    .from("operators")
    .insert({
      id,
      team_id: teamId,
      photo: input.photo,
      name: input.name,
      tag: input.tag,
      start_month: input.startMonth,
      category: input.category,
      is_public: input.isPublic,
      updated_at: nowIso,
    })
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) {
    return { ok: false, error: "Não foi possível adicionar o operador. Tente novamente." };
  }
  return { ok: true, operator: rowToOperator(data) };
}

export type UpdateOperatorInput = {
  photo?: string | null;
  name: string;
  tag: string;
  startMonth: string;
  category: string;
};

/**
 * Updates an existing operator's own fields (scoped to the team — a team
 * can never edit another team's operator). `photo` is only overwritten when
 * explicitly present in the input (a new upload); omit it to keep the
 * operator's current photo, same convention as updateTeamProfile().
 */
export async function updateOperator(
  teamId: string,
  operatorId: string,
  input: UpdateOperatorInput
): Promise<{ ok: true; operator: Operator } | { ok: false; error: string }> {
  const { data, error } = await db()
    .from("operators")
    .update({
      ...(input.photo !== undefined ? { photo: input.photo } : {}),
      name: input.name,
      tag: input.tag,
      start_month: input.startMonth,
      category: input.category,
      updated_at: new Date().toISOString(),
    })
    .eq("id", operatorId)
    .eq("team_id", teamId)
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) {
    return { ok: false, error: "Operador não encontrado." };
  }
  return { ok: true, operator: rowToOperator(data) };
}

/** Removes an operator (scoped to the team) — equipamentos cascade in the database (see supabase/schema.sql). */
export async function removeOperator(teamId: string, operatorId: string): Promise<void> {
  await db().from("operators").delete().eq("id", operatorId).eq("team_id", teamId);
}

/**
 * Bumps `updated_at` on an operator to "now". There's no operator-edit form
 * yet beyond updateOperator(), so this is called from the other places that
 * change something about an operator after creation: toggling `isPublic`
 * and adding/removing equipamentos. Used to drive the public "Destaques"
 * (most recently updated) section — see getRecentPublicOperators() below.
 */
async function touchOperator(operatorId: string): Promise<void> {
  await db()
    .from("operators")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", operatorId);
}

/** Flips (or explicitly sets) an operator's public/private flag, scoped to the team. */
export async function setOperatorPublic(
  teamId: string,
  operatorId: string,
  isPublic: boolean
): Promise<Operator | null> {
  const { data, error } = await db()
    .from("operators")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", operatorId)
    .eq("team_id", teamId)
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) return null;
  return rowToOperator(data);
}

export async function getEquipment(operatorId: string): Promise<Equipment[]> {
  const { data, error } = await db()
    .from("equipment")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: true })
    .returns<EquipmentRow[]>();

  if (error || !data) return [];
  return data.map(rowToEquipment);
}

export type AddEquipmentInput = {
  photo: string | null;
  name: string;
  brand: string;
  description: string;
};

export async function addEquipment(
  operatorId: string,
  input: AddEquipmentInput
): Promise<{ ok: true; equipment: Equipment } | { ok: false; error: string }> {
  const { count } = await db()
    .from("equipment")
    .select("*", { count: "exact", head: true })
    .eq("operator_id", operatorId);

  if ((count ?? 0) >= MAX_EQUIPMENT_PER_OPERATOR) {
    return {
      ok: false,
      error: `Limite de ${MAX_EQUIPMENT_PER_OPERATOR} equipamentos atingido.`,
    };
  }

  const id = generateId("eq");
  const { data, error } = await db()
    .from("equipment")
    .insert({
      id,
      operator_id: operatorId,
      photo: input.photo,
      name: input.name,
      brand: input.brand,
      description: input.description,
    })
    .select("*")
    .maybeSingle<EquipmentRow>();

  if (error || !data) {
    return { ok: false, error: "Não foi possível adicionar o equipamento. Tente novamente." };
  }
  await touchOperator(operatorId);
  return { ok: true, equipment: rowToEquipment(data) };
}

export async function removeEquipment(operatorId: string, equipmentId: string): Promise<void> {
  await db().from("equipment").delete().eq("id", equipmentId).eq("operator_id", operatorId);
  await touchOperator(operatorId);
}

// --- Public "Operadores" page queries -------------------------------------
// Everything below only ever exposes operators with isPublic === true. None
// of it should be used from the team portal (which shows a team's own
// operators regardless of visibility via getOperators()).

/** All operators across all teams that have opted in to being shown publicly. */
export async function getPublicOperators(): Promise<Operator[]> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("is_public", true)
    .returns<OperatorRow[]>();

  if (error || !data) return [];
  return data.map(rowToOperator);
}

/** The `limit` most recently updated public operators, newest first. */
export async function getRecentPublicOperators(limit: number): Promise<Operator[]> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(limit)
    .returns<OperatorRow[]>();

  if (error || !data) return [];
  return data.map(rowToOperator);
}

/** Teams that have at least one public operator, with their public operator count. */
export async function getTeamsWithPublicOperators(): Promise<
  { teamId: string; publicCount: number }[]
> {
  const publicOperators = await getPublicOperators();
  const counts = new Map<string, number>();
  for (const operator of publicOperators) {
    counts.set(operator.teamId, (counts.get(operator.teamId) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([teamId, publicCount]) => ({ teamId, publicCount }));
}

/** Public operators belonging to one team (e.g. for the per-team public roster page). */
export async function getPublicOperatorsForTeam(teamId: string): Promise<Operator[]> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("team_id", teamId)
    .eq("is_public", true)
    .returns<OperatorRow[]>();

  if (error || !data) return [];
  return data.map(rowToOperator);
}
