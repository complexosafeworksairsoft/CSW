// Server-only helper for the prototype photo-upload flow used across the
// team portal roster (Ficha da Equipe: foto da equipe, do operador e do
// equipamento).
//
// TODO (production): storing photos as in-memory base64 data URIs is a
// prototype shortcut — it bloats server memory, counts against the Server
// Action body size limit (raised in next.config.ts to accommodate it), and
// vanishes on every server restart. Production needs real object storage
// (e.g. Supabase Storage) with only the resulting URL persisted on the
// record, consistent with the TODO already left in teams.ts / session.ts /
// agenda-data.ts for the rest of this prototype's data layer.

const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // ~4MB

export type PhotoUploadResult =
  | { kind: "none" } // no file was chosen — caller should keep the previous value
  | { kind: "error"; message: string }
  | { kind: "ok"; dataUri: string };

/**
 * Reads an optional `<input type="file" name="photo">` value from FormData
 * and converts it to a base64 data URI. Never trust client-side `accept`/
 * `maxLength`-style constraints alone — type and size are re-validated here.
 */
export async function readPhotoUpload(
  value: FormDataEntryValue | null
): Promise<PhotoUploadResult> {
  if (!value || typeof value === "string") return { kind: "none" };

  const file = value;
  if (file.size === 0) return { kind: "none" };

  if (!file.type.startsWith("image/")) {
    return { kind: "error", message: "O arquivo enviado precisa ser uma imagem." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { kind: "error", message: "A imagem precisa ter no máximo 4MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  return { kind: "ok", dataUri };
}
