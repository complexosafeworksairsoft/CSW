// Server-only module: only ever imported from Server Components / Server
// Actions (it handles password hashes, so it must never reach the client
// bundle).
//
// Backed by Supabase (see supabase/schema.sql for the `users` table).
// Unlike teams.ts's `password` column (still plaintext, a known prototype
// shortcut for shared/demo-scale codes), individual accounts hash the
// password with bcrypt from the start — real people reusing real passwords
// changes the risk calculus enough that this isn't deferrable the way the
// team-shared login's TODO is.
//
// Every account starts 'pending': registering does NOT log the person in —
// an admin has to approve the account first (see
// src/app/equipes/admin/account-actions.ts). This is a separate approval
// step from team membership (src/lib/membership.ts): account approval is
// "can this person use the site at all", team membership is "does this
// person belong to this specific team".

import bcrypt from "bcryptjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// See the matching comment in teams.ts / roster-data.ts: supabase() is
// typed as `ReturnType<typeof createClient>` without a generated Database
// type, which makes .insert()/.update()/.upsert() type-error as `never`.
// Re-asserting the client type here sidesteps that.
function db(): SupabaseClient {
  return supabase() as SupabaseClient;
}

const BCRYPT_ROUNDS = 10;
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,32}$/;

export type UserStatus = "pending" | "approved" | "rejected";

export type User = {
  id: string;
  username: string;
  displayName: string;
  status: UserStatus;
  createdAt: number; // epoch ms
};

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  status: UserStatus;
  created_at: string;
};

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Looks up a user by credentials regardless of approval status — the caller
 * (src/app/conta/actions.ts's loginAction) is what decides what message to
 * show for a 'pending'/'rejected' account vs granting a session for
 * 'approved'. Keeping the password check independent of status here means a
 * wrong password always fails the same way, whatever the account's status.
 */
export async function findUserByCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const normalized = username.trim().toLowerCase();
  const { data, error } = await db()
    .from("users")
    .select("*")
    .eq("username", normalized)
    .maybeSingle<UserRow>();

  if (error || !data) return null;
  const matches = await bcrypt.compare(password, data.password_hash);
  if (!matches) return null;
  return rowToUser(data);
}

export async function findUserById(id: string): Promise<User | null> {
  if (!id) return null;
  const { data, error } = await db()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle<UserRow>();

  if (error || !data) return null;
  return rowToUser(data);
}

/** All registered accounts, for the admin's "Acessos individuais" list — sorted by username so the list is stable/scannable. */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await db()
    .from("users")
    .select("*")
    .order("username", { ascending: true })
    .returns<UserRow[]>();

  if (error || !data) return [];
  return data.map(rowToUser);
}

/** Accounts awaiting admin approval, oldest first — the admin's "Solicitações de conta" queue. */
export async function getPendingUsers(): Promise<User[]> {
  const { data, error } = await db()
    .from("users")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .returns<UserRow[]>();

  if (error || !data) return [];
  return data.map(rowToUser);
}

export async function approveUserAccount(userId: string): Promise<void> {
  await db().from("users").update({ status: "approved" }).eq("id", userId).eq("status", "pending");
}

export async function rejectUserAccount(userId: string): Promise<void> {
  await db().from("users").update({ status: "rejected" }).eq("id", userId).eq("status", "pending");
}

/**
 * Deletes an account (admin-only). Any operator row linked to this user
 * (see supabase/schema.sql's `operators.user_id ... on delete set null`)
 * stays in the team's roster, just unlinked from the account — deleting a
 * login never erases a team's existing data.
 */
export async function removeUser(userId: string): Promise<void> {
  await db().from("users").delete().eq("id", userId);
}

/** Admin-set password reset — for when someone loses access and there's no self-service recovery (no email on file). */
export async function setUserPassword(
  userId: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const password = newPassword.trim();
  if (password.length < 6) {
    return { ok: false, error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const { error } = await db()
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", userId);

  if (error) {
    return { ok: false, error: "Não foi possível alterar a senha. Tente novamente." };
  }
  return { ok: true };
}

export type CreateUserInput = {
  username: string;
  password: string;
  displayName: string;
};

/** Creates a new individual user account, status 'pending' — needs admin approval (see getPendingUsers/approveUserAccount) before it can log in. Usernames are unique case-insensitively (normalized to lowercase). */
export async function createUser(
  input: CreateUserInput
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const username = input.username.trim().toLowerCase();
  const password = input.password;
  const displayName = input.displayName.trim();

  if (!username || !password || !displayName) {
    return { ok: false, error: "Preencha usuário, nome de exibição e senha." };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Usuário deve ter de 3 a 32 caracteres: letras minúsculas, números, ponto, traço ou underline.",
    };
  }
  if (password.length < 6) {
    return { ok: false, error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const { data: dup } = await db()
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (dup) {
    return { ok: false, error: "Esse nome de usuário já está em uso." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const id = generateId("u");
  const { error } = await db().from("users").insert({
    id,
    username,
    password_hash: passwordHash,
    display_name: displayName.slice(0, 80),
    status: "pending",
  });

  if (error) {
    return { ok: false, error: "Não foi possível criar a conta. Tente novamente." };
  }
  return {
    ok: true,
    user: { id, username, displayName: displayName.slice(0, 80), status: "pending", createdAt: Date.now() },
  };
}
