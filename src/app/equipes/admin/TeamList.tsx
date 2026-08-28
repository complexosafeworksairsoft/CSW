import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import type { Team } from "@/lib/teams";
import { removeTeamAction } from "./team-actions";

/**
 * Lists the teams that currently have portal login access. Server component
 * (no interactivity of its own beyond the per-row delete form) — only the
 * team name and código are shown, the password is intentionally never
 * displayed here again after creation, see CreateTeamForm.tsx.
 */
export default function TeamList({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-4 py-3">
        Nenhuma equipe cadastrada.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {teams.map((team) => (
        <li
          key={team.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{team.teamName}</p>
            <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
              {team.teamCode}
            </p>
          </div>

          <form action={removeTeamAction}>
            <input type="hidden" name="teamId" value={team.id} />
            <ConfirmDeleteButton
              label="Excluir acesso"
              confirmMessage={`Remover o acesso da equipe "${team.teamName}" (${team.teamCode})? A equipe não conseguirá mais entrar no portal. Os dados de ficha/agenda já cadastrados por ela NÃO são apagados.`}
              size="sm"
            />
          </form>
        </li>
      ))}
    </ul>
  );
}
