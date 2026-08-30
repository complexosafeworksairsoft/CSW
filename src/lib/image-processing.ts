// Server-only: turns a raw uploaded file into a compressed, right-sized data
// URI before it ever reaches the database. Every photo in this project is
// still stored as a data URI (see the TODO in photo-upload.ts about swapping
// that for real object storage eventually) — this module is what keeps that
// prototype approach from producing multi-megabyte rows like the ones that
// broke a production deploy (Vercel's ISR page-size limit) before this file
// existed.

import sharp from "sharp";
import type { Ratio } from "./site-images";

/**
 * 'cover' crops the image to exactly fill the slot's aspect ratio (like the
 * old, only behavior — object-fit: cover). 'contain' keeps the photo's full,
 * uncropped framing, resized down only to cap file size; PhotoTile then
 * renders it with object-fit: contain (letterboxed) instead of cropping it.
 */
export type Fit = "cover" | "contain";

const RATIO_DIMENSIONS: Record<Ratio, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1440 }, // 3:4
  wide: { width: 1600, height: 686 }, // 21:9
  video: { width: 1280, height: 720 }, // 16:9
};

const MAX_CONTAIN_DIMENSION = 1600;
const JPEG_QUALITY = 80;

/**
 * Resizes/crops per `fit` and re-encodes to a data URI: JPEG for opaque
 * photos, PNG only when the source actually has transparency (logos) —
 * re-encoding an opaque JPEG-worthy photo as PNG would make it bigger, not
 * smaller.
 */
export async function processUploadedImage(
  buffer: Buffer,
  ratio: Ratio,
  fit: Fit
): Promise<string> {
  const image = sharp(buffer).rotate(); // bake in EXIF orientation before resizing
  const metadata = await image.metadata();

  const resized =
    fit === "cover"
      ? image.resize({ ...RATIO_DIMENSIONS[ratio], fit: "cover", position: "attention" })
      : image.resize({
          width: MAX_CONTAIN_DIMENSION,
          height: MAX_CONTAIN_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        });

  if (metadata.hasAlpha) {
    const outBuffer = await resized.png({ compressionLevel: 9 }).toBuffer();
    return `data:image/png;base64,${outBuffer.toString("base64")}`;
  }
  const outBuffer = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  return `data:image/jpeg;base64,${outBuffer.toString("base64")}`;
}
