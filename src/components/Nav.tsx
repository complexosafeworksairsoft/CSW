"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PhotoTile from "@/components/PhotoTile";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/o-complexo", label: "Complexo Safe Works" },
  { href: "/campo", label: "Campo de Jogo" },
  { href: "/oficina", label: "Oficina Mecânica" },
  { href: "/loja", label: "Loja" },
  { href: "/treinamentos", label: "Treinamentos Táticos" },
  { href: "/regras", label: "Central de Regras" },
  { href: "/operadores", label: "Operadores" },
  { href: "/contato", label: "Contato" },
];

export default function Nav({ logoPhoto }: { logoPhoto: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-olive-deep text-[#F0EBDB]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <PhotoTile
            photo={logoPhoto}
            label="Logo do Complexo Safe Works"
            ratio="square"
            className="h-8 w-8 shrink-0"
          />
          <span className="font-display text-lg font-semibold tracking-wide sm:text-xl">
            SAFE WORKS
          </span>
        </Link>

        <nav
          className="hidden lg:flex items-center gap-0.5 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-2 py-2 text-[13px] font-medium tracking-wide transition-colors lg:px-2.5 lg:text-sm ${
                  active
                    ? "text-accent"
                    : "text-white hover:text-[#F6F2E4]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex shrink-0 items-center gap-2">
          <Link
            href="/conta"
            className="whitespace-nowrap font-mono-safe text-xs uppercase tracking-widest text-white hover:text-accent transition-colors px-2"
          >
            Minha Conta
          </Link>
          <Link
            href="/equipes"
            className="whitespace-nowrap font-mono-safe text-xs uppercase tracking-widest border border-[#F0EBDB]/35 px-3 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Portal de Equipes
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Abrir menu"
          className="lg:hidden inline-flex flex-col justify-center gap-1.5 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-[#F0EBDB]/15 px-4 pb-4 pt-2 flex flex-col">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-2.5 text-sm font-medium border-b border-[#F0EBDB]/10 ${
                pathname === link.href ? "text-accent" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/conta"
            onClick={() => setOpen(false)}
            className="mt-3 py-2.5 text-sm font-medium text-white text-center border-b border-[#F0EBDB]/10"
          >
            Minha Conta
          </Link>
          <Link
            href="/equipes"
            onClick={() => setOpen(false)}
            className="mt-3 font-mono-safe text-xs uppercase tracking-widest border border-[#F0EBDB]/35 px-3 py-2.5 rounded-sm text-center"
          >
            Portal de Equipes
          </Link>
        </nav>
      )}
    </header>
  );
}
