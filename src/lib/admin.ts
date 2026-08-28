// Server-only module: only ever imported from Server Components / Server
// Actions (it uses a plaintext access code, so it must never reach the
// client bundle). Not marked with the `server-only` package because that
// package isn't installed and this prototype avoids adding new dependencies
// — the import graph below already keeps it out of client bundles, same as
// src/lib/teams.ts.
//
// TODO (production): a single shared passcode (no username, no per-admin
// identity) is a deliberate simplification requested by the client after
// repeated trouble logging in with a username+password on mobile — it's
// LESS secure than what this replaced (anyone with the code has full admin
// access, and there's no way to tell admins apart or revoke just one).
// Before going live for real, replace this with a proper admin-user table
// (the project brief points at Supabase) with hashed, individual passwords.

const ADMIN_ACCESS_CODE = "COMPLEXO2020";

// Case-insensitive on purpose: the earlier username+password login broke
// repeatedly on mobile keyboards that silently changed letter casing (see
// git history). A single code is worth making forgiving about case too.
export function isValidAdminAccessCode(code: string): boolean {
  return code.trim().toUpperCase() === ADMIN_ACCESS_CODE;
}
