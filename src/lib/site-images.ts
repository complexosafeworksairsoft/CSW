// Site-wide image admin: a single source of truth listing every placeholder
// photo slot across the public site (Nav logo included) plus the uploaded
// photo saved for each slot.
//
// SITE_IMAGE_SLOTS below is static configuration (not data) and stays a
// plain in-code constant. Only the actual uploaded photo per slot is
// backed by Supabase (see supabase/schema.sql for the `site_images` table)
// — replaced the earlier in-memory Map, which reset on every server restart
// and was inconsistent across Vercel's serverless instances.
//
// TODO (production): photos are still stored as base64 data URIs (now in a
// `text` column instead of in memory) instead of URLs pointing at real
// object storage (e.g. Supabase Storage) — see the TODO in
// src/lib/photo-upload.ts. That's inherited from the old in-memory version,
// not fixed in this pass — a handful of photos can still bloat row/network
// size significantly; swapping it for real object storage is a separate,
// larger change.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// supabase() (src/lib/supabase.ts) is typed as `ReturnType<typeof createClient>`
// without a generated Database type, which — through a TypeScript quirk in how
// ReturnType resolves createClient's generics — makes every .insert()/.update()/
// .upsert() call type-error as accepting `never`. Re-asserting the client type
// here (this module only) sidesteps that without touching supabase.ts.
function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

export type Ratio = "video" | "square" | "portrait" | "wide";

export type SiteImageSlot = {
  key: string;
  label: string;
  group: string;
  ratio: Ratio;
};

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { key: "nav.logo", label: "Logo do Complexo Safe Works", group: "Global", ratio: "square" },

  { key: "home.hero", label: "Foto: fachada do Complexo Safe Works", group: "Início", ratio: "square" },
  { key: "home.pillar.campo", label: "Foto: campo de jogo", group: "Início", ratio: "square" },
  { key: "home.pillar.oficina", label: "Foto: bancada da oficina", group: "Início", ratio: "square" },
  { key: "home.pillar.loja", label: "Foto: vitrine da loja", group: "Início", ratio: "square" },
  { key: "home.pillar.treinamentos", label: "Foto: treinamentos táticos", group: "Início", ratio: "square" },

  { key: "o-complexo.hero", label: "Foto: entrada do Complexo Safe Works", group: "O Complexo", ratio: "portrait" },
  { key: "o-complexo.operacao.campo", label: "Foto: campo de jogo", group: "O Complexo", ratio: "square" },
  { key: "o-complexo.operacao.oficina", label: "Foto: oficina", group: "O Complexo", ratio: "square" },
  { key: "o-complexo.operacao.loja", label: "Foto: loja", group: "O Complexo", ratio: "square" },
  { key: "o-complexo.operacao.treinamentos", label: "Foto: aula de treinamentos táticos", group: "O Complexo", ratio: "square" },

  { key: "campo.galeria.1", label: "Foto: cenário do campo", group: "Campo de Jogo", ratio: "portrait" },
  { key: "campo.galeria.2", label: "Foto: partida em andamento", group: "Campo de Jogo", ratio: "portrait" },
  { key: "campo.galeria.3", label: "Foto: equipe de arbitragem", group: "Campo de Jogo", ratio: "portrait" },

  { key: "oficina.hero", label: "Foto: bancada da oficina", group: "Oficina", ratio: "portrait" },
  { key: "oficina.antes", label: "Foto: réplica antes do serviço", group: "Oficina", ratio: "video" },
  { key: "oficina.depois", label: "Foto: réplica depois do serviço", group: "Oficina", ratio: "video" },

  { key: "loja.categoria.replicas", label: "Foto: réplicas em exposição", group: "Loja", ratio: "square" },
  { key: "loja.categoria.protecao", label: "Foto: equipamento de proteção", group: "Loja", ratio: "square" },
  { key: "loja.categoria.uniformes", label: "Foto: uniformes táticos", group: "Loja", ratio: "square" },
  { key: "loja.categoria.acessorios", label: "Foto: acessórios táticos", group: "Loja", ratio: "square" },

  { key: "treinamentos.hero", label: "Foto: turma de treinamentos táticos", group: "Treinamentos Táticos", ratio: "portrait" },
  { key: "treinamentos.eixo.seguranca", label: "Foto: instrução de manuseio seguro", group: "Treinamentos Táticos", ratio: "square" },
  { key: "treinamentos.eixo.tecnica", label: "Foto: treino de técnica individual", group: "Treinamentos Táticos", ratio: "square" },
  { key: "treinamentos.eixo.tatica", label: "Foto: treino tático em equipe", group: "Treinamentos Táticos", ratio: "square" },

  { key: "regras.equipamento", label: "Foto: equipamento de proteção completo", group: "Central de Regras", ratio: "wide" },

  { key: "contato.localizacao", label: "Foto: fachada / localização do Complexo", group: "Contato", ratio: "video" },
];

const SLOT_KEYS = new Set(SITE_IMAGE_SLOTS.map((s) => s.key));

type SiteImageRow = {
  slot_key: string;
  photo: string;
};

export function isKnownSiteImageSlot(key: string): boolean {
  return SLOT_KEYS.has(key);
}

/** Returns the saved photo (data URI) for a slot, or null if none was uploaded yet. */
export async function getSiteImage(key: string): Promise<string | null> {
  const { data, error } = await db()
    .from("site_images")
    .select("photo")
    .eq("slot_key", key)
    .maybeSingle<SiteImageRow>();

  if (error || !data) return null;
  return data.photo;
}

/** Saves a photo for a known slot. No-op (never silently creates new slots) if the key isn't in SITE_IMAGE_SLOTS. */
export async function setSiteImage(key: string, dataUri: string): Promise<void> {
  if (!isKnownSiteImageSlot(key)) return;
  await db()
    .from("site_images")
    .upsert(
      { slot_key: key, photo: dataUri, updated_at: new Date().toISOString() },
      { onConflict: "slot_key" }
    );
}

export async function clearSiteImage(key: string): Promise<void> {
  await db().from("site_images").delete().eq("slot_key", key);
}
