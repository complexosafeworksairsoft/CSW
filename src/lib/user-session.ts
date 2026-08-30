import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Prototype-grade session handling for individual user accounts (/conta/*).
 *
 * Deliberately a FULLY SEPARATE mechanism from src/lib/session.ts (the
 * team-shared portal login) and src/lib/admin-session.ts (site admin): its
 * own cookie name and signing secret, so none of the three cookies can ever
 * satisfy another one's check. Mirrors session.ts's shape on purpose — if
 * that file's approach changes, update this one to match.
 *
 * TODO (production): this hand-rolled HMAC-signed cookie is a stand-in for
 * a real auth provider/session store (the project brief points at Supabase
 * Auth). All signing/verification logic lives in this one module on
 * purpose — swapping it out later should only mean rewriting the three
 * functions below (`createUserSession`, `readUserSessionId`,
 * `destroyUserSession`), not touching every page or Server Action that
 * calls them.
 */

const COOKIE_NAME = "sw_user_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 dias

declare global {
  // eslint-disable-next-line no-var
  var __swUserEphemeralSecret: string | undefined;
}

function getSecret(): string {
  const configured = process.env.USER_SECRET;
  if (configured && configured.trim().length > 0) {
    return configured;
  }

  // Dev convenience: generate an ephemeral secret so account login works out
  // of the box without a .env file. Stored on `globalThis` so it survives
  // module re-evaluation across route/action bundles within the same server
  // process (Next dev can compile routes into separate module instances).
  // This secret is NOT persisted anywhere — every active session is
  // invalidated when the server restarts.
  if (!globalThis.__swUserEphemeralSecret) {
    globalThis.__swUserEphemeralSecret = crypto.randomBytes(32).toString("hex");
    console.warn(
      "[conta] USER_SECRET não definido no ambiente — usando um segredo " +
        "efêmero gerado em memória para esta execução do servidor. As " +
        "sessões de conta de usuário serão invalidadas a cada reinício. " +
        "Defina USER_SECRET (veja .env.example) antes de operar em produção."
    );
  }
  return globalThis.__swUserEphemeralSecret;
}

type SessionPayload = {
  userId: string;
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
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId, issuedAt: payload.issuedAt ?? 0 };
  } catch {
    return null;
  }
}

/** Sets the signed session cookie. Call only from a Server Action / Route Handler. */
export async function createUserSession(userId: string): Promise<void> {
  const token = encodeToken({ userId, issuedAt: Date.now() });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Reads and verifies the session cookie. Safe to call from Server Components. */
export async function readUserSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeToken(token)?.userId ?? null;
}

/** Clears the session cookie. Call only from a Server Action / Route Handler. */
export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
