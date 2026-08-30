import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSessionTeamId } from "@/lib/session";
import { getPendingRequestsForTeam } from "@/lib/membership";
import { findUserById } from "@/lib/users";
import { approveRequestAction, rejectRequestAction } from "../../membership-actions";

export const metadata: Metadata = {
  title: "Solicitações | Portal de Equipes",
  description: "Aprove ou rejeite pedidos de entrada na equipe.",
};

export default async function SolicitacoesPage() {
  const teamId = await readSessionTeamId();
  if (!teamId) {
    redirect("/equipes/login");
  }

  const requests = await getPendingRequestsForTeam(teamId);
  const withUsers = await Promise.all(
    requests.map(async (request) => ({
      request,
      user: await findUserById(request.userId),
    }))
  );

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <p className="eyebrow">Portal de equipes</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Solicitações de entrada
      </h1>
      <p className="mt-2 text-ink-soft">
        Pessoas que criaram uma conta e pediram para entrar na sua equipe.
        Aprovar cria o operador na Ficha da Equipe (privado por padrão) já
        vinculado à conta dessa pessoa.
      </p>

      {withUsers.length === 0 ? (
        <p className="mt-8 border border-dashed border-line-strong bg-surface-2 rounded-sm p-6 text-sm text-muted">
          Nenhuma solicitação pendente no momento.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {withUsers.map(({ request, user }) => (
            <li
              key={request.id}
              className="flex flex-wrap items-center justify-between gap-4 border border-line-strong bg-surface-2 rounded-sm p-5"
            >
              <div>
                <p className="font-medium text-ink">{user?.displayName ?? "Usuário"}</p>
                <p className="mt-0.5 text-sm text-muted">
                  @{user?.username ?? "?"}
                  {request.requestedOperatorName
                    ? ` · quer ser listado como "${request.requestedOperatorName}"`
                    : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={approveRequestAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <button
                    type="submit"
                    className="rounded-sm bg-accent px-4 py-2 font-mono-safe text-xs uppercase tracking-widest font-semibold text-[#231400] hover:opacity-90 transition-opacity"
                  >
                    Aprovar
                  </button>
                </form>
                <form action={rejectRequestAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <button
                    type="submit"
                    className="rounded-sm border border-line-strong px-4 py-2 font-mono-safe text-xs uppercase tracking-widest text-muted hover:border-accent hover:text-accent transition-colors"
                  >
                    Rejeitar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
