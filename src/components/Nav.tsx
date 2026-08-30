"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PhotoTile from "@/components/PhotoTile";

type NavItem = {
  /** Omit for a pure dropdown trigger with no page of its own (e.g. "Central do Operador"). */
  href?: string;
  label: string;
  children?: NavItem[];
};

const LINKS: NavItem[] = [
  { href: "/", label: "Início" },
  {
    href: "/o-complexo",
    label: "Complexo Safe Works",
    children: [
      { href: "/campo", label: "Campo de Jogo" },
      { href: "/oficina", label: "Oficina Mecânica" },
      { href: "/loja", label: "Loja" },
      { href: "/treinamentos", label: "Treinamentos Táticos" },
    ],
  },
  { href: "/regras", label: "Regras" },
  { href: "/contato", label: "Contato" },
  {
    label: "Central do Operador",
    children: [
      { href: "/central-do-airsoft", label: "Central do Airsoft" },
      { href: "/central-de-equipes", label: "Central de Equipes" },
      { href: "/operadores", label: "Central de Operadores" },
    ],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href && pathname === item.href) return true;
  return item.children?.some((child) => child.href === pathname) ?? false;
}

function DesktopNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const baseClass = `whitespace-nowrap px-2 py-2 text-[13px] font-medium tracking-wide transition-colors lg:px-2.5 lg:text-sm ${
    active ? "text-accent" : "text-white hover:text-[#F6F2E4]"
  }`;

  const trigger = item.href ? (
    <Link href={item.href} className={baseClass}>
      {item.label}
      {item.children && <span aria-hidden className="ml-1 text-[10px] align-middle">▾</span>}
    </Link>
  ) : (
    <button type="button" className={`${baseClass} cursor-default`}>
      {item.label}
      <span aria-hidden className="ml-1 text-[10px] align-middle">▾</span>
    </button>
  );

  if (!item.children) return trigger;

  return (
    <div className="group relative">
      {trigger}
      <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="min-w-[220px] rounded-sm border border-[#F0EBDB]/15 bg-olive-deep py-2 shadow-lg">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href!}
              className="block px-4 py-2 text-sm text-white transition-colors hover:bg-white/5 hover:text-accent"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({
  item,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const active = isActive(pathname, item);

  return (
    <div className="border-b border-[#F0EBDB]/10">
      <div className="flex items-center justify-between">
        {item.href ? (
          <Link
            href={item.href}
            onClick={onNavigate}
            className={`flex-1 py-2.5 text-sm font-medium ${active ? "text-accent" : "text-white"}`}
          >
            {item.label}
          </Link>
        ) : (
          <span className={`flex-1 py-2.5 text-sm font-medium ${active ? "text-accent" : "text-white"}`}>
            {item.label}
          </span>
        )}
        {item.children && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Recolher" : "Expandir"} ${item.label}`}
            className="px-2 py-2.5 text-white"
          >
            <span aria-hidden className={`inline-block transition-transform ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
        )}
      </div>
      {item.children && expanded && (
        <div className="pb-2 pl-4">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href!}
              onClick={onNavigate}
              className={`block py-2 text-sm ${pathname === child.href ? "text-accent" : "text-white/85"}`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav({ logoPhoto }: { logoPhoto: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  function toggleExpanded(label: string) {
    setExpandedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  function closeAll() {
    setOpen(false);
    setExpandedLabels(new Set());
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-olive-deep text-[#F0EBDB]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={closeAll}>
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
          className="hidden lg:flex items-center gap-0.5 min-w-0 overflow-visible"
        >
          {LINKS.map((item) => (
            <DesktopNavItem key={item.label} item={item} active={isActive(pathname, item)} />
          ))}
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
            Login de Equipe
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
          {LINKS.map((item) => (
            <MobileNavItem
              key={item.label}
              item={item}
              pathname={pathname}
              expanded={expandedLabels.has(item.label)}
              onToggle={() => toggleExpanded(item.label)}
              onNavigate={closeAll}
            />
          ))}
          <Link
            href="/conta"
            onClick={closeAll}
            className="mt-3 py-2.5 text-sm font-medium text-white text-center border-b border-[#F0EBDB]/10"
          >
            Minha Conta
          </Link>
          <Link
            href="/equipes"
            onClick={closeAll}
            className="mt-3 font-mono-safe text-xs uppercase tracking-widest border border-[#F0EBDB]/35 px-3 py-2.5 rounded-sm text-center"
          >
            Login de Equipe
          </Link>
        </nav>
      )}
    </header>
  );
}
