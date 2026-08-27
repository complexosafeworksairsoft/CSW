// Prototype data store for the team portal agenda.
//
// TODO (production): replace this module-level array with real queries
// against a database (Supabase, per the project brief). This mock version
// mutates an in-memory array directly from a Server Action, which is only
// acceptable for a prototype — it is NOT persisted and resets whenever the
// server restarts, and it is NOT safe for multiple server instances.

export type MatchEvent = {
  id: string;
  date: string; // "AAAA-MM-DD"
  time: string; // "HH:mm"
  title: string;
  operationType: string;
  location: string;
  notes?: string;
  confirmedTeamIds: string[];
};

export const MATCHES: MatchEvent[] = [
  {
    id: "op-2026-09-06",
    date: "2026-09-06",
    time: "08:00",
    title: "Operação Linha Seca",
    operationType: "CQB — Cerco e resgate",
    location: "Setor 2, Complexo Safe Works",
    notes: "Chegada 30min antes para briefing e checagem de equipamento.",
    confirmedTeamIds: ["t-condor"],
  },
  {
    id: "op-2026-09-20",
    date: "2026-09-20",
    time: "14:00",
    title: "Operação Vento Norte",
    operationType: "Campo aberto — Domínio de bandeira",
    location: "Setor 1 (Trilha Norte), Complexo Safe Works",
    confirmedTeamIds: [],
  },
  {
    id: "op-2026-10-04",
    date: "2026-10-04",
    time: "08:00",
    title: "Operação Poeira Vermelha",
    operationType: "Milsim — 6 horas",
    location: "Setores 1, 2 e 3, Complexo Safe Works",
    notes: "Evento longo. Levar hidratação extra e réplica secundária, se houver.",
    confirmedTeamIds: ["t-lobos", "t-scorpio"],
  },
  {
    id: "op-2026-10-18",
    date: "2026-10-18",
    time: "19:00",
    title: "Operação Noturna Coruja",
    operationType: "Noturno — Infiltração",
    location: "Setor 2, Complexo Safe Works",
    notes: "Uso de iluminação tática obrigatório. Regras específicas no briefing.",
    confirmedTeamIds: [],
  },
];

export function isTeamConfirmed(matchId: string, teamId: string): boolean {
  const match = MATCHES.find((m) => m.id === matchId);
  return match ? match.confirmedTeamIds.includes(teamId) : false;
}

/** Toggles the given team's confirmation for a match. Returns the new state, or null if the match doesn't exist. */
export function toggleConfirmation(matchId: string, teamId: string): boolean | null {
  const match = MATCHES.find((m) => m.id === matchId);
  if (!match) return null;

  const idx = match.confirmedTeamIds.indexOf(teamId);
  if (idx >= 0) {
    match.confirmedTeamIds.splice(idx, 1);
    return false;
  }
  match.confirmedTeamIds.push(teamId);
  return true;
}
