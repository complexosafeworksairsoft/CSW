// Server-only module for exclusive team-portal content (briefings and
// internal announcements).
//
// Backed by Supabase (see supabase/schema.sql for the `content_items`
// table) — replaced the earlier in-memory array, which reset on every
// server restart and was inconsistent across Vercel's serverless instances.
// This also means the Complexo's admin can now publish new briefings and
// comunicados by inserting rows directly, without a code change (no admin
// UI for it yet — out of scope here).

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

export type ContentItem = {
  id: string;
  date: string; // "AAAA-MM-DD"
  kind: "briefing" | "comunicado";
  title: string;
  body: string;
};

type ContentItemRow = {
  id: string;
  date: string;
  kind: "briefing" | "comunicado";
  title: string;
  body: string;
};

function rowToContentItem(row: ContentItemRow): ContentItem {
  return {
    id: row.id,
    date: row.date,
    kind: row.kind,
    title: row.title,
    body: row.body,
  };
}

export async function getContentSorted(): Promise<ContentItem[]> {
  const { data, error } = await db()
    .from("content_items")
    .select("*")
    .order("date", { ascending: false })
    .returns<ContentItemRow[]>();

  if (error || !data) return [];
  return data.map(rowToContentItem);
}
