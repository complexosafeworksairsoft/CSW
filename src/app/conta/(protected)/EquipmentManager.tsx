import PhotoTile from "@/components/PhotoTile";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { MAX_EQUIPMENT_PER_OPERATOR, type Equipment } from "@/lib/roster-data";
import { removeEquipmentAction } from "../actions";
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
            <li key={item.id} className="border border-line bg-surface p-3">
              <div className="flex gap-3">
                <PhotoTile photo={item.photo} fit={item.photoFit} label={`Foto: ${item.name}`} className="w-14 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                  {item.brand && (
                    <p className="font-mono-safe text-[11px] uppercase tracking-widest text-muted">{item.brand}</p>
                  )}
                  {item.description && <p className="mt-1 text-xs text-ink-soft break-words">{item.description}</p>}
                  {(item.weaponClass || item.propulsion) && (
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {item.weaponClass && (
                        <span className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono-safe text-[10px] uppercase tracking-widest text-ink-soft">
                          {item.weaponClass}
                        </span>
                      )}
                      {item.propulsion && (
                        <span className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono-safe text-[10px] uppercase tracking-widest text-ink-soft">
                          {item.propulsion}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <form action={removeEquipmentAction} className="mt-2">
                <input type="hidden" name="equipmentId" value={item.id} />
                <ConfirmDeleteButton
                  label="Excluir"
                  confirmMessage="Tem certeza que deseja excluir este equipamento? Essa ação não pode ser desfeita."
                  size="sm"
                />
              </form>
            </li>
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
