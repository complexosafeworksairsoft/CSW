import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import PhotoTile from "@/components/PhotoTile";
import { getAllTeams } from "@/lib/teams";
import { getPublicOperatorsForTeam, getTeamProfile } from "@/lib/roster-data";

export const metadata: Metadata = {
  title: "Central de Equipes | Safe Works",
  description: "Diretório público das equipes cadastradas no Complexo Safe Works.",
};

export default async function CentralDeEquipesPage() {
  const teams = await getAllTeams();
  const entries = await Promise.all(
    teams.map(async (team) => ({
      team,
      profile: await getTeamProfile(team.id),
      publicOperators: await getPublicOperatorsForTeam(team.id),
    }))
  );
  entries.sort((a, b) => a.team.teamName.localeCompare(b.team.teamName, "pt-BR"));

  return (
    <>
      <Hero
        eyebrow="Central do Operador"
        title="Central de Equipes"
        subtitle="Todas as equipes cadastradas no Complexo. Escolha uma para ver o elenco em destaque e, se você tiver conta, solicitar entrada."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {entries.length > 0 ? (
          <div className="grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(({ team, profile, publicOperators }) => (
              <Link
                key={team.id}
                href={`/operadores/equipe/${team.teamCode}`}
                className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
              >
                <PhotoTile
                  photo={profile.photo}
                  fit={profile.photoFit}
                  label={`Foto: ${team.teamName}`}
                  className="mb-4"
                />
                <h3 className="font-display text-lg font-semibold text-ink">{team.teamName}</h3>
                <span className="mt-2 block font-mono-safe text-xs uppercase tracking-widest text-muted">
                  {publicOperators.length === 0
                    ? "Sem operadores em destaque"
                    : `${publicOperators.length} ${
                        publicOperators.length === 1 ? "operador em destaque" : "operadores em destaque"
                      }`}
                </span>
                <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
                  Ver equipe →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Nenhuma equipe cadastrada até o momento.</p>
        )}
      </section>
    </>
  );
}
