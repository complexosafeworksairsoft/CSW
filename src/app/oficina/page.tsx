import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SiteImage from "@/components/SiteImage";

export const metadata: Metadata = {
  title: "Oficina | Safe Works",
  description:
    "Manutenção, reparo e customização de réplicas de airsoft com equipe técnica própria. Conheça a Oficina do Complexo Safe Works.",
};

function Confirmar() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent px-2.5 py-1 rounded-sm font-mono-safe text-xs uppercase tracking-widest whitespace-nowrap">
      A confirmar
    </span>
  );
}

const SERVICOS = [
  {
    tag: "manutenção",
    title: "Manutenção preventiva",
    desc: "Limpeza interna, lubrificação, revisão de gaxetas e verificação geral para manter a réplica funcionando de forma consistente e segura.",
  },
  {
    tag: "reparo",
    title: "Reparo e diagnóstico",
    desc: "Identificação de falhas de disparo, perda de potência, travamentos e problemas elétricos ou pneumáticos, com conserto da causa raiz.",
  },
  {
    tag: "upgrade",
    title: "Upgrade interno",
    desc: "Troca de gearbox, motor, hop-up, cano interno e outros componentes para ganho de precisão, consistência ou potência dentro do limite permitido em campo.",
  },
  {
    tag: "customização",
    title: "Customização externa",
    desc: "Pintura, camuflagem, acessórios táticos (trilhos, grip, coronha) e ajustes estéticos para deixar a réplica com a cara do operador.",
  },
];

const ETAPAS = [
  {
    n: "01",
    title: "Entrega da réplica",
    desc: "Você traz o equipamento até a oficina e descreve o problema ou o que deseja customizar.",
  },
  {
    n: "02",
    title: "Diagnóstico técnico",
    desc: "A equipe abre e avalia a réplica, identifica o que precisa ser feito e monta um orçamento.",
  },
  {
    n: "03",
    title: "Aprovação do orçamento",
    desc: "Você recebe o orçamento com peças e serviço antes de qualquer intervenção ser executada.",
  },
  {
    n: "04",
    title: "Execução do serviço",
    desc: "Reparo, manutenção ou upgrade é realizado pela equipe técnica, com teste de funcionamento ao final.",
  },
  {
    n: "05",
    title: "Retirada",
    desc: "Réplica testada e pronta para voltar a campo, com explicação do que foi feito.",
  },
];

export default function OficinaPage() {
  return (
    <>
      <Hero
        eyebrow="Oficina"
        title="Sua réplica nas mãos de quem entende o mecanismo"
        subtitle="Manutenção, reparo e customização de réplicas de airsoft, com equipe técnica própria e diagnóstico antes de qualquer serviço."
        actions={
          <Link
            href="/contato"
            className="bg-accent text-[#231400] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            Levar minha réplica
          </Link>
        }
        image={<SiteImage slotKey="oficina.hero" label="Foto: bancada da oficina" ratio="portrait" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">O que fazemos</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Serviços da oficina
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Da limpeza básica ao upgrade interno completo, o objetivo é sempre o
          mesmo: uma réplica que dispara de forma consistente e segura, dentro dos
          limites de potência praticados em campo.
        </p>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2">
          {SERVICOS.map((s) => (
            <div key={s.title} className="bg-surface p-6">
              <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                {s.tag}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Como funciona</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Do balcão de entrada até a retirada
          </h2>
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
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Resultado</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Antes e depois
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SiteImage slotKey="oficina.antes" label="Foto: réplica antes do serviço" ratio="video" />
            <SiteImage slotKey="oficina.depois" label="Foto: réplica depois do serviço" ratio="video" />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Valores</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Orçamento sob avaliação
          </h2>
          <div className="mt-6 max-w-2xl flex items-start justify-between gap-4 bg-surface-2 border border-line p-6 rounded-sm">
            <p className="text-ink-soft">
              Cada réplica chega com um histórico e um problema diferentes, então o
              valor do serviço é definido depois do diagnóstico técnico — nunca
              antes. A tabela de preços de serviços mais comuns (limpeza, revisão,
              troca de peças de desgaste) está em definição.
            </p>
            <Confirmar />
          </div>
          <div className="mt-6">
            <Link
              href="/contato"
              className="inline-block bg-olive-deep text-[#F0EBDB] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Pedir um orçamento
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
