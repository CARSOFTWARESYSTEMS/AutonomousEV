import { AUTH_API } from "./sites";

// ── The site's session, as Intern2026 reports it ───────────────────────────
//
// The session itself is an HttpOnly cookie on this host that scripts cannot
// read. The browser only learns what /api/auth/session says: signed in or
// not, who, and with which roles. Nothing here is ever written to storage.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export type SessionCheck =
  | { kind: "anonymous" }
  | { kind: "authenticated"; user: AuthUser; roles: string[] }
  /** No usable answer: the service is not deployed, refused this host, or failed. */
  | { kind: "unavailable" };

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/**
 * Reads a /api/auth/session body. A session for another host, or any shape
 * other than the documented one, is not a session.
 */
export function parseSession(body: unknown, host: string): SessionCheck {
  if (typeof body !== "object" || body === null) return { kind: "unavailable" };
  const value = body as Record<string, unknown>;
  if (value.authenticated === false) return { kind: "anonymous" };
  if (value.authenticated !== true || value.domain !== host) return { kind: "unavailable" };
  const user = (typeof value.user === "object" && value.user !== null ? value.user : {}) as Record<string, unknown>;
  return {
    kind: "authenticated",
    user: { id: text(user.id), name: text(user.name), email: text(user.email) },
    roles: Array.isArray(value.roles) ? value.roles.filter((role): role is string => typeof role === "string") : [],
  };
}

export async function checkSession(host: string, signal?: AbortSignal): Promise<SessionCheck> {
  try {
    const res = await fetch(AUTH_API.session, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      signal,
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("application/json")) return { kind: "unavailable" };
    return parseSession(await res.json(), host);
  } catch {
    return { kind: "unavailable" };
  }
}

/** Ends this site's session (Intern2026 logout is per site). True once the service confirms it. */
export async function endSession(): Promise<boolean> {
  try {
    const res = await fetch(AUTH_API.logout, {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}
