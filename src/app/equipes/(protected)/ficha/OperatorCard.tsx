import ImagePlaceholder from "@/components/ImagePlaceholder";
import { MAX_EQUIPMENT_PER_OPERATOR, type Equipment, type Operator } from "@/lib/roster-data";
import { removeEquipmentAction, removeOperatorAction } from "../../roster-actions";
import AddEquipmentForm from "./AddEquipmentForm";

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function formatStartMonth(value: string): string | null {
  const [y, m] = value.split("-");
  const idx = Number(m) - 1;
  if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return null;
  return `${MONTHS_PT[idx]}/${y}`;
}

/** Static (non-interactive) photo tile — same visual language as ImagePlaceholder, but renders a saved photo when there is one. */
function PhotoTile({
  photo,
  label,
  className = "",
}: {
  photo: string | null;
  label: string;
  className?: string;
}) {
  if (!photo) {
    return <ImagePlaceholder label={label} ratio="square" className={className} />;
  }
  return (
    <div className={`relative aspect-square overflow-hidden border border-line-strong bg-surface-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- prototype data-URI photo, see ImagePlaceholder.tsx for the swap-to-next/image note */}
      <img src={photo} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l-2 border-t-2 border-accent/70" />
      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r-2 border-t-2 border-accent/70" />
      <span className="absolute left-1.5 bottom-1.5 h-2.5 w-2.5 border-l-2 border-b-2 border-accent/70" />
      <span className="absolute right-1.5 bottom-1.5 h-2.5 w-2.5 border-r-2 border-b-2 border-accent/70" />
    </div>
  );
}

type OperatorWithEquipment = Operator & { equipment: Equipment[] };

export default function OperatorCard({ operator }: { operator: OperatorWithEquipment }) {
  const startLabel = operator.startMonth ? formatStartMonth(operator.startMonth) : null;

  return (
    <article className="bg-surface border border-line p-5 flex flex-col gap-4">
      <div className="flex gap-4">
        <PhotoTile photo={operator.photo} label={`Foto: ${operator.name}`} className="w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-ink truncate">{operator.name}</h3>
          <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">{operator.tag}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {operator.category || "Categoria não informada"}
          </p>
          <p className="mt-1 font-mono-safe text-xs text-muted">
            {startLabel ? `Início: ${startLabel}` : "Início não informado"}
          </p>
        </div>
      </div>

      <form action={removeOperatorAction}>
        <input type="hidden" name="operatorId" value={operator.id} />
        <button
          type="submit"
          className="font-mono-safe text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          Remover operador
        </button>
      </form>

      <div className="border-t border-line pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
            Equipamentos
          </p>
          <span className="font-mono-safe text-xs text-muted">
            Equipamentos: {operator.equipment.length}/{MAX_EQUIPMENT_PER_OPERATOR}
          </span>
        </div>

        {operator.equipment.length > 0 && (
          <ul className="mt-3 grid gap-3">
            {operator.equipment.map((item) => (
              <li key={item.id} className="border border-line bg-surface-2 p-3">
                <div className="flex gap-3">
                  <PhotoTile photo={item.photo} label={`Foto: ${item.name}`} className="w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                    {item.brand && (
                      <p className="font-mono-safe text-[11px] uppercase tracking-widest text-muted">
                        {item.brand}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-1 text-xs text-ink-soft break-words">{item.description}</p>
                    )}
                  </div>
                </div>
                <form action={removeEquipmentAction} className="mt-2">
                  <input type="hidden" name="operatorId" value={operator.id} />
                  <input type="hidden" name="equipmentId" value={item.id} />
                  <button
                    type="submit"
                    className="font-mono-safe text-[11px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
                  >
                    Remover
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3">
          {operator.equipment.length < MAX_EQUIPMENT_PER_OPERATOR ? (
            <AddEquipmentForm operatorId={operator.id} />
          ) : (
            <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-3 py-2">
              Limite de {MAX_EQUIPMENT_PER_OPERATOR} equipamentos atingido.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
