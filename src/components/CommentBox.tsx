"use client";

import { useActionState, useState } from "react";
import { addCommentAction, type ActionState } from "@/app/operadores/actions";

const initialState: ActionState = { error: null, resetToken: 0 };
const COMMENT_MAX = 100;

export type PublicComment = {
  id: string;
  text: string;
  authorName: string | null;
  createdAt: number;
};

/**
 * Owns its own local state so the parent can reset it for free: remounted
 * (fresh useState) whenever the parent's `key` changes, same pattern as
 * AddEquipmentForm.tsx's DescriptionField — avoids syncing value back with
 * an effect after a successful submit.
 */
function CommentField({ id }: { id: string }) {
  const [value, setValue] = useState("");

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft"
        >
          Comentário
        </label>
        <span className="font-mono-safe text-[11px] text-muted">
          {value.length}/{COMMENT_MAX}
        </span>
      </div>
      <textarea
        id={id}
        name="text"
        rows={2}
        maxLength={COMMENT_MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Deixe um comentário curto…"
        className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Comment form + list for an operador's public profile. Attribution
 * ("Allis" vs. no name at all) is decided entirely server-side in
 * addCommentAction via readAdminSession() — this component just renders
 * whatever authorName it's handed, it never decides who anyone is.
 */
export default function CommentBox({
  operatorId,
  comments,
}: {
  operatorId: string;
  comments: PublicComment[];
}) {
  const [state, formAction, pending] = useActionState(addCommentAction, initialState);

  return (
    <div className="mt-4 border-t border-line pt-4">
      <form action={formAction}>
        <input type="hidden" name="operatorId" value={operatorId} />
        <div key={state.resetToken}>
          <CommentField id={`comment-${operatorId}`} />
        </div>

        {state.error && (
          <p role="alert" className="mt-2 border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 border border-line-strong px-3 py-1.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Comentar"}
        </button>
      </form>

      {comments.length > 0 && (
        <ul className="mt-4 space-y-px bg-line border border-line max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-surface px-3 py-2">
              <p className="text-sm text-ink break-words">{comment.text}</p>
              <div className="mt-1 flex items-center gap-2">
                {comment.authorName && (
                  <span className="font-mono-safe text-xs text-accent">
                    {comment.authorName}
                  </span>
                )}
                <span className="font-mono-safe text-[10px] text-muted">
                  {formatTimestamp(comment.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
