import PhotoTile from "@/components/PhotoTile";
import { getSiteImage, type Ratio } from "@/lib/site-images";

type SiteImageProps = {
  /** Key into SITE_IMAGE_SLOTS (src/lib/site-images.ts) identifying this slot. */
  slotKey: string;
  /** What photo belongs here — doubles as empty-state label and alt text. */
  label: string;
  ratio?: Ratio;
  className?: string;
};

/**
 * Server Component only: looks up the admin-uploaded photo for `slotKey`
 * (in-memory prototype store, see src/lib/site-images.ts) and renders it via
 * PhotoTile, falling back to the usual ImagePlaceholder look when nothing has
 * been uploaded yet. Thin wrapper — do not use this from a Client Component
 * (Nav.tsx included): a client-side import of getSiteImage would bundle a
 * separate, always-empty copy of the store. See src/components/Nav.tsx for
 * how the logo slot works around that.
 */
export default function SiteImage({
  slotKey,
  label,
  ratio = "square",
  className = "",
}: SiteImageProps) {
  const photo = getSiteImage(slotKey);
  return <PhotoTile photo={photo} label={label} ratio={ratio} className={className} />;
}
