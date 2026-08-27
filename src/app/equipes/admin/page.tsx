import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/admin-session";
import { getSiteImage, SITE_IMAGE_SLOTS } from "@/lib/site-images";
import { logoutAdminAction } from "../admin-actions";
import AdminSlotCard from "./AdminSlotCard";

export const metadata: Metadata = {
  title: "Administração de Imagens | Safe Works",
  description: "Gerencie as fotos exibidas em todo o site do Complexo Safe Works.",
};

// Groups rendered in the same order their slots first appear in
// SITE_IMAGE_SLOTS (src/lib/site-images.ts), which already follows the
// site's page order (Global, Início, O Complexo, Campo de Jogo, ...).
function groupSlots() {
  const groups = new Map<string, typeof SITE_IMAGE_SLOTS>();
  for (const slot of SITE_IMAGE_SLOTS) {
    const list = groups.get(slot.group);
    if (list) {
      list.push(slot);
    } else {
      groups.set(slot.group, [slot]);
    }
  }
  return Array.from(groups.entries());
}

export default async function AdminImagesPage() {
  const isAdmin = await readAdminSession();
  if (!isAdmin) {
    redirect("/equipes/admin/login");
  }

  const groups = groupSlots();

  return (
    <div>
      <div className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Administração</p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">
              Imagens do site
            </p>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="font-mono-safe text-xs uppercase tracking-widest border border-line-strong px-3 py-2 rounded-sm text-ink-soft hover:border-accent hover:text-accent transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <p className="text-sm text-ink-soft max-w-2xl">
          Envie uma imagem para substituir cada espaço reservado do site
          público. As mudanças aparecem em todas as páginas assim que a
          imagem é enviada.
        </p>

        <div className="mt-10 space-y-12">
          {groups.map(([group, slots]) => (
            <section key={group}>
              <p className="eyebrow">Seção</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                {group}
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {slots.map((slot) => (
                  <AdminSlotCard key={slot.key} slot={slot} photo={getSiteImage(slot.key)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
