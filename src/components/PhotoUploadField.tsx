"use client";

import { useEffect, useRef, useState } from "react";
import type { Fit } from "@/lib/image-processing";

type Ratio = "video" | "square" | "portrait" | "wide";

const RATIO_CLASS: Record<Ratio, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

type PhotoUploadFieldProps = {
  /** Name of the file input, read server-side via formData.get(name). */
  name: string;
  /** What photo belongs here, e.g. "Foto do operador". Doubles as empty-state label and alt text. */
  label?: string;
  /** Already-saved photo (data URI) to show as the initial preview, if any. */
  existingPhoto?: string | null;
  /** Fit already saved for existingPhoto, if any — seeds the "Recortar"/"Original" picker below. */
  existingFit?: Fit;
  ratio?: Ratio;
  className?: string;
};

/**
 * Interactive sibling of ImagePlaceholder: same dashed-border / corner-bracket
 * / camera-icon visual language, but wraps a hidden file input and shows a
 * live local preview as soon as a photo is picked. Works inside a <form>
 * submitted by a Server Action — the file travels as normal multipart
 * FormData under `name`, and the chosen fit travels alongside it as
 * `${name}Fit` (read server-side via src/lib/photo-upload.ts).
 */
export default function PhotoUploadField({
  name,
  label = "Foto",
  existingPhoto = null,
  existingFit = "cover",
  ratio = "square",
  className = "",
}: PhotoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingPhoto);
  const [fit, setFit] = useState<Fit>(existingFit);
  const objectUrlRef = useRef<string | null>(null);

  // Revoke any blob: URL we created once it's no longer shown, so we don't
  // leak memory as the user swaps photos before submitting.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={preview ? `Trocar ${label.toLowerCase()}` : `Adicionar ${label.toLowerCase()}`}
        className={`relative flex w-full items-center justify-center overflow-hidden border border-dashed border-line-strong bg-surface-2 hover:border-accent transition-colors cursor-pointer ${RATIO_CLASS[ratio]}`}
      >
        {!preview && (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 17px, var(--line-strong) 17px, var(--line-strong) 18px), repeating-linear-gradient(90deg, transparent, transparent 17px, var(--line-strong) 17px, var(--line-strong) 18px)",
            }}
          />
        )}

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element -- prototype preview from a blob:/data: URI, see ImagePlaceholder.tsx for the swap-to-next/image note
          <img
            src={preview}
            alt={label}
            className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          />
        )}

        <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-accent/70" />
        <span className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-accent/70" />
        <span className="absolute left-2 bottom-2 h-3 w-3 border-l-2 border-b-2 border-accent/70" />
        <span className="absolute right-2 bottom-2 h-3 w-3 border-r-2 border-b-2 border-accent/70" />

        {!preview && (
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
            <span className="font-mono-safe text-[11px] uppercase tracking-widest text-muted max-w-[16rem]">
              {label}
            </span>
          </div>
        )}

        {preview && (
          <span className="absolute bottom-2 right-2 font-mono-safe text-[10px] uppercase tracking-widest bg-[#000000]/60 text-[#F6F2E4] px-2 py-1 rounded-sm">
            Trocar foto
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
      />

      <div role="radiogroup" aria-label="Enquadramento da imagem" className="mt-2 flex gap-4">
        <label className="flex cursor-pointer items-center gap-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
          <input
            type="radio"
            name={`${name}Fit`}
            value="cover"
            checked={fit === "cover"}
            onChange={() => setFit("cover")}
            className="accent-accent"
          />
          Recortar
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
          <input
            type="radio"
            name={`${name}Fit`}
            value="contain"
            checked={fit === "contain"}
            onChange={() => setFit("contain")}
            className="accent-accent"
          />
          Original
        </label>
      </div>
    </div>
  );
}
