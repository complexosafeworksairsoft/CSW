import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { readUserSessionId } from "@/lib/user-session";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta | Safe Works",
  description: "Crie sua conta pessoal no Complexo Safe Works.",
};

export default async function ContaCadastroPage() {
  const userId = await readUserSessionId();
  if (userId) {
    redirect("/conta");
  }

  return (
    <section className="relative overflow-hidden bg-olive-deep text-[#F0EBDB]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(75,83,32,0.35) 27px, rgba(75,83,32,0.35) 28px), repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(75,83,32,0.25) 27px, rgba(75,83,32,0.25) 28px)",
        }}
      />
      <div className="relative mx-auto max-w-md px-4 py-20 sm:px-6 sm:py-28">
        <span className="inline-flex items-center gap-2 font-mono-safe text-xs uppercase tracking-widest text-white border border-[#F0EBDB]/35 px-3 py-1 rounded-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Minha conta
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl text-[#F6F2E4]">
          Criar conta
        </h1>
        <p className="mt-3 text-white">
          Cadastre-se para solicitar entrada em uma das equipes do Complexo
          Safe Works.
        </p>

        <div className="mt-8 bg-surface border border-[#F0EBDB]/15 rounded-sm p-6 sm:p-8 text-ink">
          <RegisterForm />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/conta/login"
            className="font-mono-safe text-xs uppercase tracking-widest text-muted hover:text-accent"
          >
            Já tem conta? Entrar
          </Link>
        </div>
      </div>
    </section>
  );
}
