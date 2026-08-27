import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SiteImage from "@/components/SiteImage";

export const metadata: Metadata = {
  title: "O Complexo | Safe Works",
  description:
    "Conheça o Complexo Safe Works: campo de jogo, oficina, loja e escola tática de airsoft reunidos em Mossoró/RN.",
};

const OPERACOES = [
  {
    tag: "01 · campo",
    title: "Campo de Jogo",
    desc: "O coração do Complexo. Terreno preparado para partidas de airsoft, com cenários, pontos de controle e uma equipe de arbitragem que conduz cada operação.",
    href: "/campo",
    photo: "Foto: campo de jogo",
    slotKey: "o-complexo.operacao.campo",
  },
  {
    tag: "02 · oficina",
    title: "Oficina",
    desc: "Suporte técnico para quem já joga. Manutenção, reparo e customização de réplicas feitas por uma equipe que entende o equipamento por dentro.",
    href: "/oficina",
    photo: "Foto: oficina",
    slotKey: "o-complexo.operacao.oficina",
  },
  {
    tag: "03 · loja",
    title: "Loja",
    desc: "Onde o equipamento certo chega até você: réplicas, proteção, uniformes e acessórios selecionados para quem joga com responsabilidade.",
    href: "/loja",
    photo: "Foto: loja",
    slotKey: "o-complexo.operacao.loja",
  },
  {
    tag: "04 · escola",
    title: "Escola Tática",
    desc: "Formação de base e evolução técnica. Ensinamos a jogar com segurança antes de ensinar a jogar bem — nessa ordem.",
    href: "/escola",
    photo: "Foto: aula da escola tática",
    slotKey: "o-complexo.operacao.escola",
  },
];

export default function OComplexoPage() {
  return (
    <>
      <Hero
        eyebrow="Quem somos"
        title="Um complexo, não só um campo"
        subtitle="O Safe Works nasceu da constatação de que praticar airsoft a sério exige mais do que um terreno para jogar: exige equipamento confiável, gente que saiba consertá-lo e um caminho claro para quem está começando. Por isso reunimos as quatro coisas num único endereço, em Mossoró/RN."
        image={<SiteImage slotKey="o-complexo.hero" label="Foto: entrada do Complexo Safe Works" ratio="portrait" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">O que é o complexo</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink max-w-2xl">
          Airsoft tratado como esporte técnico, não como brincadeira de fim de semana
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-ink-soft">
          <p>
            O Complexo Safe Works é um espaço dedicado à prática, à manutenção e ao
            ensino de airsoft. A estética é tático-militar — cenários, farda,
            linguagem de operação — mas a condução é profissional: regras escritas,
            arbitragem presente e equipamento de proteção como pré-requisito, não
            como opcional.
          </p>
          <p>
            Isso significa que o mesmo lugar onde você joga uma partida é onde você
            leva sua réplica para revisão, onde você compra o próximo item de
            proteção que falta no seu kit, e onde — se quiser ir além de jogar por
            jogar — você aprende técnica e tática com gente que trata isso como
            ofício.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">As quatro frentes</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Um ecossistema com quatro operações
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Cada frente funciona sozinha, mas foi pensada para sustentar as
            outras três. Quem joga no campo encontra suporte na oficina e
            equipamento na loja; quem passa pela escola chega ao campo já
            treinado nos fundamentos de segurança.
          </p>
          <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4">
            {OPERACOES.map((op) => (
              <Link
                key={op.href}
                href={op.href}
                className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
              >
                <SiteImage slotKey={op.slotKey} label={op.photo} ratio="square" className="mb-4" />
                <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                  {op.tag}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                  {op.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{op.desc}</p>
                <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
                  Saiba mais →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Como pensamos segurança</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
              Segurança primeiro, tática depois
            </h2>
            <p className="mt-3 text-ink-soft">
              Airsoft envolve réplicas que disparam projéteis em alta velocidade.
              Tratamos isso com o peso que merece: proteção ocular obrigatória em
              toda área de jogo, briefing de segurança antes de cada partida e
              arbitragem ativa durante toda a operação. A Central de Regras reúne
              tudo isso em detalhe.
            </p>
            <Link
              href="/regras"
              className="mt-4 inline-block text-sm font-medium text-olive-deep hover:text-accent"
            >
              Ver Central de Regras →
            </Link>
          </div>
          <div>
            <p className="eyebrow">Para quem é o complexo</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
              De quem nunca jogou a quem já compete
            </h2>
            <p className="mt-3 text-ink-soft">
              Recebemos desde quem está pisando pela primeira vez num campo de
              airsoft até equipes que já disputam partidas com regularidade. A
              estrutura do Complexo foi desenhada para acompanhar essa jornada
              inteira, sem que o iniciante se sinta perdido nem o veterano se
              sinta limitado.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
