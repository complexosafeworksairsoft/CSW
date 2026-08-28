"use client";

import { useSyncExternalStore } from "react";
import { reactAction } from "@/app/operadores/actions";
import {
  REACTION_EMOJI,
  REACTION_KINDS,
  type ReactionCounts,
  type ReactionKind,
} from "@/lib/engagement-data";

// Soft, per-browser "you already reacted with this one" nudge — read via
// useSyncExternalStore (not useEffect+setState) so hydration stays clean:
// React uses getServerSnapshot() during SSR/hydration and only switches to
// the real localStorage-backed snapshot after mount, with no manual effect
// needed. See rememberReactedKind() for how a submit updates this store.

function storageKey(operatorId: string): string {
  return `sw_reacted_${operatorId}`;
}

function readReactedKinds(operatorId: string): ReactionKind[] {
  try {
    const raw = window.localStorage.getItem(storageKey(operatorId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k): k is ReactionKind =>
      (REACTION_KINDS as readonly string[]).includes(k)
    );
  } catch {
    // Private browsing / blocked storage — reaction still submits via the
    // real form action, this store only drives the soft visual nudge.
    return [];
  }
}

const EMPTY_KINDS: ReactionKind[] = [];
// Cache keyed by operatorId so getSnapshot() returns a *stable* array
// reference between calls (required by useSyncExternalStore to avoid an
// infinite re-render loop) unless the value actually changed.
const snapshotCache = new Map<string, ReactionKind[]>();
const listeners = new Set<() => void>();

function getSnapshot(operatorId: string): ReactionKind[] {
  let cached = snapshotCache.get(operatorId);
  if (!cached) {
    cached = readReactedKinds(operatorId);
    snapshotCache.set(operatorId, cached);
  }
  return cached;
}

function getServerSnapshot(): ReactionKind[] {
  return EMPTY_KINDS;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function rememberReactedKind(operatorId: string, kind: ReactionKind): void {
  const current = getSnapshot(operatorId);
  if (current.includes(kind)) return;
  const next = [...current, kind];
  snapshotCache.set(operatorId, next);
  try {
    window.localStorage.setItem(storageKey(operatorId), JSON.stringify(next));
  } catch {
    // Private browsing / blocked storage — fine, this is a soft nudge only.
  }
  listeners.forEach((notify) => notify());
}

/**
 * 4 emoji-reaction buttons for an operador's profile photo, each a real
 * <form action={reactAction}> so the reaction works as a plain form submit
 * (no client JS required for the action itself). The only client-side
 * behavior is the soft, per-browser "you already reacted with this one"
 * visual nudge described above — not a hard block, since there's no
 * visitor identity to enforce a real limit against.
 */
export default function ReactionBar({
  operatorId,
  counts,
}: {
  operatorId: string;
  counts: ReactionCounts;
}) {
  const reacted = useSyncExternalStore(
    subscribe,
    () => getSnapshot(operatorId),
    getServerSnapshot
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTION_KINDS.map((kind) => {
        const isReacted = reacted.includes(kind);
        return (
          <form
            key={kind}
            action={reactAction}
            onSubmit={() => rememberReactedKind(operatorId, kind)}
          >
            <input type="hidden" name="operatorId" value={operatorId} />
            <input type="hidden" name="kind" value={kind} />
            <button
              type="submit"
              aria-label={kind}
              aria-pressed={isReacted}
              className={`flex items-center gap-1 rounded-sm border px-2 py-1 font-mono-safe text-xs transition-colors ${
                isReacted
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line-strong text-ink-soft hover:border-accent hover:text-accent"
              }`}
            >
              <span aria-hidden="true">{REACTION_EMOJI[kind]}</span>
              <span>{counts[kind]}</span>
            </button>
          </form>
        );
      })}
    </div>
  );
}
