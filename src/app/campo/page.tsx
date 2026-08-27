import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Campo de Jogo | Safe Works",
  description:
    "Partidas de airsoft em terreno preparado, com briefing de segurança, arbitragem e regras claras. Conheça o campo do Complexo Safe Works em Mossoró/RN.",
};

function Confirmar() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent px-2.5 py-1 rounded-sm font-mono-safe text-xs uppercase tracking-widest whitespace-nowrap">
      A confirmar
    </span>
  );
}

const ETAPAS = [
  {
    n: "01",
    title: "Chegada e check-in",
    desc: "Cadastro do jogador, conferência do equipamento de proteção e assinatura do termo de responsabilidade.",
  },
  {
    n: "02",
    title: "Briefing de segurança",
    desc: "Antes de qualquer partida, arbitragem e jogadores revisam as regras do dia, os limites do terreno e o modo de jogo.",
  },
  {
    n: "03",
    title: "Divisão de times e cenário",
    desc: "Formação dos esquadrões, explicação do objetivo da partida e liberação para a área de jogo.",
  },
  {
    n: "04",
    title: "Partida em campo",
    desc: "Rodadas conduzidas com arbitragem presente, sinalização de acerto e paradas de segurança quando necessário.",
  },
  {
    n: "05",
    title: "Debriefing e encerramento",
    desc: "Conversa pós-jogo sobre o que funcionou, devolução de equipamento emprestado e liberação da área.",
  },
];

const PRINCIPIOS = [
  {
    title: "Proteção ocular sempre",
    desc: "Óculos de proteção balística é item obrigatório em qualquer ponto da área de jogo — sem exceção, mesmo fora de partida.",
  },
  {
    title: "Distância mínima de engajamento",
    desc: "Existe uma distância mínima para engajar um alvo em segurança, que muda conforme a potência da réplica. O valor aplicado no campo:",
    confirmar: true,
  },
  {
    title: "Limite de potência (FPS)",
    desc: "Toda réplica é testada no cronógrafo antes de entrar em campo. O limite de potência praticado no Complexo:",
    confirmar: true,
  },
  {
    title: "Arbitragem ativa",
    desc: "Árbitros acompanham a partida do início ao fim, com autoridade para parar o jogo, aplicar penalidades ou remover um jogador em caso de conduta insegura.",
  },
];

export default function CampoPage() {
  return (
    <>
      <Hero
        eyebrow="Campo de jogo"
        title="Terreno preparado, regras claras, arbitragem em campo"
        subtitle="Partidas de airsoft conduzidas do início ao fim: check-in, briefing, cenário, jogo e debriefing. Nada de improviso na hora de falar de segurança."
        actions={
          <>
            <Link
              href="/regras"
              className="bg-accent text-[#231400] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Ver Central de Regras
            </Link>
            <Link
              href="/contato"
              className="border border-[#F0EBDB]/35 px-5 py-3 rounded-sm hover:border-accent hover:text-accent transition-colors"
            >
              Agendar uma partida
            </Link>
          </>
        }
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Como funciona</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Um dia de jogo no Safe Works
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          A estrutura de uma partida segue sempre a mesma lógica, independente do
          cenário do dia — isso é o que permite que iniciantes e veteranos joguem
          lado a lado com segurança.
        </p>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-5">
          {ETAPAS.map((e) => (
            <div key={e.n} className="bg-surface p-6">
              <span className="font-mono-safe text-xs text-accent">{e.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                {e.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Galeria</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          O terreno de jogo
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <ImagePlaceholder label="Foto: cenário do campo" ratio="portrait" />
          <ImagePlaceholder label="Foto: partida em andamento" ratio="portrait" />
          <ImagePlaceholder label="Foto: equipe de arbitragem" ratio="portrait" />
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Princípios de segurança</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            O que sustenta o jogo em campo
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Estes são princípios gerais do airsoft como esporte, aplicados aqui de
            forma prática. Números específicos do Complexo (potência praticada,
            distância mínima de engajamento) ainda serão publicados na Central de
            Regras assim que confirmados.
          </p>
          <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2">
            {PRINCIPIOS.map((p) => (
              <div key={p.title} className="bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {p.title}
                  </h3>
                  {p.confirmar && <Confirmar />}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Valores e agendamento</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Quanto custa jogar
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          A tabela de valores por partida, pacotes para grupos e aluguel de
          equipamento (para quem ainda não tem réplica própria) está em definição.
          Fale com a gente para confirmar disponibilidade de agenda e valores
          atualizados.
        </p>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-3">
          {[
            { title: "Diária de jogo", desc: "Acesso a uma sessão de partidas no dia agendado." },
            { title: "Aluguel de equipamento", desc: "Réplica, proteção e uniforme para quem está começando." },
            { title: "Pacote para grupos", desc: "Condições para equipes e eventos fechados." },
          ].map((item) => (
            <div key={item.title} className="bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <Confirmar />
              </div>
              <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/contato"
            className="inline-block bg-olive-deep text-[#F0EBDB] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            Falar sobre agendamento
          </Link>
        </div>
      </section>
    </>
  );
}
