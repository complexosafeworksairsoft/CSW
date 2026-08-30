import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Hero from "@/components/Hero";
import PhotoTile from "@/components/PhotoTile";
import ReactionBar from "@/components/ReactionBar";
import CommentBox from "@/components/CommentBox";
import { findTeamByCode } from "@/lib/teams";
import { getPublicOperatorsForTeam } from "@/lib/roster-data";
import { getComments, getReactionCounts } from "@/lib/engagement-data";
import { readUserSessionId } from "@/lib/user-session";
import { getActiveRequestForUser } from "@/lib/membership";
import JoinTeamForm from "./JoinTeamForm";

type Params = Promise<{ teamCode: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { teamCode } = await params;
  const team = await findTeamByCode(teamCode);
  return {
    title: team ? `${team.teamName} | Safe Works` : "Equipe não encontrada | Safe Works",
  };
}

export default async function TeamPage({ params }: { params: Params }) {
  const { teamCode } = await params;
  const team = await findTeamByCode(teamCode);
  if (!team) {
    notFound();
  }

  const visibleOperators = await getPublicOperatorsForTeam(team.id);
  const operators = await Promise.all(
    visibleOperators.map(async (operator) => ({
      operator,
      counts: await getReactionCounts(operator.id),
      comments: await getComments(operator.id),
    }))
  );

  const userId = await readUserSessionId();
  const activeRequest = userId ? await getActiveRequestForUser(userId) : null;

  return (
    <>
      <Hero
        eyebrow="Equipe"
        title={team.teamName}
        subtitle={
          operators.length > 0
            ? `${operators.length} ${
                operators.length === 1 ? "membro em destaque" : "membros em destaque"
              } desta equipe.`
            : "Esta equipe ainda não colocou nenhum membro em destaque nesta página."
        }
      />

      <section className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        {!userId && (
          <div className="border border-line-strong bg-surface p-5">
            <p className="text-sm text-ink-soft">
              Quer jogar por essa equipe?{" "}
              <Link href="/conta/login" className="font-medium text-olive-deep hover:text-accent">
                Entre na sua conta
              </Link>{" "}
              ou{" "}
              <Link href="/conta/cadastro" className="font-medium text-olive-deep hover:text-accent">
                cadastre-se
              </Link>{" "}
              para solicitar entrada.
            </p>
          </div>
        )}

        {userId && !activeRequest && <JoinTeamForm teamId={team.id} />}

        {userId && activeRequest && activeRequest.teamId === team.id && activeRequest.status === "pending" && (
          <div className="border border-line-strong bg-surface p-5">
            <p className="text-sm text-ink-soft">
              Sua solicitação para entrar em <strong className="text-ink">{team.teamName}</strong>{" "}
              está aguardando aprovação da equipe.
            </p>
          </div>
        )}

        {userId && activeRequest && activeRequest.teamId === team.id && activeRequest.status === "approved" && (
          <div className="border border-line-strong bg-surface p-5">
            <p className="text-sm text-ink-soft">
              Você já é membro de <strong className="text-ink">{team.teamName}</strong>.
            </p>
          </div>
        )}

        {userId && activeRequest && activeRequest.teamId !== team.id && (
          <div className="border border-line-strong bg-surface p-5">
            <p className="text-sm text-ink-soft">
              Você já tem uma solicitação ou vínculo com outra equipe — só é
              possível pertencer a uma equipe por vez.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {operators.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {operators.map(({ operator, counts, comments }) => (
              <article key={operator.id} className="bg-surface border border-line p-5 flex flex-col">
                <Link href={`/operadores/${operator.id}`} className="flex gap-4 group">
                  <PhotoTile
                    photo={operator.photo}
                    fit={operator.photoFit}
                    label={`Foto: ${operator.name}`}
                    className="w-20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-ink truncate group-hover:text-accent transition-colors">
                      {operator.name}
                    </h3>
                    <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                      {operator.tag}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {operator.category || "Categoria não informada"}
                    </p>
                  </div>
                </Link>

                <div className="mt-4">
                  <ReactionBar
                    operatorId={operator.id}
                    counts={counts}
                  />
                </div>

                <CommentBox operatorId={operator.id} comments={comments} />
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line-strong bg-surface p-8 text-center">
            <p className="font-mono-safe text-xs uppercase tracking-widest text-muted">
              Nenhum membro em destaque
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              A equipe {team.teamName} ainda não colocou nenhum membro em destaque nesta página.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
