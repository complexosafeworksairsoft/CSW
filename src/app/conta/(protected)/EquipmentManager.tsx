import EquipmentListItem from "@/components/EquipmentListItem";
import { MAX_EQUIPMENT_PER_OPERATOR, type Equipment } from "@/lib/roster-data";
import { removeEquipmentAction, updateEquipmentAction } from "../actions";
import AddEquipmentForm from "./AddEquipmentForm";

/**
 * Self-service equivalent of OperatorCard's equipment section
 * (src/app/equipes/(protected)/ficha/OperatorCard.tsx), but scoped to the
 * logged-in account's own operator instead of the team's whole roster.
 * Shares the same `equipment` table and the same MAX_EQUIPMENT_PER_OPERATOR
 * limit — an item added here counts the same as one added by the team.
 */
export default function EquipmentManager({ equipment }: { equipment: Equipment[] }) {
  return (
    <div className="border border-line-strong bg-surface-2 rounded-sm p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
          Meu equipamento
        </p>
        <span className="font-mono-safe text-xs text-muted">
          {equipment.length}/{MAX_EQUIPMENT_PER_OPERATOR}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted max-w-xl">
        Aparece no seu perfil público e na Central do Airsoft para outros operadores verem.
      </p>

      {equipment.length > 0 && (
        <ul className="mt-4 grid gap-3">
          {equipment.map((item) => (
            <EquipmentListItem
              key={item.id}
              item={item}
              updateAction={updateEquipmentAction}
              removeAction={removeEquipmentAction}
            />
          ))}
        </ul>
      )}

      <div className="mt-4">
        {equipment.length < MAX_EQUIPMENT_PER_OPERATOR ? (
          <AddEquipmentForm />
        ) : (
          <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-3 py-2">
            Limite de {MAX_EQUIPMENT_PER_OPERATOR} equipamentos atingido.
          </p>
        )}
      </div>
    </div>
  );
}
