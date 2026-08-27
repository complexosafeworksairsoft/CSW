// Prototype data store for exclusive team-portal content (briefings and
// internal announcements). Static mock data — no mutation needed here.
//
// TODO (production): move this to a real database (Supabase, per the
// project brief) so the Complexo's admin can publish new briefings and
// comunicados without a code change.

export type ContentItem = {
  id: string;
  date: string; // "AAAA-MM-DD"
  kind: "briefing" | "comunicado";
  title: string;
  body: string;
};

export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: "briefing-poeira-vermelha",
    date: "2026-09-25",
    kind: "briefing",
    title: "Briefing — Operação Poeira Vermelha",
    body: "Cenário: disputa por três pontos de controle distribuídos entre os setores 1, 2 e 3. Reabastecimento (BB e água) liberado apenas nos pontos marcados no mapa entregue na chegada. Respawn escalonado a cada 15 minutos nas primeiras duas horas, depois passa a ser por eliminação de setor. Uso de fumaça tática liberado nos pontos de controle. Equipes devem indicar um líder de esquadrão no check-in.",
  },
  {
    id: "comunicado-manutencao-setor-2",
    date: "2026-09-12",
    kind: "comunicado",
    title: "Manutenção programada no Setor 2",
    body: "O Setor 2 passará por manutenção de trincheiras e reforço de barreiras entre os dias 14 e 18/09. A operação Linha Seca (06/09) não é afetada. Times com treinos particulares agendados para essa janela devem remarcar diretamente com a administração do Complexo.",
  },
  {
    id: "briefing-vento-norte",
    date: "2026-09-08",
    kind: "briefing",
    title: "Briefing — Operação Vento Norte",
    body: "Formato domínio de bandeira em campo aberto, Trilha Norte. Duas bandeiras a capturar e sustentar por 5 minutos ininterruptos. Vegetação alta em parte do trajeto — recomenda-se réplica com alcance reduzido para os corredores mais fechados. Ponto de encontro às 13:30 para sorteio de lados.",
  },
  {
    id: "comunicado-regras-noturno",
    date: "2026-08-30",
    kind: "comunicado",
    title: "Atualização das regras para operações noturnas",
    body: "A partir da Operação Noturna Coruja, toda réplica utilizada em eventos noturnos deve portar iluminação tática (lanterna ou trilho com fixação) para identificação de posição pelos organizadores. Réplicas sem iluminação serão remanejadas para função de apoio em base. Dúvidas: falar com a organização antes do briefing.",
  },
];

export function getContentSorted(): ContentItem[] {
  return [...CONTENT_ITEMS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
