// Server-only module: only ever imported from Server Components / Server
// Actions (it uses plaintext passwords, so it must never reach the client
// bundle). Not marked with the `server-only` package because that package
// isn't installed and this prototype avoids adding new dependencies — the
// import graph below (next/headers, node:crypto users) already keeps it
// out of client bundles.
//
// `TEAMS` starts seeded with 3 demo entries but is admin-mutable at runtime
// via createTeam()/removeTeam() below, called from
// src/app/equipes/admin/team-actions.ts — only the site owner (gated by the
// separate admin session, not a team's own session) can create or remove a
// team access from /equipes/admin. Like roster-data.ts/agenda-data.ts, this
// is a module-level array: NOT persisted, resets on server restart, and not
// safe across multiple server instances.
//
// Known prototype limitation: removeTeam() only removes the login entry
// here. It does NOT cascade-delete that team's data in roster-data.ts
// (TeamProfile/Operators/Equipment) or agenda-data.ts (agenda
// confirmations) — that data is left behind, orphaned under a teamId that
// no longer has a login. Cascading the delete is out of scope for now; a
// production version would need to decide (and probably ask the admin)
// whether removing a team's access should also wipe its roster/agenda data.
//
// TODO (production): this in-memory list is a PROTOTYPE ONLY stand-in for a
// real database. Before onboarding real teams, replace it with a proper
// table (the project brief points at Supabase) and hashed passwords
// (bcrypt/argon2 — never store or compare plaintext). Team accounts should
// still be created manually by the Complexo's admin, not via public
// self-signup, per the product decision behind this feature.

export type Team = {
  id: string;
  teamCode: string;
  password: string;
  teamName: string;
};

export const TEAMS: Team[] = [
  {
    id: "t-csa",
    teamCode: "CSA",
    password: "CSA2017*",
    teamName: "Comando Sertão Airsoft",
  },
  {
    id: "t-dec",
    teamCode: "DEC",
    password: "DEC2020*",
    teamName: "Divisão Especial de Combate",
  },
  {
    id: "t-cans",
    teamCode: "CANS",
    password: "CANS2019",
    teamName: "Esquadrão Scorpio",
  },
];

let nextIdCounter = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(nextIdCounter++).toString(36)}`;
}

export function findTeamByCredentials(
  teamCode: string,
  password: string
): Team | null {
  const normalized = teamCode.trim().toUpperCase();
  const team = TEAMS.find((t) => t.teamCode === normalized);
  if (!team || team.password !== password) return null;
  return team;
}

export function findTeamById(id: string): Team | null {
  return TEAMS.find((t) => t.id === id) ?? null;
}

export type CreateTeamInput = {
  teamCode: string;
  password: string;
  teamName: string;
};

/**
 * Creates a new team login, called only from the admin-gated
 * createTeamAction (src/app/equipes/admin/team-actions.ts). `teamCode` is
 * normalized the same way findTeamByCredentials() normalizes a login
 * attempt (trimmed, uppercased) so the two stay consistent, and duplicate
 * codes are rejected case-insensitively.
 */
export function createTeam(
  input: CreateTeamInput
): { ok: true; team: Team } | { ok: false; error: string } {
  const teamCode = input.teamCode.trim().toUpperCase();
  const password = input.password.trim();
  const teamName = input.teamName.trim();

  if (!teamCode || !password || !teamName) {
    return { ok: false, error: "Preencha nome, código e senha da equipe." };
  }

  if (TEAMS.some((t) => t.teamCode === teamCode)) {
    return { ok: false, error: "Já existe uma equipe com esse código." };
  }

  const team: Team = {
    id: generateId("t"),
    teamCode,
    password,
    teamName,
  };
  TEAMS.push(team);
  return { ok: true, team };
}

/**
 * Removes a team login by id. Does NOT cascade to that team's roster or
 * agenda data — see the module header comment above.
 */
export function removeTeam(teamId: string): void {
  const idx = TEAMS.findIndex((t) => t.id === teamId);
  if (idx === -1) return;
  TEAMS.splice(idx, 1);
}
