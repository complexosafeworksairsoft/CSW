import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SiteImage from "@/components/SiteImage";

export const metadata: Metadata = {
  title: "Escola Tática | Safe Works",
  description:
    "Treinamento de técnica, segurança e tática de airsoft para todos os níveis. Conheça a Escola Tática do Complexo Safe Works.",
};

function Confirmar() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent px-2.5 py-1 rounded-sm font-mono-safe text-xs uppercase tracking-widest whitespace-nowrap">
      A confirmar
    </span>
  );
}

const EIXOS = [
  {
    tag: "segurança",
    title: "Manuseio seguro",
    desc: "Postura de arma, regras de dedo fora do gatilho, transporte, travas e comportamento em zona segura antes de qualquer coisa tática.",
    photo: "Foto: instrução de manuseio seguro",
    slotKey: "escola.eixo.seguranca",
  },
  {
    tag: "técnica",
    title: "Técnica individual",
    desc: "Empunhadura, mira, deslocamento, uso de cobertura e posicionamento — a base que sustenta qualquer estilo de jogo.",
    photo: "Foto: treino de técnica individual",
    slotKey: "escola.eixo.tecnica",
  },
  {
    tag: "tática",
    title: "Tática em equipe",
    desc: "Comunicação, formação de esquadrão, tomada de decisão sob pressão e leitura de cenário durante uma operação simulada.",
    photo: "Foto: treino tático em equipe",
    slotKey: "escola.eixo.tatica",
  },
];

const TURMAS = [
  {
    nivel: "Iniciante",
    desc: "Para quem nunca jogou ou joga pouco. Foco total em segurança, regras do jogo e primeiros fundamentos de manuseio e deslocamento.",
  },
  {
    nivel: "Intermediário",
    desc: "Para quem já domina o básico. Entra tática de equipe, comunicação e cenários mais próximos de uma partida real.",
  },
  {
    nivel: "Avançado",
    desc: "Para jogadores e equipes que já competem e querem refinar decisão tática, liderança de esquadrão e desempenho sob pressão.",
  },
];

export default function EscolaPage() {
  return (
    <>
      <Hero
        eyebrow="Escola tática"
        title="Aprenda a jogar antes de tentar jogar bem"
        subtitle="Treinamento de segurança, técnica e tática para quem quer entrar no airsoft com uma base sólida — ou elevar o nível de quem já joga."
        image={<SiteImage slotKey="escola.hero" label="Foto: turma da escola tática" ratio="portrait" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">O que ensinamos</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Três eixos de formação
        </h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Toda formação na escola segue a mesma ordem: primeiro segurança, depois
          técnica individual, só então tática em equipe. Ninguém pula etapa.
        </p>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-3">
          {EIXOS.map((e) => (
            <div key={e.title} className="bg-surface p-6">
              <SiteImage slotKey={e.slotKey} label={e.photo} ratio="square" className="mb-4" />
              <span className="font-mono-safe text-xs uppercase tracking-widest text-accent">
                {e.tag}
              </span>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                {e.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Estrutura</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Turmas por nível
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            As turmas são organizadas por nível de experiência, para que o ritmo da
            aula corresponda ao que cada aluno já domina.
          </p>
          <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-3">
            {TURMAS.map((t) => (
              <div key={t.nivel} className="bg-surface p-6">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {t.nivel}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Agenda e valores</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          Grade de horários em definição
        </h2>
        <div className="mt-8 grid gap-px bg-line border border-line sm:grid-cols-3">
          {[
            { title: "Instrutores", desc: "Equipe de instrução do Complexo." },
            { title: "Horários", desc: "Dias e horários das turmas por nível." },
            { title: "Valores", desc: "Mensalidade ou pacote por turma." },
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
            Entrar na lista de interesse
          </Link>
        </div>
      </section>
    </>
  );
}
