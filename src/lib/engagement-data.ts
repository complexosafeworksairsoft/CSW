// Prototype data store for public reactions + comments on operador profile
// photos (see /operadores and /operadores/equipe/[teamCode]). Same
// prototype-grade pattern as roster-data.ts: module-level state mutated
// directly from Server Actions.
//
// TODO (production): replace this module-level state with real tables
// (Supabase, per the project brief). This mock:
//   - is NOT persisted and resets whenever the server restarts
//   - is NOT safe for multiple server instances
//   - is UNAUTHENTICATED, PUBLIC write access — anyone who can load the
//     /operadores pages can call reactAction/addCommentAction with no
//     rate limiting, no CAPTCHA, and no per-visitor identity to dedup
//     against. Before this reaches production it needs real abuse/spam
//     mitigation (rate limiting per IP, a CAPTCHA/challenge, moderation
//     tooling to remove comments, etc.) — none of that is attempted here.

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

const REACTION_COUNTS = new Map<string, ReactionCounts>();

/** Increments one reaction count for an operator. No per-visitor dedup — see TODO above. */
export function addReaction(operatorId: string, kind: ReactionKind): void {
  const counts = REACTION_COUNTS.get(operatorId) ?? emptyCounts();
  counts[kind] += 1;
  REACTION_COUNTS.set(operatorId, counts);
}

/** Returns an operator's reaction counts, defaulting to all-zero if none yet. */
export function getReactionCounts(operatorId: string): ReactionCounts {
  return REACTION_COUNTS.get(operatorId) ?? emptyCounts();
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

const COMMENTS: Comment[] = [];

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
export function addComment(
  operatorId: string,
  text: string,
  authorName: string | null
): Comment {
  const comment: Comment = {
    id: generateId("cm"),
    operatorId,
    text: text.slice(0, COMMENT_TEXT_MAX),
    authorName,
    createdAt: Date.now(),
  };
  COMMENTS.push(comment);
  return comment;
}

/** An operator's comments, newest first. */
export function getComments(operatorId: string): Comment[] {
  return COMMENTS.filter((c) => c.operatorId === operatorId)
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);
}
