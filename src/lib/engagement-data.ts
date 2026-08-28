// Server-only module for public reactions + comments on operador profile
// photos (see /operadores and /operadores/equipe/[teamCode]).
//
// REACTION_KINDS / REACTION_EMOJI / isReactionKind below are static
// configuration (not data) and stay plain in-code constants. The actual
// counts and comments are backed by Supabase (see supabase/schema.sql for
// the `reactions` and `comments` tables) — replaced the earlier in-memory
// Map/array, which reset on every server restart and was inconsistent
// across Vercel's serverless instances.
//
// TODO (production): this is still UNAUTHENTICATED, PUBLIC write access —
// anyone who can load the /operadores pages can call reactAction/
// addCommentAction with no rate limiting, no CAPTCHA, and no per-visitor
// identity to dedup against. Before this reaches production it needs real
// abuse/spam mitigation (rate limiting per IP, a CAPTCHA/challenge,
// moderation tooling to remove comments, etc.) — none of that is attempted
// here. Also: addReaction() does a read-then-write increment (not a single
// atomic RPC), which is fine for this prototype-adjacent feature but can
// under-count on truly concurrent submissions.

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

export const REACTION_KINDS = ["like", "dislike", "bomb", "skull"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];

export const REACTION_EMOJI: Record<ReactionKind, string> = {
  like: "👍",
  dislike: "👎",
  bomb: "💣",
  skull: "💀",
};

export type ReactionCounts = Record<ReactionKind, number>;

function emptyCounts(): ReactionCounts {
  return { like: 0, dislike: 0, bomb: 0, skull: 0 };
}

export function isReactionKind(value: string): value is ReactionKind {
  return (REACTION_KINDS as readonly string[]).includes(value);
}

type ReactionRow = {
  operator_id: string;
  kind: ReactionKind;
  count: number;
};

/** Increments one reaction count for an operator. No per-visitor dedup — see TODO above. */
export async function addReaction(operatorId: string, kind: ReactionKind): Promise<void> {
  const { data: existing } = await db()
    .from("reactions")
    .select("count")
    .eq("operator_id", operatorId)
    .eq("kind", kind)
    .maybeSingle<{ count: number }>();

  await db()
    .from("reactions")
    .upsert(
      { operator_id: operatorId, kind, count: (existing?.count ?? 0) + 1 },
      { onConflict: "operator_id,kind" }
    );
}

/** Returns an operator's reaction counts, defaulting to all-zero if none yet. */
export async function getReactionCounts(operatorId: string): Promise<ReactionCounts> {
  const { data, error } = await db()
    .from("reactions")
    .select("*")
    .eq("operator_id", operatorId)
    .returns<ReactionRow[]>();

  const counts = emptyCounts();
  if (error || !data) return counts;
  for (const row of data) {
    counts[row.kind] = row.count;
  }
  return counts;
}

export type Comment = {
  id: string;
  operatorId: string;
  text: string; // hard max 100 chars, enforced in operadores/actions.ts too
  // null = anonymous (every visitor). Only ever set to "Allis" when the
  // submitter had a valid admin session at submit time — see
  // src/app/operadores/actions.ts / readAdminSession().
  authorName: string | null;
  createdAt: number;
};

type CommentRow = {
  id: string;
  operator_id: string;
  text: string;
  author_name: string | null;
  created_at: string;
};

function rowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    operatorId: row.operator_id,
    text: row.text,
    authorName: row.author_name,
    createdAt: new Date(row.created_at).getTime(),
  };
}

let nextIdCounter = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${(nextIdCounter++).toString(36)}`;
}

const COMMENT_TEXT_MAX = 100;

/**
 * Adds a comment. Callers (the Server Action) are responsible for
 * trimming/capping `text` to COMMENT_TEXT_MAX before calling this, but this
 * function still defensively re-slices as a last line of defense.
 */
export async function addComment(
  operatorId: string,
  text: string,
  authorName: string | null
): Promise<Comment> {
  const comment: Comment = {
    id: generateId("cm"),
    operatorId,
    text: text.slice(0, COMMENT_TEXT_MAX),
    authorName,
    createdAt: Date.now(),
  };

  await db().from("comments").insert({
    id: comment.id,
    operator_id: comment.operatorId,
    text: comment.text,
    author_name: comment.authorName,
    created_at: new Date(comment.createdAt).toISOString(),
  });

  return comment;
}

/** An operator's comments, newest first. */
export async function getComments(operatorId: string): Promise<Comment[]> {
  const { data, error } = await db()
    .from("comments")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .returns<CommentRow[]>();

  if (error || !data) return [];
  return data.map(rowToComment);
}
