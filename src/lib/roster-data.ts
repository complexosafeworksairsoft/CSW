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
import type { Fit } from "./image-processing";

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
  photoFit: Fit; // enquadramento escolhido no upload, see src/lib/image-processing.ts
  foundedDate: string | null; // "AAAA-MM-DD"
  eventsOrg: string; // "Organização de Eventos" — free text
};

export type Operator = {
  id: string;
  teamId: string | null; // null: aprovado como operador mas ainda sem equipe
  userId: string | null; // null: cadastrado à mão pela equipe, sem conta vinculada
  photo: string | null;
  photoFit: Fit;
  name: string;
  tag: string;
  startMonth: string; // "AAAA-MM"
  category: string;
  isPublic: boolean; // shows on the public /operadores page when true
  score: number; // 0-1000 graduação — admin-set for now, see MAX_SCORE
  updatedAt: number; // epoch ms — see touchOperator() for what bumps this
};

export const MAX_SCORE = 1000;

export type Equipment = {
  id: string;
  operatorId: string;
  photo: string | null;
  photoFit: Fit;
  name: string;
  brand: string;
  description: string; // hard max 200 chars, enforced in roster-actions.ts too
  // Especificações técnicas (ver src/lib/equipment-catalog.ts) — tudo
  // opcional, só se aplica de fato a réplicas.
  weaponClass: string | null;
  propulsion: string | null;
  optics: string[];
  scopes: string[];
  lightsLasers: string[];
  muzzleDevices: string[];
  stocks: string[];
  gearRatio: string | null;
  motorType: string | null;
  shaftSize: string | null;
  battery: string | null;
  bbWeight: string | null;
};

type TeamProfileRow = {
  team_id: string;
  photo: string | null;
  photo_fit: Fit;
  founded_date: string | null;
  events_org: string;
};

type OperatorRow = {
  id: string;
  team_id: string | null;
  user_id: string | null;
  photo: string | null;
  photo_fit: Fit;
  name: string;
  tag: string;
  start_month: string;
  category: string;
  is_public: boolean;
  score: number;
  updated_at: string;
};

type EquipmentRow = {
  id: string;
  operator_id: string;
  photo: string | null;
  photo_fit: Fit;
  name: string;
  brand: string;
  description: string;
  weapon_class: string | null;
  propulsion: string | null;
  optics: string[];
  scopes: string[];
  lights_lasers: string[];
  muzzle_devices: string[];
  stocks: string[];
  gear_ratio: string | null;
  motor_type: string | null;
  shaft_size: string | null;
  battery: string | null;
  bb_weight: string | null;
};

function rowToTeamProfile(row: TeamProfileRow): TeamProfile {
  return {
    teamId: row.team_id,
    photo: row.photo,
    photoFit: row.photo_fit,
    foundedDate: row.founded_date,
    eventsOrg: row.events_org,
  };
}

function rowToOperator(row: OperatorRow): Operator {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    photo: row.photo,
    photoFit: row.photo_fit,
    name: row.name,
    tag: row.tag,
    startMonth: row.start_month,
    category: row.category,
    isPublic: row.is_public,
    score: row.score,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function rowToEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    operatorId: row.operator_id,
    photo: row.photo,
    photoFit: row.photo_fit,
    name: row.name,
    brand: row.brand,
    description: row.description,
    weaponClass: row.weapon_class,
    propulsion: row.propulsion,
    optics: row.optics ?? [],
    scopes: row.scopes ?? [],
    lightsLasers: row.lights_lasers ?? [],
    muzzleDevices: row.muzzle_devices ?? [],
    stocks: row.stocks ?? [],
    gearRatio: row.gear_ratio,
    motorType: row.motor_type,
    shaftSize: row.shaft_size,
    battery: row.battery,
    bbWeight: row.bb_weight,
  };
}

let nextIdCounter = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(nextIdCounter++).toString(36)}`;
}

function defaultProfile(teamId: string): TeamProfile {
  return { teamId, photo: null, photoFit: "cover", foundedDate: null, eventsOrg: "" };
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
  updates: Partial<Pick<TeamProfile, "photo" | "photoFit" | "foundedDate" | "eventsOrg">>
): Promise<TeamProfile> {
  const current = await getTeamProfile(teamId);
  const next: TeamProfile = {
    teamId,
    photo: updates.photo !== undefined ? updates.photo : current.photo,
    photoFit: updates.photoFit !== undefined ? updates.photoFit : current.photoFit,
    foundedDate: updates.foundedDate !== undefined ? updates.foundedDate : current.foundedDate,
    eventsOrg: updates.eventsOrg !== undefined ? updates.eventsOrg : current.eventsOrg,
  };

  const { data, error } = await db()
    .from("team_profiles")
    .upsert(
      {
        team_id: next.teamId,
        photo: next.photo,
        photo_fit: next.photoFit,
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

/** Every operator across every team (and team-less ones) — the admin's "Graduação" list. */
export async function getAllOperators(): Promise<Operator[]> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .order("name", { ascending: true })
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

/**
 * Creates the operator record for a newly-approved account (see
 * src/app/equipes/admin/account-actions.ts) — team_id starts null, since
 * approving an account and joining a team are separate steps (see
 * src/lib/membership.ts's approveRequest, which sets team_id on this same
 * row later rather than creating a second one).
 */
export async function createOperatorForApprovedUser(
  userId: string,
  name: string,
  tag: string
): Promise<Operator | null> {
  const id = generateId("op");
  const nowIso = new Date().toISOString();
  const { data, error } = await db()
    .from("operators")
    .insert({
      id,
      team_id: null,
      user_id: userId,
      photo: null,
      photo_fit: "cover",
      name: name.slice(0, 120),
      tag: tag.slice(0, 40),
      start_month: "",
      category: "",
      is_public: false,
      score: 0,
      updated_at: nowIso,
    })
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) return null;
  return rowToOperator(data);
}

/** Looks up an operator by id with no team scoping — for the public per-operator page (src/app/operadores/[operatorId]/page.tsx), which doesn't know the team code up front. Callers must check `isPublic` themselves before showing anything. */
export async function getOperatorById(operatorId: string): Promise<Operator | null> {
  const { data, error } = await db()
    .from("operators")
    .select("*")
    .eq("id", operatorId)
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

/**
 * Moves an existing operator (one that already has an account but no team —
 * see createOperatorForApprovedUser) into a team, called from
 * src/lib/membership.ts's approveRequest. This is the ONLY way an operator
 * joins a team's roster — teams can no longer add an operator by hand
 * (removed along with AddOperatorForm.tsx): every operator has to come from
 * someone registering their own account and being approved into a team.
 */
export async function assignOperatorToTeam(
  operatorId: string,
  teamId: string,
  name?: string
): Promise<{ ok: true; operator: Operator } | { ok: false; error: string }> {
  const { count } = await db()
    .from("operators")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if ((count ?? 0) >= MAX_OPERATORS_PER_TEAM) {
    return { ok: false, error: `Limite de ${MAX_OPERATORS_PER_TEAM} operadores atingido.` };
  }

  const { data, error } = await db()
    .from("operators")
    .update({
      team_id: teamId,
      ...(name ? { name: name.slice(0, 120) } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", operatorId)
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) {
    return { ok: false, error: "Não foi possível vincular o operador à equipe." };
  }
  return { ok: true, operator: rowToOperator(data) };
}

export type UpdateOperatorInput = {
  photo?: string | null;
  photoFit?: Fit; // only written when `photo` is also present — see below
  name: string;
  tag: string;
  startMonth: string;
  category: string;
};

/**
 * Updates an existing operator's own fields (scoped to the team — a team
 * can never edit another team's operator). `photo`/`photoFit` are only
 * overwritten when `photo` is explicitly present in the input (a new
 * upload); omit it to keep the operator's current photo, same convention as
 * updateTeamProfile().
 */
export async function updateOperator(
  teamId: string,
  operatorId: string,
  input: UpdateOperatorInput
): Promise<{ ok: true; operator: Operator } | { ok: false; error: string }> {
  const { data, error } = await db()
    .from("operators")
    .update({
      ...(input.photo !== undefined
        ? { photo: input.photo, photo_fit: input.photoFit ?? "cover" }
        : {}),
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

/** Admin-only: sets an operator's graduação (0-1000). Not team-scoped — this is the site admin's call, not the team's. Clamped defensively even though the DB column already has a check constraint. */
export async function setOperatorScore(operatorId: string, score: number): Promise<Operator | null> {
  const clamped = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));
  const { data, error } = await db()
    .from("operators")
    .update({ score: clamped })
    .eq("id", operatorId)
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) return null;
  return rowToOperator(data);
}

/**
 * Lets the account owner set their own operator photo from /conta —
 * intentionally not team-scoped (unlike updateOperator, which is what the
 * team's own Ficha da Equipe uses): the caller already resolved this
 * operatorId via getOperatorByUserId(userId), so it's already scoped to
 * "your own operator" by construction.
 */
export async function updateOperatorPhoto(
  operatorId: string,
  photo: string,
  photoFit: Fit
): Promise<Operator | null> {
  const { data, error } = await db()
    .from("operators")
    .update({ photo, photo_fit: photoFit, updated_at: new Date().toISOString() })
    .eq("id", operatorId)
    .select("*")
    .maybeSingle<OperatorRow>();

  if (error || !data) return null;
  return rowToOperator(data);
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
  photoFit?: Fit;
  name: string;
  brand: string;
  description: string;
  weaponClass?: string | null;
  propulsion?: string | null;
  optics?: string[];
  scopes?: string[];
  lightsLasers?: string[];
  muzzleDevices?: string[];
  stocks?: string[];
  gearRatio?: string | null;
  motorType?: string | null;
  shaftSize?: string | null;
  battery?: string | null;
  bbWeight?: string | null;
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
      photo_fit: input.photoFit ?? "cover",
      name: input.name,
      brand: input.brand,
      description: input.description,
      weapon_class: input.weaponClass ?? null,
      propulsion: input.propulsion ?? null,
      optics: input.optics ?? [],
      scopes: input.scopes ?? [],
      lights_lasers: input.lightsLasers ?? [],
      muzzle_devices: input.muzzleDevices ?? [],
      stocks: input.stocks ?? [],
      gear_ratio: input.gearRatio ?? null,
      motor_type: input.motorType ?? null,
      shaft_size: input.shaftSize ?? null,
      battery: input.battery ?? null,
      bb_weight: input.bbWeight ?? null,
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
    if (!operator.teamId) continue; // público mas ainda sem equipe — não entra em nenhuma contagem de equipe
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
