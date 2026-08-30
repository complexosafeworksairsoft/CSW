import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readUserSessionId } from "@/lib/user-session";
import { findUserById } from "@/lib/users";
import { logoutAction } from "../actions";

const CONTA_LINKS = [
  { href: "/conta", label: "Perfil" },
  { href: "/conta/agendamentos", label: "Agendamentos" },
];

export default async function ContaProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await readUserSessionId();
  if (!userId) {
    redirect("/conta/login");
  }

  const user = await findUserById(userId);
  if (!user) {
    // Session cookie points at a user that no longer exists — treat as logged out.
    redirect("/conta/login");
  }

  return (
    <div>
      <div className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Minha conta</p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">
              {user.displayName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-1">
              {CONTA_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-ink-soft hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-mono-safe text-xs uppercase tracking-widest border border-line-strong px-3 py-2 rounded-sm text-ink-soft hover:border-accent hover:text-accent transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
