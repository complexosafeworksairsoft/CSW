import type { Metadata } from "next";
import { readSessionTeamId } from "@/lib/session";
import { findTeamById } from "@/lib/teams";
import { getEquipment, getOperators, getTeamProfile } from "@/lib/roster-data";
import TeamProfileForm from "./TeamProfileForm";
import OperatorsSection from "./OperatorsSection";

export const metadata: Metadata = {
  title: "Ficha da Equipe | Portal de Equipes | Safe Works",
};

export default async function FichaPage() {
  // Layout above already guarantees a valid session + team.
  const teamId = (await readSessionTeamId())!;
  const team = (await findTeamById(teamId))!;

  const profile = await getTeamProfile(teamId);
  const rosterOperators = await getOperators(teamId);
  const operators = await Promise.all(
    rosterOperators.map(async (operator) => ({
      ...operator,
      equipment: await getEquipment(operator.id),
    }))
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Ficha da equipe</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        {team.teamName}
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Perfil da equipe, operadores cadastrados e o equipamento de cada um.
        Essas informações ficam visíveis apenas para a própria equipe.
      </p>

      <div className="mt-10">
        <TeamProfileForm teamName={team.teamName} profile={profile} />
      </div>

      <div className="mt-16">
        <OperatorsSection operators={operators} />
      </div>
    </section>
  );
}
