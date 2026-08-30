import UserRow, { type UserRowData } from "./UserRow";

/** Lists every individual user account (id, username, display name, team affiliation), for the admin's "Acessos individuais" section. */
export default function UserList({ users }: { users: UserRowData[] }) {
  if (users.length === 0) {
    return (
      <p className="font-mono-safe text-xs uppercase tracking-widest text-muted border border-dashed border-line-strong px-4 py-3">
        Nenhuma conta de usuário cadastrada.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </ul>
  );
}
