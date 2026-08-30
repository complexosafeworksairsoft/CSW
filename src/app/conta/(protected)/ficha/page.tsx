import type { Metadata } from "next";
import type { ReactNode } from "react";
import PrintButton from "@/components/PrintButton";
import { readUserSessionId } from "@/lib/user-session";
import { findUserById } from "@/lib/users";
import { getEquipment, getOperatorByUserId } from "@/lib/roster-data";
import { getSafetyInfo } from "@/lib/safety-info";
import { findTeamById } from "@/lib/teams";

export const metadata: Metadata = {
  title: "Ficha de Inscrição | Safe Works",
  description: "Dossiê do operador: identificação, dados de segurança e armamento cadastrado.",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Não informado";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function DossierHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-olive-deep px-6 py-6 sm:px-8 sm:py-8 text-[#F0EBDB]">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-white/80">{subtitle}</p>
    </div>
  );
}

function DossierSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-l-4 border-accent bg-surface p-5 sm:p-6">
      <p className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">{title}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function DossierField({ label, value }: { label: string; value: string }) {
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

export default async function FichaInscricaoPage() {
  const userId = await readUserSessionId();
  if (!userId) return null; // o layout já redireciona antes de chegar aqui

  const [user, operator, safetyInfo] = await Promise.all([
    findUserById(userId),
    getOperatorByUserId(userId),
    getSafetyInfo(userId),
  ]);

  const [team, equipmentList] = await Promise.all([
    operator?.teamId ? findTeamById(operator.teamId) : Promise.resolve(null),
    operator ? getEquipment(operator.id) : Promise.resolve([]),
  ]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 print:px-0 print:py-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-ink-soft">
          Dossiê gerado a partir dos dados que você preencheu em Minha Conta.
        </p>
        <PrintButton />
      </div>

      <div className="mt-4 border border-line print:border-0">
        <DossierHeader title="Ficha de Inscrição" subtitle="Dossiê do Operador — Informações Essenciais" />

        <div className="grid gap-px bg-line">
          <DossierSection title="A. Identificação Tática e Básica">
            <DossierField label="Callsign / Nome de Guerra" value={operator?.tag ?? ""} />
            <DossierField label="Nome Completo" value={operator?.name ?? user?.displayName ?? ""} />
            <DossierField label="Data de Nascimento" value={formatDate(safetyInfo.birthDate)} />
            <DossierField label="Cidade / Bairro (Região)" value={safetyInfo.city} />
            <DossierField label="Equipe" value={team?.teamName ?? "Sem equipe"} />
          </DossierSection>

          <DossierSection title="B. Dados Vitais e de Emergência">
            <DossierField label="Tipo Sanguíneo e Fator Rh" value={safetyInfo.bloodType ?? ""} />
            <DossierField label="Alergias ou Condições Médicas" value={safetyInfo.medicalConditions} />
            <DossierField
              label="Contato de Emergência"
              value={
                safetyInfo.emergencyContactName || safetyInfo.emergencyContactPhone
                  ? `${safetyInfo.emergencyContactName || "?"} · ${safetyInfo.emergencyContactPhone || "?"}`
                  : ""
              }
            />
          </DossierSection>
        </div>
      </div>

      <div className="mt-10 border border-line print:mt-8 print:border-0 print:break-before-page">
        <DossierHeader
          title="Ficha de Armamento e Equipamento"
          subtitle="Catálogo Padronizado de Loadout do Operador"
        />

        {equipmentList.length === 0 ? (
          <p className="bg-surface p-6 text-sm text-muted">Nenhum equipamento cadastrado ainda.</p>
        ) : (
          <div className="grid gap-px bg-line">
            {equipmentList.map((item) => (
              <div key={item.id} className="bg-surface p-5 sm:p-6">
                <p className="font-display text-lg font-semibold text-ink">{item.name}</p>
                {item.brand && (
                  <p className="font-mono-safe text-xs uppercase tracking-widest text-accent">{item.brand}</p>
                )}
                {item.description && <p className="mt-1 text-sm text-ink-soft">{item.description}</p>}

                <div className="mt-4 grid gap-px bg-line border border-line">
                  <DossierSection title="1. Plataforma Base e Propulsão">
                    <DossierField label="Classe da Arma" value={item.weaponClass ?? ""} />
                    <DossierField label="Sistema de Propulsão" value={item.propulsion ?? ""} />
                  </DossierSection>

                  <DossierSection title="2. Ópticas e Miras">
                    <DossierField label="Red Dots e Holográficas" value={listOrNone(item.optics)} />
                    <DossierField label="Lunetas e Magnifiers" value={listOrNone(item.scopes)} />
                  </DossierSection>

                  <DossierSection title="3. Acessórios Externos e Modificações">
                    <DossierField label="Luz e Laser" value={listOrNone(item.lightsLasers)} />
                    <DossierField label="Dispositivos de Cano" value={listOrNone(item.muzzleDevices)} />
                    <DossierField label="Coronhas" value={listOrNone(item.stocks)} />
                  </DossierSection>

                  <DossierSection title="4. Internos, Setup e Performance">
                    <DossierField label="Relação de Engrenagens" value={item.gearRatio ?? ""} />
                    <DossierField label="Tipo do Motor" value={item.motorType ?? ""} />
                    <DossierField label="Tamanho do Eixo" value={item.shaftSize ?? ""} />
                    <DossierField label="Bateria Utilizada" value={item.battery ?? ""} />
                    <DossierField label="Gramatura de BBs" value={item.bbWeight ?? ""} />
                  </DossierSection>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
