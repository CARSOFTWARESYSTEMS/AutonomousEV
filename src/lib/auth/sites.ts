// ── Sign-in services for the sites this deployment serves ──────────────────
//
// One table: which Intern2026 login host signs visitors in on each site host.
// next.config.ts builds the /api/auth rewrites from it, the root layout marks
// the host before first paint, and the header control and the five-minute
// prompt read the brand and login host from it. Nothing else may hard-code a
// login host.
//
// Mirrors AUTH_PROVIDERS in Intern2026 (src/auth/providers.ts), which is the
// authority: a host missing there is refused by its login service.
//
// next.config.ts loads this file through Node's own TypeScript loader, so it
// imports nothing and uses only erasable type syntax (no enums, no namespaces).

export type AuthSiteId = "itelematics" | "ev_engineer" | "gamyaa" | "uflight";

export interface AuthSite {
  id: AuthSiteId;
  /** The brand as the sign-in prompt names it: "Continue with …". */
  brand: string;
  loginHost: string;
  /** Site hosts this login host signs visitors in to. Exact hostnames, no wildcards. */
  hosts: readonly string[];
}

export const AUTH_SITES: readonly AuthSite[] = [
  {
    id: "itelematics",
    brand: "iTelematics®",
    loginHost: "login.itelematics.com",
    hosts: ["itelematics.com", "www.itelematics.com"],
  },
  {
    id: "ev_engineer",
    brand: "EV.ENGINEER™",
    loginHost: "login.autonomous.ev.engineer",
    // aerospace.ishavasyam.org serves Space, which is built and hosted on EV.ENGINEER; it signs in there.
    hosts: ["ev.engineer", "www.ev.engineer", "autonomous.ev.engineer", "aerospace.ev.engineer", "aerospace.ishavasyam.org"],
  },
  {
    id: "gamyaa",
    brand: "Gamyaa AeroSystems",
    loginHost: "login.gamyaa.in",
    hosts: ["gamyaa.in", "www.gamyaa.in", "aerospace.gamyaa.in", "aerosystems.gamyaa.in"],
  },
  {
    id: "uflight",
    brand: "UFlight™",
    loginHost: "login.uflight.in",
    hosts: ["uflight.in", "www.uflight.in", "cybersecurity.uflight.in"],
  },
];

/** The site's own sign-in endpoints, served by Intern2026 through the rewrites below. */
export const AUTH_API = {
  login: "/api/auth/login",
  session: "/api/auth/session",
  logout: "/api/auth/logout",
} as const;

/** Lower case, without a port or a trailing dot; null for anything that is not a bare hostname. */
export function normalizeHostname(host: string | null | undefined): string | null {
  if (typeof host !== "string") return null;
  const h = host.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  return h !== "" && /^[a-z0-9.-]+$/.test(h) ? h : null;
}

/** The sign-in service for this site host, or null when the host has none. */
export function authSiteForHost(host: string | null | undefined): AuthSite | null {
  const h = normalizeHostname(host);
  return (h && AUTH_SITES.find((site) => site.hosts.includes(h))) || null;
}

/** The login service's address for this site host, e.g. https://login.autonomous.ev.engineer. */
export function getLoginUrl(host: string | null | undefined): string | null {
  const site = authSiteForHost(host);
  return site ? `https://${site.loginHost}` : null;
}

/**
 * Workspace for a signed-in visitor: the Intern2026 Engineering Command
 * Center on the site's login host. It is the platform's real application
 * area, not a placeholder.
 */
export function workspaceUrlFor(site: AuthSite): string {
  return `https://${site.loginHost}/`;
}

// ── Return destinations ────────────────────────────────────────────────────
//
// Login returns the visitor to the page they were on: path, query and hash on
// the same host. Intern2026 checks the destination again and is the
// authority; these rules match its sanitizeReturnPath so the site never sends
// a destination the service would refuse.

const MAX_RETURN_PATH_LENGTH = 2048;

/** Query parameters that can carry credentials. They are never sent round a sign-in. */
const CREDENTIAL_PARAMS = new Set([
  "code",
  "state",
  "token",
  "access_token",
  "id_token",
  "refresh_token",
  "session",
  "session_id",
  "sid",
  "password",
  "secret",
]);

function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 32 || c === 127) return true;
  }
  return false;
}

/**
 * A normalised path + query + hash that stays on `host`, or null when `raw`
 * could leave it (a full URL, "//host", backslashes, javascript:, data:, …).
 */
export function sanitizeReturnPath(raw: string | null | undefined, host: string): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_RETURN_PATH_LENGTH) return null;
  if (raw[0] !== "/") return null;
  if (raw[1] === "/" || raw[1] === "\\") return null;
  if (raw.includes("\\")) return null;
  if (hasControlCharacter(raw)) return null;

  const origin = `https://${host}`;
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** The query string without credential-like parameters. Kept parameters keep their exact encoding. */
export function withoutCredentialParams(search: string): string {
  const pairs = search
    .replace(/^\?/, "")
    .split("&")
    .filter((pair) => {
      if (pair === "") return false;
      const rawKey = pair.split("=")[0];
      let key = rawKey;
      try {
        key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      } catch {
        // A malformed escape is kept as written.
      }
      return !CREDENTIAL_PARAMS.has(key.toLowerCase());
    });
  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
}

export interface PageLocation {
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
}

/**
 * Where a sign-in returns to: the page's path, its query without credentials
 * and its hash. Too long for the service, it drops the hash, then the query.
 */
export function returnPathFor(page: PageLocation): string {
  const host = normalizeHostname(page.hostname) ?? "localhost";
  const query = withoutCredentialParams(page.search);
  for (const candidate of [`${page.pathname}${query}${page.hash}`, `${page.pathname}${query}`, page.pathname]) {
    const path = sanitizeReturnPath(candidate, host);
    if (path) return path;
  }
  return "/";
}

/** The Login button's destination: this site's sign-in start, returning to `page`. Null on a host without sign-in. */
export function loginHref(page: PageLocation): string | null {
  if (!authSiteForHost(page.hostname)) return null;
  return `${AUTH_API.login}?return=${encodeURIComponent(returnPathFor(page))}`;
}

// ── Rewrites ───────────────────────────────────────────────────────────────

export interface AuthRewrite {
  source: string;
  has: { type: "host"; value: string }[];
  destination: string;
}

/**
 * /api/auth/{login,callback,session,logout} on each site host, served by its
 * login host's Intern2026 function. The site keeps its own host-only session
 * cookie because the browser only ever talks to the site.
 */
export function authRewrites(): AuthRewrite[] {
  return AUTH_SITES.flatMap((site) =>
    site.hosts.map((host) => ({
      source: "/api/auth/:action(login|callback|session|logout)",
      has: [{ type: "host" as const, value: host.replace(/\./g, "\\.") }],
      destination: `https://${site.loginHost}/api/auth/app/${host}/:action`,
    })),
  );
}

/** Host → site id, for the script that marks <html> before first paint. */
export function hostSiteIds(): Record<string, AuthSiteId> {
  return Object.fromEntries(AUTH_SITES.flatMap((site) => site.hosts.map((host) => [host, site.id])));
}
