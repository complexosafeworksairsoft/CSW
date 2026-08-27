import ImagePlaceholder from "@/components/ImagePlaceholder";

type Ratio = "video" | "square" | "portrait" | "wide";

const RATIO_CLASS: Record<Ratio, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

/**
 * Read-only, static sibling of PhotoUploadField: same dashed-border /
 * corner-bracket visual language as ImagePlaceholder, but renders a saved
 * photo (base64 data URI — prototype only, see the TODO in roster-data.ts)
 * when there is one, falling back to ImagePlaceholder otherwise. Same
 * pattern as the local `PhotoTile` in the ficha's OperatorCard.tsx, shared
 * here for the public, non-editable /operadores pages.
 */
export default function PhotoTile({
  photo,
  label,
  ratio = "square",
  className = "",
}: {
  photo: string | null;
  label: string;
  ratio?: Ratio;
  className?: string;
}) {
  if (!photo) {
    return <ImagePlaceholder label={label} ratio={ratio} className={className} />;
  }
  return (
    <div
      className={`relative overflow-hidden border border-line-strong bg-surface-2 ${RATIO_CLASS[ratio]} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- prototype data-URI photo, see ImagePlaceholder.tsx for the swap-to-next/image note */}
      <img src={photo} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l-2 border-t-2 border-accent/70" />
      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r-2 border-t-2 border-accent/70" />
      <span className="absolute left-1.5 bottom-1.5 h-2.5 w-2.5 border-l-2 border-b-2 border-accent/70" />
      <span className="absolute right-1.5 bottom-1.5 h-2.5 w-2.5 border-r-2 border-b-2 border-accent/70" />
    </div>
  );
}
