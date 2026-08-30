"use client";

export default function PrintButton({ label = "Imprimir ficha" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden border border-line-strong px-4 py-2.5 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors"
    >
      {label}
    </button>
  );
}
