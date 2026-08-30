import { MAX_OPERATORS_PER_TEAM, type Equipment, type Operator } from "@/lib/roster-data";
import OperatorCard from "./OperatorCard";

type OperatorWithEquipment = Operator & { equipment: Equipment[] };

export default function OperatorsSection({
  operators,
}: {
  operators: OperatorWithEquipment[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Operadores</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Elenco da equipe
          </h2>
        </div>
        <span className="font-mono-safe text-sm text-ink-soft">
          Operadores: {operators.length}/{MAX_OPERATORS_PER_TEAM}
        </span>
      </div>

      {operators.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {operators.map((operator) => (
            <OperatorCard key={operator.id} operator={operator} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-soft">Nenhum operador cadastrado ainda.</p>
      )}

      <p className="mt-8 border border-dashed border-line-strong bg-surface px-4 py-3 text-sm text-ink-soft">
        Para entrar na equipe, a pessoa precisa criar uma conta em{" "}
        <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">Minha Conta</span> e
        solicitar entrada direto na página pública desta equipe — a solicitação aparece em{" "}
        <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">Solicitações</span>.
      </p>
    </div>
  );
}
