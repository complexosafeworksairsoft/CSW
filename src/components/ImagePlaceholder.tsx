type Ratio = "video" | "square" | "portrait" | "wide";

const RATIO_CLASS: Record<Ratio, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

type ImagePlaceholderProps = {
  /** What photo belongs here, e.g. "Foto: fachada do Complexo" */
  label: string;
  ratio?: Ratio;
  className?: string;
  /** Hides the label text, showing just the icon — for small tiles (e.g. a feed card's thumbnail) where the label would overflow. */
  compact?: boolean;
};

/**
 * Marked slot for a real photo the client will provide later. Swap for
 * next/image once assets arrive — keep the label as the alt text.
 */
export default function ImagePlaceholder({
  label,
  ratio = "video",
  className = "",
  compact = false,
}: ImagePlaceholderProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-dashed border-line-strong bg-surface-2 ${RATIO_CLASS[ratio]} ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 17px, var(--line-strong) 17px, var(--line-strong) 18px), repeating-linear-gradient(90deg, transparent, transparent 17px, var(--line-strong) 17px, var(--line-strong) 18px)",
        }}
      />

      <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-accent/70" />
      <span className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-accent/70" />
      <span className="absolute left-2 bottom-2 h-3 w-3 border-l-2 border-b-2 border-accent/70" />
      <span className="absolute right-2 bottom-2 h-3 w-3 border-r-2 border-b-2 border-accent/70" />

      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-6 w-6 text-muted"
        >
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L4 19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!compact && (
          <span className="font-mono-safe text-[11px] uppercase tracking-widest text-muted max-w-[16rem]">
            {label}
          </span>
        )}
        {compact && <span className="sr-only">{label}</span>}
      </div>
    </div>
  );
}
