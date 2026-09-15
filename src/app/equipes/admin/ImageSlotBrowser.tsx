"use client";

import { useMemo, useState } from "react";
import type { Fit } from "@/lib/image-processing";
import { groupSlug, type SiteImageSlot } from "@/lib/site-images";
import AdminSlotCard from "./AdminSlotCard";

export type ImageGroupData = {
  group: string;
  slots: { slot: SiteImageSlot; photo: { photo: string; fit: Fit } | null }[];
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Wraps the grid of AdminSlotCards (one per SITE_IMAGE_SLOTS entry, grouped
 * by page section) with a search box that filters by slot label, slot key,
 * or group name. Lets an admin jump straight to e.g. "loja" instead of
 * scrolling past every other section's image cards to find it.
 */
export default function ImageSlotBrowser({ groups }: { groups: ImageGroupData[] }) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const nq = normalize(query.trim());
    if (!nq) return groups;

    return groups
      .map(({ group, slots }) => {
        // A query matching the group name itself (e.g. "loja") keeps every
        // slot in that group, even if individual labels don't match.
        if (normalize(group).includes(nq)) return { group, slots };

        const matched = slots.filter(
          ({ slot }) => normalize(slot.label).includes(nq) || normalize(slot.key).includes(nq)
        );
        return { group, slots: matched };
      })
      .filter(({ slots }) => slots.length > 0);
  }, [groups, query]);

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.slots.length, 0);

  return (
    <div>
      <div className="relative max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar imagem por nome ou seção…"
          aria-label="Buscar imagem por nome ou seção"
          className="w-full rounded-sm border border-line-strong bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {totalVisible === 0 && (
        <p className="mt-6 font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-4 py-3">
          Nenhuma imagem encontrada para &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="mt-8 space-y-12">
        {filteredGroups.map(({ group, slots }) => (
          <section key={group} id={`img-${groupSlug(group)}`} className="scroll-mt-28">
            <p className="eyebrow">Seção</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{group}</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {slots.map(({ slot, photo }) => (
                <AdminSlotCard key={slot.key} slot={slot} photo={photo} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
