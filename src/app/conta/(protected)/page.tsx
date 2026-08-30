import type { Metadata } from "next";
import { readUserSessionId } from "@/lib/user-session";
import { getActiveRequestForUser } from "@/lib/membership";
import { getOperatorByUserId } from "@/lib/roster-data";
import { findTeamById, getAllTeams } from "@/lib/teams";
import RequestMembershipForm from "./RequestMembershipForm";

export const metadata: Metadata = {
  title: "Minha Conta | Safe Works",
  description: "Área pessoal da conta no Complexo Safe Works.",
};

export default async function ContaPage() {
  const userId = await readUserSessionId();
  if (!userId) return null; // o layout já redireciona antes de chegar aqui

  const activeRequest = await getActiveRequestForUser(userId);

  if (!activeRequest) {
    const teams = await getAllTeams();
    return (
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <p className="eyebrow">Sem equipe</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Você ainda não pertence a uma equipe
        </h1>
        <p className="mt-2 text-ink-soft">
          Escolha uma equipe do Complexo para solicitar sua entrada. A equipe
          vai revisar e aprovar seu acesso.
        </p>
        <RequestMembershipForm teams={teams.map((t) => ({ id: t.id, name: t.teamName }))} />
      </section>
    );
  }

  const team = await findTeamById(activeRequest.teamId);

  if (activeRequest.status === "pending") {
    return (
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <p className="eyebrow">Solicitação enviada</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Aguardando aprovação
        </h1>
        <p className="mt-2 text-ink-soft">
          Você solicitou entrada em{" "}
          <strong className="text-ink">{team?.teamName ?? "uma equipe"}</strong>.
          Assim que a equipe revisar seu pedido, ele aparece aqui.
        </p>
      </section>
    );
  }

  const operator = await getOperatorByUserId(userId);

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <p className="eyebrow">Membro aprovado</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        {team?.teamName ?? "Equipe"}
      </h1>
      {operator && (
        <p className="mt-2 text-ink-soft">
          Cadastrado como <strong className="text-ink">{operator.name}</strong>{" "}
          ({operator.tag}).
        </p>
      )}
    </section>
  );
}
