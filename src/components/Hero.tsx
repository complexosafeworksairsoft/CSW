import type { ReactNode } from "react";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  image?: ReactNode;
};

export default function Hero({ eyebrow, title, subtitle, actions, image }: HeroProps) {
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
      <span aria-hidden className="hidden sm:block absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-accent/50" />
      <span aria-hidden className="hidden sm:block absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-accent/50" />

      <div
        className={`relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 ${
          image ? "grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : ""
        }`}
      >
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl max-w-2xl text-[#F6F2E4]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-lg text-[#CFC9AE]">{subtitle}</p>
          )}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {image && <div className="lg:pl-4">{image}</div>}
      </div>
    </section>
  );
}
