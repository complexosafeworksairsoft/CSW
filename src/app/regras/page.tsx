import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Central de Regras | Safe Works",
  description:
    "Equipamento obrigatório, regras de segurança e conduta em campo, o que levar e perguntas frequentes sobre airsoft no Complexo Safe Works.",
};

function Confirmar() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent px-2.5 py-1 rounded-sm font-mono-safe text-xs uppercase tracking-widest whitespace-nowrap">
      A confirmar
    </span>
  );
}

const EQUIPAMENTO = [
  {
    title: "Óculos de proteção balística",
    desc: "Obrigatório em qualquer ponto da área de jogo, inclusive fora de partida. Óculos de sol comuns não substituem proteção balística.",
    critico: true,
  },
  {
    title: "Proteção de rosto/boca",
    desc: "Recomendada fortemente para todos os jogadores; pode ser exigida em modalidades ou distâncias específicas de jogo.",
  },
  {
    title: "Vestimenta adequada",
    desc: "Manga comprida e calça longa reduzem o impacto de acertos na pele. Botas fechadas para o terreno do campo.",
  },
  {
    title: "Réplica dentro do limite de potência",
    desc: "Toda réplica passa por teste de cronógrafo antes de entrar em campo. Limite de potência praticado:",
    confirmar: true,
  },
];

const CONDUTA = [
  {
    title: "Distância mínima de engajamento (MED)",
    desc: "Regra que define a distância mínima para atirar em um alvo, reduzindo o impacto do disparo em curta distância. Valor aplicado no Complexo:",
    confirmar: true,
  },
  {
    title: "Chamar o acerto",
    desc: "Quem é atingido declara o acerto em voz alta (\"acertei\") e sai de jogo imediatamente, levantando a arma ou sinalizando conforme orientado no briefing.",
  },
  {
    title: "Cessar-fogo",
    desc: "Ao ouvir \"cessar-fogo\", todo mundo para de atirar e se movimenta imediatamente na área, até a arbitragem liberar a continuidade.",
  },
  {
    title: "Trava e cano coberto fora de jogo",
    desc: "Em zona segura e fora de partida, a réplica permanece travada e com o cano coberto ou apontado para o chão.",
  },
  {
    title: "Autoridade da arbitragem",
    desc: "O árbitro tem palavra final sobre qualquer disputa em campo. Discussões são resolvidas depois da partida, não durante.",
  },
  {
    title: "Zero tolerância a conduta insegura",
    desc: "Mirar de forma proposital em quem já saiu de jogo, remover proteção em área de jogo ou desrespeitar a arbitragem resulta em remoção da partida.",
  },
];

const LEVAR = [
  "Documento de identificação",
  "Roupa apropriada para terreno externo (manga comprida recomendada)",
  "Água e hidratação para o dia todo de jogo",
  "Óculos de proteção balística, se já tiver o próprio",
  "Protetor solar e boné/chapéu para os intervalos",
  "Muda de roupa, se pretender ficar até o fim do dia",
];

const FAQ = [
  {
    q: "Airsoft dói?",
    a: "Um acerto de BB pode causar uma ferroada momentânea, comparável a uma beliscada forte, principalmente em pele exposta. Com o equipamento de proteção correto e roupas adequadas, o desconforto é mínimo — e é exatamente por isso que o equipamento é obrigatório.",
  },
  {
    q: "Preciso ter equipamento próprio para jogar?",
    a: "Não. É possível jogar com equipamento de proteção e réplica fornecidos pelo Complexo. Ter o próprio equipamento é uma vantagem para quem joga com frequência, mas não é pré-requisito para a primeira partida.",
  },
  {
    q: "Qual a idade mínima para jogar?",
    a: "A idade mínima e as condições para menores de idade (como autorização de responsável) ainda serão publicadas nesta página.",
    confirmar: true,
  },
  {
    q: "Preciso de experiência prévia?",
    a: "Não. Todo jogador passa por um briefing de segurança antes da primeira partida, e a Escola Tática oferece turmas específicas para iniciantes.",
  },
  {
    q: "O que acontece se eu for atingido?",
    a: "Você declara o acerto, sai de jogo imediatamente e se dirige à área segura combinada no briefing, sem continuar participando da rodada em andamento.",
  },
  {
    q: "Posso levar meu celular ou câmera para dentro do campo?",
    a: "Normas específicas sobre uso de celular, câmeras e redes sociais durante a partida ainda serão publicadas nesta página.",
    confirmar: true,
  },
  {
    q: "Existe alguma condição de saúde que impede jogar?",
    a: "Como em qualquer atividade física ao ar livre, condições cardíacas, respiratórias ou de mobilidade relevantes devem ser informadas antes da partida. Em caso de dúvida, converse com a equipe antes de se inscrever.",
  },
];

export default function RegrasPage() {
  return (
    <>
      <Hero
        eyebrow="Central de regras"
        title="Tudo o que você precisa saber antes de entrar em campo"
        subtitle="Equipamento obrigatório, regras de conduta, o que trazer e as perguntas mais comuns de quem está começando no airsoft."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <p className="eyebrow">Equipamento obrigatório</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              O que é exigido para entrar em campo
            </h2>
          </div>
          <ImagePlaceholder label="Foto: equipamento de proteção completo" ratio="wide" />
        </div>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2">
          {EQUIPAMENTO.map((item) => (
            <div key={item.title} className="bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                {item.confirmar && <Confirmar />}
              </div>
              <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
              {item.critico && (
                <p className="mt-3 font-mono-safe text-xs uppercase tracking-widest text-accent">
                  Sem exceções
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Regras gerais</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Segurança e conduta em campo
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Estas regras se aplicam a toda partida realizada no Complexo. Alguns
            valores específicos ainda estão em confirmação e serão publicados
            aqui assim que definidos.
          </p>
          <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2">
            {CONDUTA.map((item) => (
              <div key={item.title} className="bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  {item.confirmar && <Confirmar />}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Checklist</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              O que levar no dia
            </h2>
            <ul className="mt-6 space-y-3">
              {LEVAR.map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink-soft">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Antes de vir</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              Primeira vez em campo?
            </h2>
            <p className="mt-3 text-ink-soft">
              Se é sua primeira partida, chegue com um pouco de antecedência. O
              briefing de segurança é obrigatório para todo jogador, mesmo quem já
              tem experiência em outros campos, porque cada terreno e cada
              arbitragem tem particularidades próprias.
            </p>
            <Link
              href="/escola"
              className="mt-4 inline-block text-sm font-medium text-olive-deep hover:text-accent"
            >
              Conhecer a Escola Tática →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Perguntas frequentes</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Dúvidas comuns de quem está chegando
          </h2>
          <div className="mt-8 grid gap-px bg-line border border-line">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {item.q}
                  </h3>
                  {item.confirmar && <Confirmar />}
                </div>
                <p className="mt-2 text-sm text-ink-soft max-w-3xl">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-sm border border-line bg-surface p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-ink">
              Ainda com dúvida sobre alguma regra?
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Fale com a equipe antes da sua partida — é sempre melhor perguntar
              antes do que descobrir em campo.
            </p>
          </div>
          <Link
            href="/contato"
            className="bg-accent text-[#231400] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Fale conosco
          </Link>
        </div>
      </section>
    </>
  );
}
