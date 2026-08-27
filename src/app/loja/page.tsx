import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SiteImage from "@/components/SiteImage";

export const metadata: Metadata = {
  title: "Loja | Safe Works",
  description:
    "Réplicas, proteção, uniformes e acessórios táticos para jogar airsoft com segurança. Conheça a Loja do Complexo Safe Works.",
};

const CATEGORIAS = [
  {
    tag: "réplicas",
    title: "Réplicas",
    desc: "AEGs, GBBs e outras plataformas para os diferentes estilos de jogo, dos primeiros passos à competição.",
    photo: "Foto: réplicas em exposição",
    slotKey: "loja.categoria.replicas",
  },
  {
    tag: "proteção",
    title: "Proteção",
    desc: "Óculos balísticos, máscaras de rosto inteiro e proteção auditiva — o item que nunca deve faltar na mochila de ninguém.",
    photo: "Foto: equipamento de proteção",
    slotKey: "loja.categoria.protecao",
  },
  {
    tag: "uniformes",
    title: "Uniformes",
    desc: "Fardas, botas e luvas táticas pensadas para o terreno do campo, com durabilidade para uso frequente.",
    photo: "Foto: uniformes táticos",
    slotKey: "loja.categoria.uniformes",
  },
  {
    tag: "acessórios",
    title: "Acessórios",
    desc: "Coletes, porta-carregadores, munição (BBs), baterias, carregadores e itens de manutenção básica.",
    photo: "Foto: acessórios táticos",
    slotKey: "loja.categoria.acessorios",
  },
];

export default function LojaPage() {
  return (
    <>
      <Hero
        eyebrow="Loja"
        title="Equipar-se certo é parte de jogar seguro"
        subtitle="Réplicas, proteção, uniformes e acessórios selecionados para quem leva o airsoft a sério — do primeiro óculos de proteção ao upgrade da réplica principal."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">O que vendemos</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Categorias de equipamento
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          A curadoria da loja segue a mesma lógica do resto do Complexo: prioridade
          para equipamento de proteção, depois para tudo o que melhora a
          experiência de jogo.
        </p>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIAS.map((c) => (
            <div key={c.title} className="bg-surface p-6">
              <SiteImage slotKey={c.slotKey} label={c.photo} ratio="square" className="mb-4" />
              <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                {c.tag}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Proteção em primeiro lugar</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink max-w-2xl">
            Por que óculos de proteção vem antes de qualquer réplica
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Nenhum equipamento de proteção é opcional dentro do Complexo. Óculos
            balísticos e proteção adequada são pré-requisito para entrar em campo
            — por isso a loja mantém sempre opções de proteção em estoque,
            mesmo quando outros itens estão em falta.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl bg-surface border border-line p-6 rounded-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Como comprar</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                Venda presencial ou também online?
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Ainda estamos definindo se a loja vai operar apenas no balcão do
                Complexo ou também com catálogo e vendas pela internet. Por
                enquanto, considere a compra como presencial — atualizamos esta
                página assim que a decisão for fechada.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent px-2.5 py-1 rounded-sm font-mono-safe text-xs uppercase tracking-widest whitespace-nowrap">
              Em definição
            </span>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/contato"
            className="inline-block bg-olive-deep text-[#F0EBDB] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            Consultar disponibilidade
          </Link>
        </div>
      </section>
    </>
  );
}
