// ── Sign-in behaviour per page ─────────────────────────────────────────────
//
// The one place that says which pages need a sign-in. Components read it
// through routeAccessFor() and routeConfigFor(); no component names a route.
//
//   public          Browse freely. The sign-in prompt never opens.
//   optional-login  Browse freely. After five anonymous minutes, the optional
//                   premium prompt offers Login or Continue Browsing. This is
//                   every page not listed here.
//   required-login  Signed-in visitors only. An anonymous visitor sees the
//                   premium login gate in place of the page — never the page
//                   behind it — and Login brings them back to the exact URL.
//
// Paths match exactly (a trailing slash is ignored): listing
// /space/satellite-engineering does not cover /space/satellite-engineering/x.
// A page reachable at a second address through a rewrite in next.config.ts
// needs that address listed too.
//
// This decides what the browser shows; it is not access control. The page
// files are still public. Anything that serves protected data must check the
// visitor's session on the server: authenticated + active membership +
// correct domain/partner + required role (docs/auth/multi-domain-sso.md in
// Intern2026).

export type RouteAccess = "public" | "optional-login" | "required-login";

export type RouteCategory = "aerospace" | "space" | "internships";

export interface PremiumAuthRoute {
  path: string;
  access: RouteAccess;
  category: RouteCategory;
  /** The page as Admin views and the login gate name it. */
  label: string;
}

/** Pages not listed below. */
export const DEFAULT_ROUTE_ACCESS: RouteAccess = "optional-login";

export const premiumAuthRoutes: readonly PremiumAuthRoute[] = [
  {
    path: "/aerospace/uflight-3d",
    access: "required-login",
    category: "aerospace",
    label: "UFlight 3D",
  },
  {
    path: "/space/satellite-engineering",
    access: "required-login",
    category: "space",
    label: "Satellite Engineering",
  },
  {
    path: "/space/satellite-engineering/interactive-3d",
    access: "required-login",
    category: "space",
    label: "Interactive 3D Satellite",
  },
  {
    path: "/space/everyday-applications",
    access: "required-login",
    category: "space",
    label: "Everyday Applications",
  },
  {
    path: "/space/model-rocketry",
    access: "required-login",
    category: "space",
    label: "Model Rocketry",
  },
  {
    path: "/space/cubesat",
    access: "required-login",
    category: "space",
    label: "CubeSat / CubeTwin",
  },
  {
    path: "/space/space-station",
    access: "required-login",
    category: "space",
    label: "Space Station",
  },
  {
    path: "/space/rocket-engine-digital-twin",
    access: "required-login",
    category: "space",
    label: "Rocket Engine Digital Twin",
  },
  {
    path: "/space/rocket-engine-digital-twin-advanced",
    access: "required-login",
    category: "space",
    label: "Advanced Rocket Engine Digital Twin",
  },
  {
    path: "/internships",
    access: "required-login",
    category: "internships",
    label: "Internships",
  },
  {
    // The same page as /internships, served there by a rewrite (next.config.ts).
    path: "/workshop",
    access: "required-login",
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

/** Where the gate's "back" link goes for each category: the section's landing page. */
export const CATEGORY_HOME: Record<RouteCategory, { href: string; label: string }> = {
  aerospace: { href: "/aerospace", label: "Aerospace" },
  space: { href: "/space", label: "Space" },
  internships: { href: "/", label: "Home" },
};
