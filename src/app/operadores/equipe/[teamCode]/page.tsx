import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/Hero";
import PhotoTile from "@/components/PhotoTile";
import ReactionBar from "@/components/ReactionBar";
import CommentBox from "@/components/CommentBox";
import { TEAMS } from "@/lib/teams";
import { getPublicOperatorsForTeam } from "@/lib/roster-data";
import { getComments, getReactionCounts } from "@/lib/engagement-data";

type Params = Promise<{ teamCode: string }>;

// teamCode (e.g. "CSA", "DEC", "CANS") is already a public-facing identifier
// — it's the login *username*, not a secret. The password is the secret,
// and this page (and everything it imports) never touches passwords.
function findTeamByCode(teamCode: string) {
  const normalized = teamCode.trim().toUpperCase();
  return TEAMS.find((t) => t.teamCode === normalized) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { teamCode } = await params;
  const team = findTeamByCode(teamCode);
  return {
    title: team
      ? `${team.teamName} — Operadores | Safe Works`
      : "Equipe não encontrada | Safe Works",
  };
}

export default async function TeamPublicRosterPage({ params }: { params: Params }) {
  const { teamCode } = await params;
  const team = findTeamByCode(teamCode);
  if (!team) {
    notFound();
  }

  const operators = getPublicOperatorsForTeam(team.id);

  return (
    <>
      <Hero
        eyebrow="Operadores"
        title={team.teamName}
        subtitle={
          operators.length > 0
            ? `${operators.length} ${
                operators.length === 1 ? "operador público" : "operadores públicos"
              } cadastrados por esta equipe.`
            : "Esta equipe ainda não tornou nenhum operador público."
        }
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {operators.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {operators.map((operator) => (
              <article key={operator.id} className="bg-surface border border-line p-5 flex flex-col">
                <div className="flex gap-4">
                  <PhotoTile
                    photo={operator.photo}
                    label={`Foto: ${operator.name}`}
                    className="w-20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-ink truncate">
                      {operator.name}
                    </h3>
                    <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                      {operator.tag}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {operator.category || "Categoria não informada"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <ReactionBar
                    operatorId={operator.id}
                    counts={getReactionCounts(operator.id)}
                  />
                </div>

                <CommentBox operatorId={operator.id} comments={getComments(operator.id)} />
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line-strong bg-surface p-8 text-center">
            <p className="font-mono-safe text-xs uppercase tracking-widest text-muted">
              Nenhum operador público
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              A equipe {team.teamName} ainda não tornou nenhum operador visível nesta página.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
