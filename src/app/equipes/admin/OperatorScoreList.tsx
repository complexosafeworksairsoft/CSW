import { MAX_SCORE, type Operator } from "@/lib/roster-data";
import { setOperatorScoreAction } from "./operator-actions";

export type OperatorScoreRow = Pick<Operator, "id" | "name" | "tag" | "score"> & {
  teamName: string | null;
};

/** Every operator with an inline graduação (score) editor — "Graduação dos operadores" section of the admin panel. */
export default function OperatorScoreList({ operators }: { operators: OperatorScoreRow[] }) {
  if (operators.length === 0) {
    return (
      <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-4 py-3">
        Nenhum operador cadastrado ainda.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {operators.map((operator) => (
        <li
          key={operator.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{operator.name}</p>
            <p className="font-mono-safe text-xs uppercase tracking-widest text-muted">
              {operator.tag} · {operator.teamName ?? "Sem equipe"}
            </p>
          </div>

          <form action={setOperatorScoreAction} className="flex items-center gap-2">
            <input type="hidden" name="operatorId" value={operator.id} />
            <input
              type="number"
              name="score"
              min={0}
              max={MAX_SCORE}
              defaultValue={operator.score}
              className="w-20 rounded-sm border border-line-strong bg-surface-2 px-2 py-1.5 font-mono-safe text-sm text-ink focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors"
            >
              Salvar
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
