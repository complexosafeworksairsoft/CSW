import Link from "next/link";
import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import Hero from "@/components/Hero";
import SiteImage from "@/components/SiteImage";

export const metadata: Metadata = {
  title: "Contato | Safe Works",
  description:
    "Fale com o Complexo Safe Works em Mossoró/RN: WhatsApp, Instagram @cswairsoft e formulário de contato.",
};

export default function ContatoPage() {
  return (
    <>
      <Hero
        eyebrow="Contato"
        title="Fale com o Complexo"
        subtitle="Dúvidas sobre partida, oficina, loja ou treinamentos — encontre o canal certo abaixo ou escreva direto pelo formulário."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <SiteImage slotKey="contato.localizacao" label="Foto: fachada / localização do Complexo" ratio="video" />
            <div>
              <p className="eyebrow">Localização</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                Mossoró / RN
              </h2>
              <p className="mt-2 text-sm text-ink-soft max-w-sm">
                R. Tancredo de Almeida Neves - Dom Jaime Câmara, Mossoró - RN,
                59628-340.
              </p>
            </div>

            <div className="border-t border-line pt-6">
              <p className="eyebrow">WhatsApp</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-display text-xl font-semibold text-ink">
                  (00) 00000-0000
                </span>
                <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent px-2.5 py-1 rounded-sm font-mono-safe text-xs uppercase tracking-widest whitespace-nowrap">
                  A confirmar
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft max-w-sm">
                Número oficial do Complexo ainda será publicado aqui, com link
                direto para conversa no WhatsApp.
              </p>
            </div>

            <div className="border-t border-line pt-6">
              <p className="eyebrow">Instagram</p>
              <a
                href="https://instagram.com/cswairsoft"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-display text-xl font-semibold text-ink hover:text-accent"
              >
                @cswairsoft
              </a>
              <p className="mt-2 text-sm text-ink-soft max-w-sm">
                Bastidores do campo, oficina, loja e treinamentos, além de avisos
                de agenda.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Formulário</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
              Escreva para a gente
            </h2>
            <p className="mt-2 text-sm text-ink-soft max-w-md">
              Preencha abaixo e retornaremos pelo canal informado. Para uma
              resposta mais rápida, use o WhatsApp ou o Instagram.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-soft">
            Prefere entender as regras antes de marcar sua primeira partida?
          </p>
          <Link
            href="/regras"
            className="font-mono-safe text-sm uppercase tracking-widest border border-line-strong px-4 py-2.5 rounded-sm text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
          >
            Central de Regras
          </Link>
        </div>
      </section>
    </>
  );
}
