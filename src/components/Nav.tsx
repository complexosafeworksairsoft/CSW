"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/o-complexo", label: "O Complexo" },
  { href: "/campo", label: "Campo de Jogo" },
  { href: "/oficina", label: "Oficina" },
  { href: "/loja", label: "Loja" },
  { href: "/escola", label: "Escola Tática" },
  { href: "/regras", label: "Central de Regras" },
  { href: "/contato", label: "Contato" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-olive-deep text-[#F0EBDB]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center border border-[#F0EBDB]/35 border-dashed text-[9px] font-mono-safe uppercase tracking-tight text-[#D8D2B8]/70 shrink-0"
            title="Espaço reservado para a logo"
          >
            SW
          </span>
          <span className="font-display text-lg font-semibold tracking-wide sm:text-xl">
            SAFE WORKS
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors ${
                  active
                    ? "text-accent"
                    : "text-[#D8D2B8] hover:text-[#F6F2E4]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/equipes"
            className="font-mono-safe text-xs uppercase tracking-widest border border-[#F0EBDB]/35 px-3 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
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
                pathname === link.href ? "text-accent" : "text-[#D8D2B8]"
              }`}
            >
              {link.label}
            </Link>
          ))}
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
