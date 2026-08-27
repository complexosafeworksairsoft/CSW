import Link from "next/link";

const PILLARS = [
  {
    tag: "campo",
    title: "Campo de Jogo",
    desc: "Partidas e operações de airsoft em terreno preparado, com regras claras de segurança.",
    href: "/campo",
  },
  {
    tag: "oficina",
    title: "Oficina",
    desc: "Manutenção e customização de réplicas, com equipe técnica própria.",
    href: "/oficina",
  },
  {
    tag: "loja",
    title: "Loja",
    desc: "Equipamentos, proteção e acessórios táticos para jogar com segurança.",
    href: "/loja",
  },
  {
    tag: "escola",
    title: "Escola Tática",
    desc: "Treinamento de técnica, segurança e tática para todos os níveis.",
    href: "/escola",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-olive-deep text-[#F0EBDB]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(75,83,32,0.35) 27px, rgba(75,83,32,0.35) 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(75,83,32,0.25) 27px, rgba(75,83,32,0.25) 28px)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 font-mono-safe text-xs uppercase tracking-widest text-[#D8D2B8] border border-[#F0EBDB]/35 px-3 py-1 rounded-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Mossoró / RN
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-6xl max-w-2xl text-[#F6F2E4]">
            Complexo Safe Works
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#CFC9AE]">
            Campo, oficina, loja e escola de airsoft reunidos em um único endereço.
            Jogue, aprenda e equipe-se em segurança.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/campo"
              className="bg-accent text-[#231400] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Conhecer o campo
            </Link>
            <Link
              href="/regras"
              className="border border-[#F0EBDB]/35 px-5 py-3 rounded-sm hover:border-accent hover:text-accent transition-colors"
            >
              Central de regras
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">As quatro frentes</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Um complexo, quatro operações
        </h2>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group bg-surface p-6 hover:bg-surface-2 transition-colors"
            >
              <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                {p.tag}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
              <span className="mt-4 inline-block text-sm font-medium text-olive-deep group-hover:text-accent">
                Saiba mais →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Portal de equipes</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink max-w-lg">
              Sua equipe tem agenda e conteúdo exclusivo
            </h2>
            <p className="mt-3 max-w-lg text-ink-soft">
              Esquadrões cadastrados acompanham datas de partidas, confirmam presença
              e acessam briefings e comunicados internos em um espaço próprio.
            </p>
          </div>
          <Link
            href="/equipes"
            className="justify-self-start lg:justify-self-end border border-line-strong px-5 py-3 rounded-sm font-mono-safe text-sm uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
          >
            Acessar portal
          </Link>
        </div>
      </section>
    </>
  );
}
