// Server-only Supabase client. Uses the SERVICE ROLE key — full read/write
// access, no Row Level Security restrictions — which is why this file must
// never be imported from a Client Component or have its values sent to the
// browser. Every data module in src/lib/*-data.ts and src/lib/teams.ts calls
// through this client instead of holding its own in-memory array, so data
// survives server restarts and is consistent across every Vercel serverless
// instance (the in-memory prototype could not guarantee either).
//
// Required env vars (see .env.example): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} não está definido. Configure-o em .env.local (dev) ou nas ` +
        `variáveis de ambiente do projeto na Vercel (produção).`
    );
  }
  return value;
}

// No generated `Database` type (that needs the Supabase CLI pointed at a
// live project) — explicitly typing the client as the untyped-schema
// `SupabaseClient` (rather than letting `ReturnType<typeof createClient>`
// infer it) keeps .insert()/.update()/.upsert() accepting plain objects.
// Without this, TypeScript collapses those argument types to `never`
// because it can't otherwise verify column names against an unknown schema.
let cachedClient: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );
  }
  return cachedClient;
}
