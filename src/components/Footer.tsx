import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">SAFE WORKS</p>
          <p className="mt-2 text-sm text-ink-soft max-w-xs">
            Campo de jogo, oficina, loja e escola tática de airsoft em Mossoró/RN.
          </p>
        </div>

        <div>
          <p className="eyebrow">Complexo</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li><Link href="/o-complexo" className="hover:text-olive-deep">O Complexo</Link></li>
            <li><Link href="/campo" className="hover:text-olive-deep">Campo de Jogo</Link></li>
            <li><Link href="/oficina" className="hover:text-olive-deep">Oficina</Link></li>
            <li><Link href="/loja" className="hover:text-olive-deep">Loja</Link></li>
            <li><Link href="/escola" className="hover:text-olive-deep">Escola Tática</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contato</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li>Mossoró / RN</li>
            <li><Link href="/regras" className="hover:text-olive-deep">Central de Regras</Link></li>
            <li><Link href="/equipes" className="hover:text-olive-deep">Portal de Equipes</Link></li>
            <li><Link href="/contato" className="hover:text-olive-deep">Fale conosco</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 font-mono-safe text-xs text-muted flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Safe Works · Mossoró/RN</span>
          <span>Complexo de airsoft</span>
        </div>
      </div>
    </footer>
  );
}
