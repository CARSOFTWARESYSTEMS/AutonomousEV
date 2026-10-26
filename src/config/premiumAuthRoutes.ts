// ── Sign-in behaviour per page ─────────────────────────────────────────────
//
// The one place that says which pages need a sign-in. Components read it
// through routeAccessFor() and routeConfigFor(); no component names a route.
//
//   public          Browse freely. The sign-in prompt never opens.
//   optional-login  Browse freely. After five anonymous minutes, the optional
//                   premium prompt offers Login or Continue Browsing. This is
//                   every page not listed here.
//   required-login  The full page is for signed-in visitors. An anonymous
//                   visitor sees, in its place:
//                   - publicPreview: true — the page's public preview (its
//                     title, description, structured data and topics, rendered
//                     on the server so search engines index it) beside the
//                     login card. The page wraps its full experience in
//                     <PremiumContent preview={…}> (src/components/auth).
//                   - otherwise — the bare premium login gate (root layout).
//                   Never the full page behind either; Login returns to the
//                   exact URL.
//
// Paths match exactly (a trailing slash is ignored): listing
// /space/satellite-engineering does not cover /space/satellite-engineering/x.
// A page reachable at a second address through a rewrite in next.config.ts
// needs that address listed too, or the second address is a way round.
//
// ── SECURITY BOUNDARY: this is a login gate, not access control ───────────
//
// required-login only decides what the browser renders. The pages are static
// files: their HTML, React Server Component payload and JavaScript can still
// be fetched without signing in, and any Google account can sign in. Put only
// content here that may be public in principle (premium, not confidential).
//
// Content or data that is genuinely protected must be authorized on the
// server BEFORE the page or data is delivered — never by this table — with
// all four checks (docs/premium-login.md, and docs/auth/multi-domain-sso.md
// in Intern2026):
//   authenticated + active membership + correct domain/partner
//   + required role/permission
// "Authenticated · No Membership" visitors (signed in, roles: []) may see
// premium pages and must get no protected functionality.

export type RouteAccess = "public" | "optional-login" | "required-login";

export type RouteCategory = "aerospace" | "space" | "internships";

export interface PremiumAuthRoute {
  path: string;
  access: RouteAccess;
  category: RouteCategory;
  /** The page as Admin views and the login gate name it. */
  label: string;
  /**
   * The page shows a public, indexable preview while its full experience is
   * gated (it renders <PremiumContent>; a test checks). Without it, the root
   * layout's gate replaces the whole page.
   */
  publicPreview?: boolean;
}

/** Pages not listed below. */
export const DEFAULT_ROUTE_ACCESS: RouteAccess = "optional-login";

export const premiumAuthRoutes: readonly PremiumAuthRoute[] = [
  {
    path: "/aerospace/uflight-3d",
    access: "required-login",
    publicPreview: true,
    category: "aerospace",
    label: "UFlight 3D",
  },
  {
    path: "/space/satellite-engineering",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Satellite Engineering",
  },
  {
    path: "/space/satellite-engineering/interactive-3d",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Interactive 3D Satellite",
  },
  {
    path: "/space/everyday-applications",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Everyday Applications",
  },
  {
    path: "/space/model-rocketry",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Model Rocketry",
  },
  {
    path: "/space/cubesat",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "CubeSat / CubeTwin",
  },
  {
    path: "/space/space-station",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Space Station",
  },
  {
    path: "/space/rocket-engine-digital-twin",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Rocket Engine Digital Twin",
  },
  {
    path: "/space/rocket-engine-digital-twin-advanced",
    access: "required-login",
    publicPreview: true,
    category: "space",
    label: "Advanced Rocket Engine Digital Twin",
  },
  {
    path: "/internships",
    access: "required-login",
    publicPreview: true,
    category: "internships",
    label: "Internships",
  },
  {
    // The same page as /internships, served there by a rewrite (next.config.ts).
    path: "/workshop",
    access: "required-login",
    publicPreview: true,
    category: "internships",
    label: "Internships",
  },
];

/** The path without a trailing slash ("/" stays "/"). */
export function normalizeRoutePath(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path || "/";
}

/** The listed route for this exact path, or null. */
export function routeConfigFor(pathname: string | null | undefined): PremiumAuthRoute | null {
  const path = normalizeRoutePath(pathname);
  return premiumAuthRoutes.find((route) => route.path === path) ?? null;
}

export function routeAccessFor(pathname: string | null | undefined): RouteAccess {
  return routeConfigFor(pathname)?.access ?? DEFAULT_ROUTE_ACCESS;
}

/**
 * Per category: the section's landing page (the gate's way back and the
 * preview's breadcrumb) and the visual family the gate and preview use —
 * "space" for the self-contained Space and Aerospace pages, "core" for pages
 * under the site Navbar.
 */
export const CATEGORY_HOME: Record<RouteCategory, { href: string; label: string; family: "space" | "core" }> = {
  aerospace: { href: "/aerospace", label: "Aerospace", family: "space" },
  space: { href: "/space", label: "Space", family: "space" },
  internships: { href: "/", label: "Home", family: "core" },
};
