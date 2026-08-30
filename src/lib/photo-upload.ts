// Server-only helper for the photo-upload flow used across the team portal
// roster (Ficha da Equipe: foto da equipe, do operador e do equipamento) and
// the site-image admin. Every upload is resized/recompressed by
// image-processing.ts before it's stored — a raw camera photo can be 5MB+,
// and this project stores photos as data URIs directly in Postgres rows
// (see the TODO below), so an unprocessed upload bloats every read of that
// row and can blow past hosting limits (this happened for real: an
// unprocessed set of "O Complexo" photos once broke a Vercel deploy by
// pushing a static page past its size limit).
//
// TODO (production): storing photos as base64 data URIs is a prototype
// shortcut — it bloats the database and (previously) the server's memory.
// Production needs real object storage (e.g. Supabase Storage) with only
// the resulting URL persisted on the record, consistent with the TODO
// already left in teams.ts / session.ts / roster-data.ts for the rest of
// this prototype's data layer.

import { processUploadedImage, type Fit } from "./image-processing";
import type { Ratio } from "./site-images";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // ~8MB — generous since we recompress anyway

export type PhotoUploadResult =
  | { kind: "none" } // no file was chosen — caller should keep the previous value
  | { kind: "error"; message: string }
  | { kind: "ok"; dataUri: string; fit: Fit };

/**
 * Reads an optional `<input type="file" name="...">` value from FormData,
 * validates it, and returns it resized/recompressed per `ratio` (the slot's
 * target aspect ratio) and `fit` ('cover' crops to fill it, 'contain' keeps
 * the full uncropped frame — see PhotoUploadField.tsx for the picker UI).
 * Never trust client-side `accept`/size hints alone — type and size are
 * re-validated here, and the actual resize/compression always happens
 * server-side regardless of what the browser sent.
 */
export async function readPhotoUpload(
  value: FormDataEntryValue | null,
  ratio: Ratio,
  fit: Fit
): Promise<PhotoUploadResult> {
  if (!value || typeof value === "string") return { kind: "none" };

  const file = value;
  if (file.size === 0) return { kind: "none" };

  if (!file.type.startsWith("image/")) {
    return { kind: "error", message: "O arquivo enviado precisa ser uma imagem." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { kind: "error", message: "A imagem precisa ter no máximo 8MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const dataUri = await processUploadedImage(buffer, ratio, fit);
    return { kind: "ok", dataUri, fit };
  } catch {
    return { kind: "error", message: "Não foi possível processar essa imagem. Tente outro arquivo." };
  }
}
