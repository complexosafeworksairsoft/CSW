import type { Metadata } from "next";
import { readSessionTeamId } from "@/lib/session";
import { MATCHES } from "@/lib/agenda-data";
import { confirmPresenceAction } from "../../actions";

export const metadata: Metadata = {
  title: "Agenda | Portal de Equipes | Safe Works",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function EquipesAgendaPage() {
  const teamId = (await readSessionTeamId())!;
  const matches = [...MATCHES].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Agenda</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Próximas operações
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Confirme a presença da equipe nas próximas operações do Complexo.
        Sua confirmação vale para todo o esquadrão.
      </p>

      <div className="mt-10 divide-y divide-line border border-line bg-surface">
        {matches.map((match) => {
          const confirmed = match.confirmedTeamIds.includes(teamId);
          const confirmedCount = match.confirmedTeamIds.length;

          return (
            <article
              key={match.id}
              className="p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono-safe text-sm text-accent">
                    {formatDate(match.date)} · {match.time}
                  </span>
                  <span className="font-mono-safe text-xs uppercase tracking-widest text-muted">
                    {match.operationType}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold text-ink">
                  {match.title}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">{match.location}</p>
                {match.notes && (
                  <p className="mt-2 text-sm text-muted max-w-xl">{match.notes}</p>
                )}
                <p className="mt-3 font-mono-safe text-xs uppercase tracking-widest text-muted">
                  {confirmedCount === 0
                    ? "Nenhuma equipe confirmada ainda"
                    : `${confirmedCount} ${
                        confirmedCount === 1
                          ? "equipe confirmada"
                          : "equipes confirmadas"
                      }`}
                </p>
              </div>

              <form action={confirmPresenceAction} className="shrink-0">
                <input type="hidden" name="matchId" value={match.id} />
                <button
                  type="submit"
                  className={`w-full sm:w-auto px-5 py-3 rounded-sm font-mono-safe text-sm uppercase tracking-widest transition-colors ${
                    confirmed
                      ? "border border-line-strong text-ink-soft hover:border-accent hover:text-accent"
                      : "bg-accent text-[#231400] font-semibold hover:opacity-90"
                  }`}
                >
                  {confirmed ? "Cancelar presença" : "Confirmar presença"}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
