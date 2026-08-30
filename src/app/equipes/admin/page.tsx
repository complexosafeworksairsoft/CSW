import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/admin-session";
import { getSiteImage, SITE_IMAGE_SLOTS } from "@/lib/site-images";
import { getAllTeams } from "@/lib/teams";
import { getAllUsers } from "@/lib/users";
import { getAllActiveRequests } from "@/lib/membership";
import { getPendingBookings } from "@/lib/field-bookings";
import { logoutAdminAction } from "../admin-actions";
import AdminSlotCard from "./AdminSlotCard";
import TeamList from "./TeamList";
import CreateTeamForm from "./CreateTeamForm";
import UserList from "./UserList";
import type { UserRowData } from "./UserRow";
import PendingBookingsList, { type PendingBookingRow } from "./PendingBookingsList";

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
  const teams = await getAllTeams();

  const [users, activeRequests, pendingBookings] = await Promise.all([
    getAllUsers(),
    getAllActiveRequests(),
    getPendingBookings(),
  ]);
  const teamNameById = new Map(teams.map((t) => [t.id, t.teamName]));
  const requestByUserId = new Map(activeRequests.map((r) => [r.userId, r]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const userRows: UserRowData[] = users.map((user) => {
    const request = requestByUserId.get(user.id);
    const teamLabel = request
      ? `${teamNameById.get(request.teamId) ?? "Equipe"} · ${
          request.status === "pending" ? "aguardando aprovação" : "membro aprovado"
        }`
      : "Sem equipe";
    return { id: user.id, username: user.username, displayName: user.displayName, teamLabel };
  });
  const pendingBookingRows: PendingBookingRow[] = pendingBookings.map((booking) => {
    const user = userById.get(booking.userId);
    return {
      id: booking.id,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      username: user?.username ?? "?",
      displayName: user?.displayName ?? "Usuário",
    };
  });

  const photoEntries = await Promise.all(
    SITE_IMAGE_SLOTS.map(async (slot) => [slot.key, await getSiteImage(slot.key)] as const)
  );
  const photosBySlotKey = new Map(photoEntries);

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

        <section className="mt-10 border border-line bg-surface-2 p-6 sm:p-8">
          <p className="eyebrow">Equipes</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Acessos de equipe
          </h2>
          <p className="mt-2 text-sm text-ink-soft max-w-2xl">
            Crie o código e a senha que uma equipe usa para entrar no portal
            (/equipes/login). Só o administrador do Complexo pode criar ou
            remover acessos — as equipes não conseguem se cadastrar sozinhas.
          </p>

          <div className="mt-6">
            <TeamList teams={teams} />
          </div>

          <div className="mt-6">
            <CreateTeamForm />
          </div>
        </section>

        <section className="mt-10 border border-line bg-surface-2 p-6 sm:p-8">
          <p className="eyebrow">Contas de usuário</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Acessos individuais
          </h2>
          <p className="mt-2 text-sm text-ink-soft max-w-2xl">
            Contas que as próprias pessoas criam em /conta. Veja a qual
            equipe cada uma está vinculada, redefina a senha de quem perdeu
            acesso (não há e-mail cadastrado, então não existe recuperação
            automática) ou exclua uma conta.
          </p>

          <div className="mt-6">
            <UserList users={userRows} />
          </div>
        </section>

        <section className="mt-10 border border-line bg-surface-2 p-6 sm:p-8">
          <p className="eyebrow">Campo de jogo</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Agendamentos pendentes
          </h2>
          <p className="mt-2 text-sm text-ink-soft max-w-2xl">
            Pedidos de horário para jogar, feitos em /conta/agendamentos.
            Confirmar garante a vaga da pessoa; recusar libera o horário para
            outra solicitação.
          </p>

          <div className="mt-6">
            <PendingBookingsList bookings={pendingBookingRows} />
          </div>
        </section>

        <div className="mt-12 space-y-12">
          {groups.map(([group, slots]) => (
            <section key={group}>
              <p className="eyebrow">Seção</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                {group}
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {slots.map((slot) => (
                  <AdminSlotCard
                    key={slot.key}
                    slot={slot}
                    photo={photosBySlotKey.get(slot.key) ?? null}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
