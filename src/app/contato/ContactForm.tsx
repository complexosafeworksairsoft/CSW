"use client";

import { useState, type FormEvent } from "react";

type FormState = {
  nome: string;
  contato: string;
  assunto: string;
  mensagem: string;
};

const ASSUNTOS = [
  "Agendar partida no campo",
  "Orçamento na oficina",
  "Dúvida sobre a loja",
  "Treinamentos táticos",
  "Outro assunto",
];

const initialState: FormState = {
  nome: "",
  contato: "",
  assunto: ASSUNTOS[0],
  mensagem: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    field: keyof FormState,
  ): (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: este formulário ainda não está conectado a nenhum backend ou serviço de
    // envio real — falta ligar a um endpoint (ex: rota de API + e-mail) ou trocar
    // este submit por um deep link do WhatsApp (wa.me) com a mensagem preenchida.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-surface border border-line p-6 rounded-sm">
        <p className="font-display text-lg font-semibold text-ink">
          Mensagem preenchida.
        </p>
        <p className="mt-2 text-sm text-ink-soft max-w-md">
          Este formulário ainda é um protótipo de interface e não está conectado a
          nenhum canal de envio real. Para falar com a gente agora, use o WhatsApp
          ou o Instagram indicados nesta página.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState);
            setSubmitted(false);
          }}
          className="mt-4 text-sm font-medium text-olive-deep hover:text-accent"
        >
          ← Preencher novamente
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line p-6 rounded-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Nome</span>
          <input
            type="text"
            required
            value={form.nome}
            onChange={handleChange("nome")}
            placeholder="Seu nome"
            className="border border-line-strong bg-surface-2 px-3 py-2.5 rounded-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">E-mail ou telefone</span>
          <input
            type="text"
            required
            value={form.contato}
            onChange={handleChange("contato")}
            placeholder="Como podemos te responder"
            className="border border-line-strong bg-surface-2 px-3 py-2.5 rounded-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Assunto</span>
          <select
            value={form.assunto}
            onChange={handleChange("assunto")}
            className="border border-line-strong bg-surface-2 px-3 py-2.5 rounded-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {ASSUNTOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-ink">Mensagem</span>
          <textarea
            required
            rows={5}
            value={form.mensagem}
            onChange={handleChange("mensagem")}
            placeholder="Conte um pouco do que você precisa"
            className="border border-line-strong bg-surface-2 px-3 py-2.5 rounded-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-y"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 bg-accent text-[#231400] font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
      >
        Enviar mensagem
      </button>
      <p className="mt-3 font-mono-safe text-xs text-muted">
        Formulário em fase de integração — nenhum dado é enviado ainda.
      </p>
    </form>
  );
}
