// Server-only module for the team portal agenda.
//
// Backed by Supabase (see supabase/schema.sql for the `matches` and
// `match_confirmations` tables) — replaced the earlier in-memory array,
// which reset on every server restart and was inconsistent across Vercel's
// serverless instances.

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

type MatchRow = {
  id: string;
  date: string;
  time: string;
  title: string;
  operation_type: string;
  location: string;
  notes: string | null;
};

type MatchConfirmationRow = {
  match_id: string;
  team_id: string;
};

function rowToMatch(row: MatchRow, confirmedTeamIds: string[]): MatchEvent {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    title: row.title,
    operationType: row.operation_type,
    location: row.location,
    notes: row.notes ?? undefined,
    confirmedTeamIds,
  };
}

/** All matches on the agenda, each with its confirmed team ids, sorted by date ascending. */
export async function getMatches(): Promise<MatchEvent[]> {
  const [{ data: matches, error: matchesError }, { data: confirmations, error: confirmationsError }] =
    await Promise.all([
      db()
        .from("matches")
        .select("*")
        .order("date", { ascending: true })
        .returns<MatchRow[]>(),
      db().from("match_confirmations").select("match_id, team_id").returns<MatchConfirmationRow[]>(),
    ]);

  if (matchesError || !matches) return [];

  const confirmedByMatch = new Map<string, string[]>();
  if (!confirmationsError && confirmations) {
    for (const row of confirmations) {
      const list = confirmedByMatch.get(row.match_id);
      if (list) {
        list.push(row.team_id);
      } else {
        confirmedByMatch.set(row.match_id, [row.team_id]);
      }
    }
  }

  return matches.map((row) => rowToMatch(row, confirmedByMatch.get(row.id) ?? []));
}

export async function isTeamConfirmed(matchId: string, teamId: string): Promise<boolean> {
  const { data } = await db()
    .from("match_confirmations")
    .select("match_id")
    .eq("match_id", matchId)
    .eq("team_id", teamId)
    .maybeSingle();

  return !!data;
}

/** Toggles the given team's confirmation for a match. Returns the new state, or null if the match doesn't exist. */
export async function toggleConfirmation(matchId: string, teamId: string): Promise<boolean | null> {
  const { data: match } = await db()
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .maybeSingle();
  if (!match) return null;

  const alreadyConfirmed = await isTeamConfirmed(matchId, teamId);
  if (alreadyConfirmed) {
    await db()
      .from("match_confirmations")
      .delete()
      .eq("match_id", matchId)
      .eq("team_id", teamId);
    return false;
  }

  await db().from("match_confirmations").insert({ match_id: matchId, team_id: teamId });
  return true;
}
