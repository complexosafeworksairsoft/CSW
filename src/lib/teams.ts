// Server-only module: only ever imported from Server Components / Server
// Actions (it handles plaintext passwords, so it must never reach the
// client bundle). Not marked with the `server-only` package because that
// package isn't installed and this project avoids adding dependencies where
// avoidable — the import graph below (supabase.ts, next/headers users)
// already keeps it out of client bundles.
//
// Backed by Supabase (see supabase/schema.sql for the `teams` table) —
// replaced the earlier in-memory array, which reset on every server restart
// and was inconsistent across Vercel's serverless instances.
//
// TODO (production): passwords are still stored/compared as plaintext.
// Before onboarding real teams, hash them (bcrypt/argon2) instead.

import { supabase } from "./supabase";

export type Team = {
  id: string;
  teamCode: string;
  password: string;
  teamName: string;
};

type TeamRow = {
  id: string;
  team_code: string;
  password: string;
  team_name: string;
};

function rowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    teamCode: row.team_code,
    password: row.password,
    teamName: row.team_name,
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function findTeamByCredentials(
  teamCode: string,
  password: string
): Promise<Team | null> {
  const normalized = teamCode.trim().toUpperCase();
  const { data, error } = await supabase()
    .from("teams")
    .select("*")
    .eq("team_code", normalized)
    .maybeSingle<TeamRow>();

  if (error || !data || data.password !== password) return null;
  return rowToTeam(data);
}

export async function findTeamById(id: string): Promise<Team | null> {
  if (!id) return null;
  const { data, error } = await supabase()
    .from("teams")
    .select("*")
    .eq("id", id)
    .maybeSingle<TeamRow>();

  if (error || !data) return null;
  return rowToTeam(data);
}

/** Looks up a team by its login code (case-insensitive) — the public-facing identifier used in /operadores/equipe/[teamCode] URLs. */
export async function findTeamByCode(teamCode: string): Promise<Team | null> {
  const normalized = teamCode.trim().toUpperCase();
  const { data, error } = await supabase()
    .from("teams")
    .select("*")
    .eq("team_code", normalized)
    .maybeSingle<TeamRow>();

  if (error || !data) return null;
  return rowToTeam(data);
}

export async function getAllTeams(): Promise<Team[]> {
  const { data, error } = await supabase()
    .from("teams")
    .select("*")
    .order("team_name", { ascending: true })
    .returns<TeamRow[]>();

  if (error || !data) return [];
  return data.map(rowToTeam);
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
export async function createTeam(
  input: CreateTeamInput
): Promise<{ ok: true; team: Team } | { ok: false; error: string }> {
  const teamCode = input.teamCode.trim().toUpperCase();
  const password = input.password.trim();
  const teamName = input.teamName.trim();

  if (!teamCode || !password || !teamName) {
    return { ok: false, error: "Preencha nome, código e senha da equipe." };
  }

  const { data: dup } = await supabase()
    .from("teams")
    .select("id")
    .eq("team_code", teamCode)
    .maybeSingle();
  if (dup) {
    return { ok: false, error: "Já existe uma equipe com esse código." };
  }

  const team: Team = { id: generateId("t"), teamCode, password, teamName };
  const { error } = await supabase().from("teams").insert({
    id: team.id,
    team_code: team.teamCode,
    password: team.password,
    team_name: team.teamName,
  });

  if (error) {
    return { ok: false, error: "Não foi possível criar a equipe. Tente novamente." };
  }
  return { ok: true, team };
}

/**
 * Lets a team rename itself (called from the team's own session-gated
 * Ficha da Equipe, not the admin area) — unlike createTeam/removeTeam this
 * is self-service, scoped to the team's own id, and only ever touches
 * `teamName` (never the login code or password).
 */
export async function updateTeamName(
  teamId: string,
  teamName: string
): Promise<{ ok: true; team: Team } | { ok: false; error: string }> {
  const trimmed = teamName.trim();
  if (!trimmed) {
    return { ok: false, error: "Informe o nome da equipe." };
  }

  const { data, error } = await supabase()
    .from("teams")
    .update({ team_name: trimmed.slice(0, 120) })
    .eq("id", teamId)
    .select("*")
    .maybeSingle<TeamRow>();

  if (error || !data) {
    return { ok: false, error: "Equipe não encontrada." };
  }
  return { ok: true, team: rowToTeam(data) };
}

/**
 * Removes a team login by id. Cascades in the database (see
 * `references teams(id) on delete cascade` in supabase/schema.sql) to that
 * team's profile, operators, equipment, and agenda confirmations — unlike
 * the old in-memory version, this one DOES clean up related data.
 */
export async function removeTeam(teamId: string): Promise<void> {
  await supabase().from("teams").delete().eq("id", teamId);
}
