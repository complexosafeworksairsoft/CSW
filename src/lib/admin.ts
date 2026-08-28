// Server-only module: only ever imported from Server Components / Server
// Actions (it uses a plaintext password, so it must never reach the client
// bundle). Not marked with the `server-only` package because that package
// isn't installed and this prototype avoids adding new dependencies — the
// import graph below already keeps it out of client bundles, same as
// src/lib/teams.ts.
//
// TODO (production): this single hardcoded credential is a PROTOTYPE ONLY
// stand-in for a real admin-user table. Before going live, replace it with a
// proper table (the project brief points at Supabase), hashed passwords
// (bcrypt/argon2 — never store or compare plaintext), and support for more
// than one admin account.

export type AdminUser = {
  username: string;
  password: string;
};

const ADMIN_USER: AdminUser = {
  username: "Allis",
  password: "works2020",
};

export function findAdminByCredentials(
  username: string,
  password: string
): AdminUser | null {
  // Trim stray whitespace (mobile autofill/autocomplete sometimes appends a
  // trailing space) — still an exact, case-sensitive match otherwise.
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();
  if (
    normalizedUsername !== ADMIN_USER.username ||
    normalizedPassword !== ADMIN_USER.password
  ) {
    return null;
  }
  return ADMIN_USER;
}
