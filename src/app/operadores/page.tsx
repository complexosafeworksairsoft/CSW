import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import PhotoTile from "@/components/PhotoTile";
import { findTeamById } from "@/lib/teams";
import {
  getRecentPublicOperators,
  getTeamProfile,
  getTeamsWithPublicOperators,
} from "@/lib/roster-data";

export const metadata: Metadata = {
  title: "Operadores | Safe Works",
  description:
    "Operadores públicos das equipes cadastradas no Complexo Safe Works: nome, TAG e a equipe de cada um.",
};

const DESTAQUES_LIMIT = 5;

export default function OperadoresPage() {
  // Only ever reads *Public* operators — this page never touches private
  // roster data, team login codes, or anything from src/lib/teams.ts beyond
  // the team name.
  const destaques = getRecentPublicOperators(DESTAQUES_LIMIT).map((operator) => ({
    operator,
    team: findTeamById(operator.teamId),
  }));

  const teams = getTeamsWithPublicOperators()
    .map(({ teamId, publicCount }) => {
      const team = findTeamById(teamId);
      if (!team) return null;
      return { team, publicCount, profile: getTeamProfile(teamId) };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.team.teamName.localeCompare(b.team.teamName, "pt-BR"));

  return (
    <>
      <Hero
        eyebrow="Operadores"
        title="Quem joga pelas equipes do Complexo"
        subtitle="Perfis públicos cadastrados pelas próprias equipes: nome, TAG e a equipe de cada operador. Só aparece aqui quem a equipe decidiu tornar público."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Destaques</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Atualizados recentemente
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Os últimos operadores públicos com novidade no perfil — inclusão, troca de
          equipamento ou mudança de visibilidade.
        </p>

        {destaques.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {destaques.map(({ operator, team }) => (
              <div
                key={operator.id}
                className="relative border-2 border-accent bg-surface p-4 pt-6 flex flex-col"
              >
                <span className="absolute -top-3 left-4 bg-accent px-2 py-0.5 font-mono-safe text-[10px] uppercase tracking-widest text-[#231400] font-semibold">
                  Destaque
                </span>
                <PhotoTile
                  photo={operator.photo}
                  label={`Foto: ${operator.name}`}
                  className="mb-3"
                />
                <h3 className="font-display text-base font-semibold text-ink truncate">
                  {operator.name}
                </h3>
                <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                  {operator.tag}
                </p>
                <p className="mt-1 text-xs text-ink-soft truncate">
                  {team ? team.teamName : "Equipe não encontrada"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink-soft">
            Nenhum operador público cadastrado até o momento.
          </p>
        )}
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Equipes</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Equipes com operadores públicos
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Cada equipe decide quais operadores aparecem aqui. Escolha uma equipe para
            ver o elenco completo que ela tornou público.
          </p>

          {teams.length > 0 ? (
            <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-3">
              {teams.map(({ team, profile, publicCount }) => (
                <Link
                  key={team.id}
                  href={`/operadores/equipe/${team.teamCode}`}
                  className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
                >
                  <PhotoTile
                    photo={profile.photo}
                    label={`Foto: ${team.teamName}`}
                    className="mb-4"
                  />
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {team.teamName}
                  </h3>
                  <span className="mt-2 block font-mono-safe text-xs uppercase tracking-widest text-muted">
                    {publicCount} {publicCount === 1 ? "operador público" : "operadores públicos"}
                  </span>
                  <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
                    Ver operadores →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink-soft">
              Nenhuma equipe com operadores públicos até o momento.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
