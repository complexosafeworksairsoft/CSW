// Server-only: a read-only activity feed derived entirely from existing
// tables (no feed storage of its own) — new team members, new equipment on
// PUBLIC operators only (a private operator's gear isn't announced site-
// wide), and newly published operations. Exclusive team content
// (briefings/comunicados) is deliberately excluded: those are meant to stay
// team-only, so they don't get surfaced on this public feed even as a title.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Fit } from "./image-processing";

function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

export type FeedItem = {
  id: string;
  title: string;
  subtitle: string;
  photo: string | null;
  photoFit: Fit;
  date: number; // epoch ms
  href: string | null;
};

type MembershipRow = { id: string; user_id: string; team_id: string; reviewed_at: string };
type UserRow = { id: string; display_name: string };
type TeamRow = { id: string; team_name: string; team_code: string };

async function getJoinItems(limit: number): Promise<FeedItem[]> {
  const { data } = await db()
    .from("team_membership_requests")
    .select("id, user_id, team_id, reviewed_at")
    .eq("status", "approved")
    .not("reviewed_at", "is", null)
    .order("reviewed_at", { ascending: false })
    .limit(limit)
    .returns<MembershipRow[]>();
  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((r) => r.user_id))];
  const teamIds = [...new Set(data.map((r) => r.team_id))];
  const [{ data: users }, { data: teams }] = await Promise.all([
    db().from("users").select("id, display_name").in("id", userIds).returns<UserRow[]>(),
    db().from("teams").select("id, team_name, team_code").in("id", teamIds).returns<TeamRow[]>(),
  ]);
  const userNameById = new Map((users ?? []).map((u) => [u.id, u.display_name]));
  const teamById = new Map((teams ?? []).map((t) => [t.id, t]));

  return data.map((r) => {
    const team = teamById.get(r.team_id);
    return {
      id: `join-${r.id}`,
      title: `${userNameById.get(r.user_id) ?? "Um novo operador"} agora participa da equipe ${team?.team_name ?? "?"}`,
      subtitle: "Nova entrada confirmada",
      photo: null,
      photoFit: "cover" as Fit,
      date: new Date(r.reviewed_at).getTime(),
      href: team ? `/operadores/equipe/${team.team_code}` : null,
    };
  });
}

type EquipmentRow = {
  id: string;
  operator_id: string;
  name: string;
  photo: string | null;
  photo_fit: Fit;
  created_at: string;
};
type OperatorRow = { id: string; name: string; is_public: boolean; team_id: string | null };

async function getEquipmentItems(limit: number): Promise<FeedItem[]> {
  // Over-fetch since a chunk gets filtered out (private operators), then trim back to `limit`.
  const { data: items } = await db()
    .from("equipment")
    .select("id, operator_id, name, photo, photo_fit, created_at")
    .order("created_at", { ascending: false })
    .limit(limit * 3)
    .returns<EquipmentRow[]>();
  if (!items || items.length === 0) return [];

  const operatorIds = [...new Set(items.map((i) => i.operator_id))];
  const { data: operators } = await db()
    .from("operators")
    .select("id, name, is_public, team_id")
    .in("id", operatorIds)
    .returns<OperatorRow[]>();
  const operatorById = new Map((operators ?? []).map((o) => [o.id, o]));

  const teamIds = [...new Set((operators ?? []).map((o) => o.team_id).filter((id): id is string => Boolean(id)))];
  const { data: teams } = await db().from("teams").select("id, team_name").in("id", teamIds).returns<
    { id: string; team_name: string }[]
  >();
  const teamNameById = new Map((teams ?? []).map((t) => [t.id, t.team_name]));

  const result: FeedItem[] = [];
  for (const item of items) {
    const operator = operatorById.get(item.operator_id);
    if (!operator || !operator.is_public) continue;
    const teamName = operator.team_id ? teamNameById.get(operator.team_id) : null;
    result.push({
      id: `equipment-${item.id}`,
      title: `${operator.name} atualizou o equipamento`,
      subtitle: teamName ? `${item.name} · ${teamName}` : item.name,
      photo: item.photo,
      photoFit: item.photo_fit,
      date: new Date(item.created_at).getTime(),
      href: `/operadores/${operator.id}`,
    });
    if (result.length >= limit) break;
  }
  return result;
}

type MatchRow = { id: string; title: string; date: string; operation_type: string; created_at: string };

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

async function getMatchItems(limit: number): Promise<FeedItem[]> {
  const { data } = await db()
    .from("matches")
    .select("id, title, date, operation_type, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<MatchRow[]>();
  if (!data) return [];

  return data.map((m) => ({
    id: `match-${m.id}`,
    title: `Novo evento cadastrado — ${m.title}`,
    subtitle: `${m.operation_type ? `${m.operation_type} · ` : ""}será dia ${formatShortDate(m.date)}`,
    photo: null,
    photoFit: "cover" as Fit,
    date: new Date(m.created_at).getTime(),
    href: "/central-do-airsoft#agenda",
  }));
}

/** Merges join/equipment/match activity into one reverse-chronological feed. */
export async function getRecentActivity(limit: number): Promise<FeedItem[]> {
  const [joins, equipmentItems, matchItems] = await Promise.all([
    getJoinItems(limit),
    getEquipmentItems(limit),
    getMatchItems(limit),
  ]);

  return [...joins, ...equipmentItems, ...matchItems].sort((a, b) => b.date - a.date).slice(0, limit);
}
