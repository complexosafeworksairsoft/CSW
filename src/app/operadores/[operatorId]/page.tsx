import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoTile from "@/components/PhotoTile";
import TeamCrestPlaceholder from "@/components/TeamCrestPlaceholder";
import ReactionBar from "@/components/ReactionBar";
import CommentBox from "@/components/CommentBox";
import EquipmentSpecSheet from "@/components/EquipmentSpecSheet";
import { findTeamById } from "@/lib/teams";
import { getEquipment, getOperatorById, getTeamProfile, MAX_SCORE } from "@/lib/roster-data";
import { getComments, getReactionCounts } from "@/lib/engagement-data";

type Params = Promise<{ operatorId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { operatorId } = await params;
  const operator = await getOperatorById(operatorId);
  return {
    title:
      operator && operator.isPublic
        ? `${operator.name} | Safe Works`
        : "Operador não encontrado | Safe Works",
  };
}

export default async function OperatorPage({ params }: { params: Params }) {
  const { operatorId } = await params;
  const operator = await getOperatorById(operatorId);
  if (!operator || !operator.isPublic) {
    notFound();
  }

  const [team, counts, comments, teamProfile, equipment] = await Promise.all([
    operator.teamId ? findTeamById(operator.teamId) : Promise.resolve(null),
    getReactionCounts(operator.id),
    getComments(operator.id),
    operator.teamId ? getTeamProfile(operator.teamId) : Promise.resolve(null),
    getEquipment(operator.id),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
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
          <h1 className="font-display text-3xl font-semibold text-ink truncate">{operator.name}</h1>
          <p className="font-mono-safe text-sm uppercase tracking-widest text-accent">{operator.tag}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{team ? team.teamName : "Sem equipe"}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-[160px_1fr]">
        <PhotoTile
          photo={operator.photo}
          fit={operator.photoFit}
          label={`Foto: ${operator.name}`}
          ratio="square"
        />

        <div className="grid gap-6 content-start">
          <div>
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

          <p className="text-sm text-ink-soft">
            {operator.category || "Categoria não informada"}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
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

      <div className="mt-10">
        <p className="eyebrow">Ficha de Armamento</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">Equipamento</h2>
        <div className="mt-4 border border-line">
          <EquipmentSpecSheet items={equipment} />
        </div>
      </div>

      <div className="mt-10">
        <ReactionBar operatorId={operator.id} counts={counts} />
        <CommentBox operatorId={operator.id} comments={comments} />
      </div>
    </section>
  );
}
