// Prototype data store for the "Ficha da Equipe" roster: one team profile,
// its operadores (members, max 15 per team) and each operador's
// equipamentos (max 3 per operador). Same prototype-grade pattern as
// agenda-data.ts / conteudo-data.ts: module-level arrays mutated directly
// from Server Actions.
//
// TODO (production): replace this module-level state with real tables
// (Supabase, per the project brief). This mock:
//   - is NOT persisted and resets whenever the server restarts
//   - is NOT safe for multiple server instances
//   - stores photos as base64 data URIs in memory (see the TODO in
//     src/lib/photo-upload.ts) instead of URLs pointing at real object
//     storage — that alone is reason enough to not use this in production,
//     since a handful of photos can bloat server memory significantly

export const MAX_OPERATORS_PER_TEAM = 15;
export const MAX_EQUIPMENT_PER_OPERATOR = 3;

export type TeamProfile = {
  teamId: string;
  photo: string | null; // base64 data URI — prototype only, see TODO above
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
};

export type Equipment = {
  id: string;
  operatorId: string;
  photo: string | null;
  name: string;
  brand: string;
  description: string; // hard max 200 chars, enforced in roster-actions.ts too
};

const TEAM_PROFILES: TeamProfile[] = [];
const OPERATORS: Operator[] = [];
const EQUIPMENT: Equipment[] = [];

let nextIdCounter = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(nextIdCounter++).toString(36)}`;
}

/** Returns the team's profile, creating an empty one on first access. */
export function getTeamProfile(teamId: string): TeamProfile {
  let profile = TEAM_PROFILES.find((p) => p.teamId === teamId);
  if (!profile) {
    profile = { teamId, photo: null, foundedDate: null, eventsOrg: "" };
    TEAM_PROFILES.push(profile);
  }
  return profile;
}

export function updateTeamProfile(
  teamId: string,
  updates: Partial<Pick<TeamProfile, "photo" | "foundedDate" | "eventsOrg">>
): TeamProfile {
  const profile = getTeamProfile(teamId);
  if (updates.photo !== undefined) profile.photo = updates.photo;
  if (updates.foundedDate !== undefined) profile.foundedDate = updates.foundedDate;
  if (updates.eventsOrg !== undefined) profile.eventsOrg = updates.eventsOrg;
  return profile;
}

export function getOperators(teamId: string): Operator[] {
  return OPERATORS.filter((o) => o.teamId === teamId);
}

/** Looks up an operator, scoped to the given team so one team can never touch another's roster. */
export function getOperatorForTeam(teamId: string, operatorId: string): Operator | null {
  return OPERATORS.find((o) => o.id === operatorId && o.teamId === teamId) ?? null;
}

export type AddOperatorInput = {
  photo: string | null;
  name: string;
  tag: string;
  startMonth: string;
  category: string;
};

export function addOperator(
  teamId: string,
  input: AddOperatorInput
): { ok: true; operator: Operator } | { ok: false; error: string } {
  if (getOperators(teamId).length >= MAX_OPERATORS_PER_TEAM) {
    return {
      ok: false,
      error: `Limite de ${MAX_OPERATORS_PER_TEAM} operadores atingido.`,
    };
  }
  const operator: Operator = { id: generateId("op"), teamId, ...input };
  OPERATORS.push(operator);
  return { ok: true, operator };
}

/** Removes an operator (scoped to the team) and cascades to their equipamentos. */
export function removeOperator(teamId: string, operatorId: string): void {
  const idx = OPERATORS.findIndex((o) => o.id === operatorId && o.teamId === teamId);
  if (idx === -1) return;
  OPERATORS.splice(idx, 1);
  for (let i = EQUIPMENT.length - 1; i >= 0; i--) {
    if (EQUIPMENT[i].operatorId === operatorId) EQUIPMENT.splice(i, 1);
  }
}

export function getEquipment(operatorId: string): Equipment[] {
  return EQUIPMENT.filter((e) => e.operatorId === operatorId);
}

export type AddEquipmentInput = {
  photo: string | null;
  name: string;
  brand: string;
  description: string;
};

export function addEquipment(
  operatorId: string,
  input: AddEquipmentInput
): { ok: true; equipment: Equipment } | { ok: false; error: string } {
  if (getEquipment(operatorId).length >= MAX_EQUIPMENT_PER_OPERATOR) {
    return {
      ok: false,
      error: `Limite de ${MAX_EQUIPMENT_PER_OPERATOR} equipamentos atingido.`,
    };
  }
  const equipment: Equipment = { id: generateId("eq"), operatorId, ...input };
  EQUIPMENT.push(equipment);
  return { ok: true, equipment };
}

export function removeEquipment(operatorId: string, equipmentId: string): void {
  const idx = EQUIPMENT.findIndex((e) => e.id === equipmentId && e.operatorId === operatorId);
  if (idx === -1) return;
  EQUIPMENT.splice(idx, 1);
}
