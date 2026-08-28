import Link from "next/link";
import type { Metadata } from "next";
import { readSessionTeamId } from "@/lib/session";
import { findTeamById } from "@/lib/teams";
import { getMatches } from "@/lib/agenda-data";
import { getContentSorted } from "@/lib/conteudo-data";

export const metadata: Metadata = {
  title: "Painel da Equipe | Safe Works",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function EquipesDashboardPage() {
  // Layout above already guarantees a valid session + team.
  const teamId = (await readSessionTeamId())!;
  const team = (await findTeamById(teamId))!;

  const matches = await getMatches();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = matches.filter((m) => m.date >= today).sort((a, b) =>
    a.date < b.date ? -1 : 1
  );
  const nextMatch = upcoming[0];
  const confirmedCount = matches.filter((m) =>
    m.confirmedTeamIds.includes(teamId)
  ).length;
  const content = await getContentSorted();
  const latestContent = content.slice(0, 2);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Painel</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Bem-vindo, {team.teamName}
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Acompanhe as próximas operações da região, confirme presença e
        consulte briefings e comunicados exclusivos da sua equipe.
      </p>

      <div className="mt-10 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/equipes/agenda"
          className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
        >
          <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
            Agenda
          </span>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">
            {nextMatch
              ? `Próxima: ${formatDate(nextMatch.date)}`
              : "Sem operações agendadas"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {nextMatch
              ? `${nextMatch.title} — ${nextMatch.time}`
              : "Volte em breve para novas datas."}
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
            Ver agenda →
          </span>
        </Link>

        <Link
          href="/equipes/agenda"
          className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
        >
          <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
            Presença
          </span>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">
            {confirmedCount}{" "}
            {confirmedCount === 1 ? "operação confirmada" : "operações confirmadas"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Do total de {matches.length} operações na agenda atual.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
            Confirmar presença →
          </span>
        </Link>

        <Link
          href="/equipes/conteudo"
          className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
        >
          <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
            Conteúdo exclusivo
          </span>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">
            {latestContent[0]?.title ?? "Nenhum item publicado"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Briefings de missão e comunicados internos do Complexo.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
            Abrir dossiê →
          </span>
        </Link>
      </div>
    </section>
  );
}
