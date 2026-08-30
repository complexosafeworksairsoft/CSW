import type { ReactNode } from "react";
import type { Equipment } from "@/lib/roster-data";

function SpecSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-l-4 border-accent bg-surface p-5 sm:p-6">
      <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">{title}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SpecField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono-safe text-[11px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value || "Não informado"}</p>
    </div>
  );
}

function listOrNone(items: string[]): string {
  return items.length > 0 ? items.join(" · ") : "Não informado";
}

/**
 * Read-only equipment spec cards — same visual language as the dossier page
 * (src/app/conta/(protected)/ficha/page.tsx), shared so a public operator's
 * loadout (src/app/operadores/[operatorId]/page.tsx) renders identically to
 * what the operator sees on their own dossier.
 */
export default function EquipmentSpecSheet({ items }: { items: Equipment[] }) {
  if (items.length === 0) {
    return <p className="bg-surface p-6 text-sm text-muted">Nenhum equipamento cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-px bg-line">
      {items.map((item) => (
        <div key={item.id} className="bg-surface p-5 sm:p-6">
          <p className="font-display text-lg font-semibold text-ink">{item.name}</p>
          {item.brand && (
            <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">{item.brand}</p>
          )}
          {item.description && <p className="mt-1 text-sm text-ink-soft">{item.description}</p>}

          <div className="mt-4 grid gap-px bg-line border border-line">
            <SpecSection title="1. Plataforma Base e Propulsão">
              <SpecField label="Classe da Arma" value={item.weaponClass ?? ""} />
              <SpecField label="Sistema de Propulsão" value={item.propulsion ?? ""} />
            </SpecSection>

            <SpecSection title="2. Ópticas e Miras">
              <SpecField label="Red Dots e Holográficas" value={listOrNone(item.optics)} />
              <SpecField label="Lunetas e Magnifiers" value={listOrNone(item.scopes)} />
            </SpecSection>

            <SpecSection title="3. Acessórios Externos e Modificações">
              <SpecField label="Luz e Laser" value={listOrNone(item.lightsLasers)} />
              <SpecField label="Dispositivos de Cano" value={listOrNone(item.muzzleDevices)} />
              <SpecField label="Coronhas" value={listOrNone(item.stocks)} />
            </SpecSection>

            <SpecSection title="4. Internos, Setup e Performance">
              <SpecField label="Relação de Engrenagens" value={item.gearRatio ?? ""} />
              <SpecField label="Tipo do Motor" value={item.motorType ?? ""} />
              <SpecField label="Tamanho do Eixo" value={item.shaftSize ?? ""} />
              <SpecField label="Bateria Utilizada" value={item.battery ?? ""} />
              <SpecField label="Gramatura de BBs" value={item.bbWeight ?? ""} />
            </SpecSection>
          </div>
        </div>
      ))}
    </div>
  );
}
