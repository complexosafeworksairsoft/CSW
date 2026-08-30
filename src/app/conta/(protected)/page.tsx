import type { Metadata } from "next";
import Link from "next/link";
import PhotoTile from "@/components/PhotoTile";
import TeamCrestPlaceholder from "@/components/TeamCrestPlaceholder";
import { readUserSessionId } from "@/lib/user-session";
import { getActiveRequestForUser } from "@/lib/membership";
import {
  createOperatorForApprovedUser,
  getOperatorByUserId,
  getTeamProfile,
  MAX_SCORE,
} from "@/lib/roster-data";
import { findTeamById, getAllTeams } from "@/lib/teams";
import { findUserById } from "@/lib/users";

export const metadata: Metadata = {
  title: "Minha Conta | Safe Works",
  description: "Área pessoal da conta no Complexo Safe Works.",
};

export default async function ContaPage() {
  const userId = await readUserSessionId();
  if (!userId) return null; // o layout já redireciona antes de chegar aqui

  let operator = await getOperatorByUserId(userId);
  if (!operator) {
    // Toda conta aprovada deveria já ter um operador (ver
    // account-actions.ts) — isso é só uma rede de segurança para contas que
    // ficaram sem um por algum motivo.
    const user = await findUserById(userId);
    if (user) {
      operator = await createOperatorForApprovedUser(userId, user.displayName, user.username.toUpperCase());
    }
  }

  const [activeRequest, team, teamProfile, allTeams] = await Promise.all([
    getActiveRequestForUser(userId),
    operator?.teamId ? findTeamById(operator.teamId) : Promise.resolve(null),
    operator?.teamId ? getTeamProfile(operator.teamId) : Promise.resolve(null),
    operator?.teamId ? Promise.resolve(null) : getAllTeams(),
  ]);

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="flex items-center gap-4">
        {teamProfile?.photo ? (
          <PhotoTile
            photo={teamProfile.photo}
            fit={teamProfile.photoFit}
            label={`Brasão: ${team?.teamName ?? "equipe"}`}
            ratio="square"
            className="h-14 w-14 shrink-0"
          />
        ) : (
          <TeamCrestPlaceholder className="h-14 w-14 shrink-0" />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-ink truncate">
            {operator?.name ?? "Operador"}
          </h1>
          {operator && (
            <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
              {operator.tag}
            </p>
          )}
        </div>
      </div>

      {operator && (
        <div className="mt-6">
          <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
            Graduação
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-accent"
              style={{ width: `${(operator.score / MAX_SCORE) * 100}%` }}
            />
          </div>
          <p className="mt-1 font-mono-safe text-xs text-muted">
            {operator.score}/{MAX_SCORE}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-dashed border-line-strong bg-surface-2 p-5">
          <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
            Pontuação
          </p>
          <p className="mt-2 text-sm text-muted">Critérios de pontuação em definição.</p>
        </div>
        <div className="border border-dashed border-line-strong bg-surface-2 p-5">
          <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
            Insígnias
          </p>
          <p className="mt-2 text-sm text-muted">Nenhuma insígnia conquistada ainda.</p>
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-8">
        {operator?.teamId && team ? (
          <>
            <p className="eyebrow">Equipe</p>
            <p className="mt-2 text-ink-soft">
              Você é membro de <strong className="text-ink">{team.teamName}</strong>.
            </p>
            <Link
              href={`/operadores/equipe/${team.teamCode}`}
              className="mt-2 inline-block text-sm font-medium text-olive-deep hover:text-accent"
            >
              Ver página da equipe →
            </Link>
          </>
        ) : activeRequest?.status === "pending" ? (
          <>
            <p className="eyebrow">Solicitação enviada</p>
            <p className="mt-2 text-ink-soft">
              Sua entrada está aguardando aprovação da equipe.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Sem equipe</p>
            <p className="mt-2 text-ink-soft">
              Você ainda não pertence a uma equipe. Escolha uma abaixo — o
              pedido de entrada é feito direto na página dela.
            </p>
            <ul className="mt-4 grid gap-2">
              {(allTeams ?? []).map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/operadores/equipe/${t.teamCode}`}
                    className="flex items-center justify-between border border-line-strong bg-surface px-4 py-3 text-sm text-ink hover:border-accent hover:text-accent transition-colors"
                  >
                    {t.teamName}
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
