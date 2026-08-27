import type { Metadata } from "next";
import { getContentSorted } from "@/lib/conteudo-data";

export const metadata: Metadata = {
  title: "Conteúdo Exclusivo | Portal de Equipes | Safe Works",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const KIND_LABEL: Record<string, string> = {
  briefing: "Briefing de missão",
  comunicado: "Comunicado interno",
};

export default function EquipesConteudoPage() {
  const items = getContentSorted();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Conteúdo exclusivo</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Dossiê da equipe
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Briefings de missão e comunicados internos visíveis apenas para
        equipes cadastradas no Complexo.
      </p>

      <div className="mt-10 space-y-px bg-line border border-line">
        {items.map((item) => (
          <article key={item.id} className="bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`font-mono-safe text-xs uppercase tracking-widest px-2 py-1 rounded-sm border ${
                  item.kind === "briefing"
                    ? "text-accent border-accent/40"
                    : "text-ink-soft border-line-strong"
                }`}
              >
                {KIND_LABEL[item.kind]}
              </span>
              <span className="font-mono-safe text-sm text-muted">
                {formatDate(item.date)}
              </span>
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold text-ink">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-ink-soft max-w-2xl whitespace-pre-line">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
