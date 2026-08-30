import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import ActivityFeed from "@/components/ActivityFeed";
import MonthCalendar from "@/components/MonthCalendar";
import { getRecentActivity } from "@/lib/activity-feed";
import { getMatches } from "@/lib/agenda-data";

export const metadata: Metadata = {
  title: "Central do Airsoft | Safe Works",
  description: "Últimas atualizações do Complexo, agenda de operações e acesso rápido a equipes e operadores.",
};

const FEED_LIMIT = 15;
const BASE_PATH = "/central-do-airsoft";

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function parseMonthParam(raw: string | undefined): { year: number; month: number } {
  const now = new Date();
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default async function CentralDoAirsoftPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  const [activity, allMatches] = await Promise.all([getRecentActivity(FEED_LIMIT), getMatches()]);

  const monthPrefix = `${year}-${month.toString().padStart(2, "0")}`;
  const matchesThisMonth = allMatches
    .filter((m) => m.date.startsWith(monthPrefix))
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

  const eventCountByDate = new Map<string, number>();
  for (const match of allMatches) {
    eventCountByDate.set(match.date, (eventCountByDate.get(match.date) ?? 0) + 1);
  }

  return (
    <>
      <Hero
        eyebrow="Central do Operador"
        title="Central do Airsoft"
        subtitle="Últimas atualizações do Complexo, a agenda de operações e acesso rápido às equipes e operadores."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/central-de-equipes"
            className="flex-1 min-w-[200px] border border-line-strong bg-surface p-5 hover:border-accent transition-colors"
          >
            <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">Equipes</p>
            <p className="mt-1 text-sm text-ink-soft">Diretório público de todas as equipes do Complexo.</p>
          </Link>
          <Link
            href="/operadores"
            className="flex-1 min-w-[200px] border border-line-strong bg-surface p-5 hover:border-accent transition-colors"
          >
            <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">Operadores</p>
            <p className="mt-1 text-sm text-ink-soft">Perfis, reações e comentários dos operadores em destaque.</p>
          </Link>
        </div>

        <div className="mt-12">
          <p className="eyebrow">Atualizações</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">O que está rolando</h2>
          <div className="mt-6">
            <ActivityFeed items={activity} />
          </div>
        </div>

        <div id="agenda" className="mt-14 scroll-mt-20">
          <p className="eyebrow">Agenda</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Operações do Complexo</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Dias marcados têm operação cadastrada. Confirmação de presença é feita pela equipe, no Login de Equipe.
          </p>

          <div className="mt-6">
            <MonthCalendar year={year} month={month} eventCountByDate={eventCountByDate} basePath={BASE_PATH} />
          </div>

          <div className="mt-6 divide-y divide-line border border-line bg-surface">
            {matchesThisMonth.length === 0 ? (
              <p className="p-6 text-sm text-muted">Nenhuma operação cadastrada neste mês.</p>
            ) : (
              matchesThisMonth.map((match) => (
                <article key={match.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono-safe text-sm text-accent">
                      {formatShortDate(match.date)} · {match.time}
                    </span>
                    {match.operationType && (
                      <span className="font-mono-safe text-xs uppercase tracking-widest text-muted">
                        {match.operationType}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-ink">{match.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{match.location}</p>
                  <p className="mt-2 font-mono-safe text-xs uppercase tracking-widest text-muted">
                    {match.confirmedTeamIds.length === 0
                      ? "Nenhuma equipe confirmada ainda"
                      : `${match.confirmedTeamIds.length} ${
                          match.confirmedTeamIds.length === 1 ? "equipe confirmada" : "equipes confirmadas"
                        }`}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
