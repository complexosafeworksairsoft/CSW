// Catálogo padronizado de especificações técnicas de réplica — baseado na
// "Ficha de Armamento e Equipamento Tático" fornecida pelo dono do
// Complexo. Constante compartilhada entre o formulário (AddEquipmentForm)
// e qualquer exibição futura (OperatorCard), pra manter as opções sempre
// em sincronia com uma única fonte.

export const WEAPON_CLASSES = [
  "Assault Rifle (AR)",
  "DMR (Designated Marksman Rifle)",
  "Sniper",
  "Suporte / LMG",
  "SMG / CQB",
  "Shotgun",
] as const;

export const PROPULSION_TYPES = [
  "AEG (Elétrica Padrão)",
  "GBB / GBBR (Gás Blowback)",
  "HPA (Ar Comprimido)",
  "Spring (Ação por Mola)",
  "AEP (Pistola Elétrica)",
] as const;

export const RED_DOT_OPTICS = [
  "Micro T1 / T2 Style",
  "EOTech Style (552, 558, EXPS3)",
  "Aimpoint CompM2 / M4 Style",
  "MRO Style",
  "SRS Style",
  "RMR / Docter (Mini / Backup)",
  "Nenhuma (Iron Sights)",
] as const;

export const SCOPE_OPTICS = [
  "LPVO (1-4x, 1-6x, 1-8x - Short Dot)",
  "Luneta Sniper Padrão",
  "ACOG Style (4x32 fixo)",
  "Elcan Specter Style",
  "Magnifier Rebatível (3x ou 4x)",
] as const;

export const LIGHTS_LASERS = [
  "AN/PEQ-15 (Laser/Lanterna)",
  "DBAL-A2 / A3 Style",
  "NGAL Style",
  "Lanterna Tática Longa (Scout)",
  "Lanterna Curta para Pistola",
] as const;

export const MUZZLE_DEVICES = [
  "Flash Hider Padrão (Ponta Laranja)",
  "Supressor Estético",
  "Tracer Unit (Unidade Traçante)",
  "Amplificador de Som",
] as const;

export const STOCKS = [
  "Crane Stock (Padrão M4)",
  "CTR / MOE Style",
  "PDW Style (Retrátil compacta)",
  "Coronha Fixa",
  "Folding Stock (Rebatível)",
  "Skeleton / Minimalist",
] as const;

export const GEAR_RATIOS = [
  "18:1 (Standard / Original)",
  "16:1 (High Speed leve)",
  "13:1 (Super High Speed)",
  "12:1 (Extreme High Speed)",
  "32:1 / 100:200 (High Torque)",
  "DSG (Dual Sector Gear)",
  "Não sei / Padrão de Fábrica",
] as const;

export const MOTOR_TYPES = ["Standard / Original", "High Torque", "High Speed", "Brushless Motor"] as const;

export const SHAFT_SIZES = ["Eixo Longo", "Eixo Médio", "Eixo Curto"] as const;

export const BATTERIES = ["LiPo 7.4v", "LiPo 11.1v", "Li-Ion 7.4v", "Li-Ion 11.1v", "NiMH / LiFe"] as const;

export const BB_WEIGHTS = ["0.20g / 0.23g", "0.25g / 0.28g", "0.30g / 0.32g", "0.36g / 0.40g+"] as const;

// Every equipment spec field is picked from one of the fixed lists above —
// never trust a submitted value blindly, only accept it if it's actually one
// of the known options. Shared between the team portal's equipment form
// (src/app/equipes/roster-actions.ts) and the operator's own self-service
// form (src/app/conta/actions.ts), which both write to the same `equipment`
// table.
export function readCatalogSelect(formData: FormData, key: string, options: readonly string[]): string | null {
  const value = String(formData.get(key) ?? "");
  return options.includes(value) ? value : null;
}

export function readCatalogMulti(formData: FormData, key: string, options: readonly string[]): string[] {
  return formData
    .getAll(key)
    .map((v) => String(v))
    .filter((v) => options.includes(v));
}
