// Server-only module: only ever imported from Server Components / Server
// Actions (it uses plaintext passwords, so it must never reach the client
// bundle). Not marked with the `server-only` package because that package
// isn't installed and this prototype avoids adding new dependencies — the
// import graph below (next/headers, node:crypto users) already keeps it
// out of client bundles.
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
