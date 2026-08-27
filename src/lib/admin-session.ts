import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Prototype-grade session handling for the site-image admin (/equipes/admin/*).
 *
 * Deliberately a FULLY SEPARATE mechanism from src/lib/session.ts (the team
 * portal's session): a different cookie name and a different signing secret,
 * so a team's session cookie can never satisfy an admin check and vice
 * versa. Mirrors session.ts's shape on purpose so the two stay easy to
 * compare — if that file's approach changes, update this one to match.
 *
 * TODO (production): this hand-rolled HMAC-signed cookie is a stand-in for a
 * real auth provider/session store (the project brief points at Supabase
 * Auth). All signing/verification logic lives in this one module on
 * purpose — swapping it out later should only mean rewriting the three
 * functions below (`createAdminSession`, `readAdminSession`,
 * `destroyAdminSession`), not touching every page or Server Action that
 * calls them.
 */

const COOKIE_NAME = "sw_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 dias

declare global {
  // eslint-disable-next-line no-var
  var __swAdminEphemeralSecret: string | undefined;
}

function getSecret(): string {
  const configured = process.env.ADMIN_SECRET;
  if (configured && configured.trim().length > 0) {
    return configured;
  }

  // Dev convenience: generate an ephemeral secret so the admin login works
  // out of the box without a .env file. Stored on `globalThis` so it
  // survives module re-evaluation across route/action bundles within the
  // same server process (Next dev can compile routes into separate module
  // instances). This secret is NOT persisted anywhere — every active
  // session is invalidated when the server restarts.
  if (!globalThis.__swAdminEphemeralSecret) {
    globalThis.__swAdminEphemeralSecret = crypto.randomBytes(32).toString("hex");
    console.warn(
      "[admin] ADMIN_SECRET não definido no ambiente — usando um segredo " +
        "efêmero gerado em memória para esta execução do servidor. As " +
        "sessões do admin de imagens serão invalidadas a cada reinício. " +
        "Defina ADMIN_SECRET (veja .env.example) antes de operar em produção."
    );
  }
  return globalThis.__swAdminEphemeralSecret;
}

type SessionPayload = {
  admin: true;
  issuedAt: number;
};

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeToken(payload: SessionPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function decodeToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const json = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(json) as Partial<SessionPayload>;
    if (payload.admin !== true) return null;
    return { admin: true, issuedAt: payload.issuedAt ?? 0 };
  } catch {
    return null;
  }
}

/** Sets the signed admin session cookie. Call only from a Server Action / Route Handler. */
export async function createAdminSession(): Promise<void> {
  const token = encodeToken({ admin: true, issuedAt: Date.now() });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Reads and verifies the admin session cookie. Safe to call from Server Components. */
export async function readAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return decodeToken(token) !== null;
}

/** Clears the admin session cookie. Call only from a Server Action / Route Handler. */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
