import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readSessionTeamId } from "@/lib/session";
import { findTeamById } from "@/lib/teams";
import { logoutAction } from "../actions";

const PORTAL_LINKS = [
  { href: "/equipes", label: "Painel" },
  { href: "/equipes/agenda", label: "Agenda" },
  { href: "/equipes/conteudo", label: "Conteúdo exclusivo" },
];

export default async function EquipesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const team = findTeamById(teamId);
  if (!team) {
    // Session cookie points at a team that no longer exists in the seed
    // list (e.g. after editing src/lib/teams.ts) — treat as logged out.
    redirect("/equipes/login");
  }

  return (
    <div>
      <div className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Portal de equipes</p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">
              {team.teamName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-1">
              {PORTAL_LINKS.map((link) => (
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
