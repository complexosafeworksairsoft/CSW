import type { User } from "@/lib/users";
import { approveUserAccountAction, rejectUserAccountAction } from "./account-actions";

/** Accounts awaiting approval before they can log in — "Solicitações de conta" section of the admin panel. */
export default function PendingAccountsList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-4 py-3">
        Nenhum cadastro pendente.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user.displayName}</p>
            <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
              @{user.username}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <form action={approveUserAccountAction}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="rounded-sm bg-accent px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest font-semibold text-[#231400] hover:opacity-90 transition-opacity"
              >
                Aprovar
              </button>
            </form>
            <form action={rejectUserAccountAction}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-muted hover:border-accent hover:text-accent transition-colors"
              >
                Rejeitar
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
