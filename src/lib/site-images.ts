// Prototype data store for the site-wide image admin: a single source of
// truth listing every placeholder photo slot across the public site (Nav
// logo included) plus the in-memory values uploaded for them. Same
// prototype-grade pattern as roster-data.ts / agenda-data.ts: module-level
// state mutated directly from Server Actions.
//
// TODO (production): replace this module-level Map with real object storage
// (e.g. Supabase Storage), persisting only the resulting URL against a real
// table instead of the base64 data URI kept in memory here. This mock:
//   - is NOT persisted and resets whenever the server restarts
//   - is NOT safe for multiple server instances
//   - stores photos as base64 data URIs in memory (see the TODO in
//     src/lib/photo-upload.ts) instead of URLs pointing at real object
//     storage — that alone is reason enough to not use this in production,
//     since a handful of photos can bloat server memory significantly

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
  { key: "home.pillar.escola", label: "Foto: treinamento da escola", group: "Início", ratio: "square" },

  { key: "o-complexo.hero", label: "Foto: entrada do Complexo Safe Works", group: "O Complexo", ratio: "portrait" },
  { key: "o-complexo.operacao.campo", label: "Foto: campo de jogo", group: "O Complexo", ratio: "square" },
  { key: "o-complexo.operacao.oficina", label: "Foto: oficina", group: "O Complexo", ratio: "square" },
  { key: "o-complexo.operacao.loja", label: "Foto: loja", group: "O Complexo", ratio: "square" },
  { key: "o-complexo.operacao.escola", label: "Foto: aula da escola tática", group: "O Complexo", ratio: "square" },

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

  { key: "escola.hero", label: "Foto: turma da escola tática", group: "Escola Tática", ratio: "portrait" },
  { key: "escola.eixo.seguranca", label: "Foto: instrução de manuseio seguro", group: "Escola Tática", ratio: "square" },
  { key: "escola.eixo.tecnica", label: "Foto: treino de técnica individual", group: "Escola Tática", ratio: "square" },
  { key: "escola.eixo.tatica", label: "Foto: treino tático em equipe", group: "Escola Tática", ratio: "square" },

  { key: "regras.equipamento", label: "Foto: equipamento de proteção completo", group: "Central de Regras", ratio: "wide" },

  { key: "contato.localizacao", label: "Foto: fachada / localização do Complexo", group: "Contato", ratio: "video" },
];

const SLOT_KEYS = new Set(SITE_IMAGE_SLOTS.map((s) => s.key));

const SITE_IMAGES = new Map<string, string>(); // slot key -> base64 data URI

export function isKnownSiteImageSlot(key: string): boolean {
  return SLOT_KEYS.has(key);
}

/** Returns the saved photo (data URI) for a slot, or null if none was uploaded yet. */
export function getSiteImage(key: string): string | null {
  return SITE_IMAGES.get(key) ?? null;
}

/** Saves a photo for a known slot. No-op (never silently creates new slots) if the key isn't in SITE_IMAGE_SLOTS. */
export function setSiteImage(key: string, dataUri: string): void {
  if (!isKnownSiteImageSlot(key)) return;
  SITE_IMAGES.set(key, dataUri);
}

export function clearSiteImage(key: string): void {
  SITE_IMAGES.delete(key);
}
