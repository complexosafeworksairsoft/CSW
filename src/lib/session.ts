import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Prototype-grade session handling for the team portal (/equipes/*).
 *
 * TODO (production): this hand-rolled HMAC-signed cookie is a stand-in for
 * a real auth provider/session store (the project brief points at Supabase
 * Auth). All signing/verification logic lives in this one module on
 * purpose — swapping it out later should only mean rewriting the three
 * functions below (`createSession`, `readSessionTeamId`, `destroySession`),
 * not touching every page or Server Action that calls them.
 */

const COOKIE_NAME = "sw_equipe_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 dias

declare global {
  // eslint-disable-next-line no-var
  var __swPortalEphemeralSecret: string | undefined;
}

function getSecret(): string {
  const configured = process.env.PORTAL_SECRET;
  if (configured && configured.trim().length > 0) {
    return configured;
  }

  // Dev convenience: generate an ephemeral secret so the portal works
  // out of the box without a .env file. Stored on `globalThis` so it
  // survives module re-evaluation across route/action bundles within the
  // same server process (Next dev can compile routes into separate
  // module instances). This secret is NOT persisted anywhere — every
  // active session is invalidated when the server restarts.
  if (!globalThis.__swPortalEphemeralSecret) {
    globalThis.__swPortalEphemeralSecret = crypto.randomBytes(32).toString("hex");
    console.warn(
      "[equipes] PORTAL_SECRET não definido no ambiente — usando um segredo " +
        "efêmero gerado em memória para esta execução do servidor. As sessões " +
        "do portal de equipes serão invalidadas a cada reinício. Defina " +
        "PORTAL_SECRET (veja .env.example) antes de operar em produção."
    );
  }
  return globalThis.__swPortalEphemeralSecret;
}

type SessionPayload = {
  teamId: string;
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
    if (typeof payload.teamId !== "string") return null;
    return { teamId: payload.teamId, issuedAt: payload.issuedAt ?? 0 };
  } catch {
    return null;
  }
}

/** Sets the signed session cookie. Call only from a Server Action / Route Handler. */
export async function createSession(teamId: string): Promise<void> {
  const token = encodeToken({ teamId, issuedAt: Date.now() });
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
export async function readSessionTeamId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeToken(token)?.teamId ?? null;
}

/** Clears the session cookie. Call only from a Server Action / Route Handler. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
