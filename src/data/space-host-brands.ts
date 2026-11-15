/**
 * Hosts that show the Space pages under their own name. Only
 * aerospace.stellrspace.com does: every change made for it applies on that
 * host alone, and every other host serves exactly what it served before.
 *
 * The host serves its own copies of the pages listed in `paths`. A
 * host-matched rewrite in next.config.ts sends each one to the same path under
 * `variantPrefix` (/space → /stellrspace-space/space), where
 * src/app/stellrspace-space renders the shared page with this host's brand:
 * STELLR SPACE in the metadata, the social card, the JSON-LD, the header, the
 * copy and the footer, and never ISHAVASYAM.ORG, except where ISHAVASYAM.ORG
 * names the owner's own role (see src/lib/host-brand.ts).
 *
 * On any other page of the host the shared header still swaps its brand
 * before first paint: SpaceBrandHostFlag marks <html data-space-brand="…">
 * and the header's CSS shows STELLR SPACE (see SpaceHeader and
 * ../app/space/space.module.css).
 *
 * No path aliases here: next.config.ts imports this file directly.
 */

/** Space Academy's seven tracks and three missions (held to the curriculum by stellrspace-routing.test.ts). */
const ACADEMY_TRACKS = ["space-technology", "spacecraft-systems", "satellite-engineering", "model-rocketry", "cansat", "sensors-telemetry", "faults-safe-mode"];
const ACADEMY_MISSIONS = ["build-your-first-cubesat", "survive-the-eclipse", "stable-model-rocket"];

export const STELLR_SPACE = {
  /** The value of <html data-space-brand> on these hosts. */
  id: "stellr",
  /** Always written exactly so. */
  name: "STELLR SPACE",
  /** Exact hostnames, no wildcards. */
  hosts: ["aerospace.stellrspace.com"],
  /** The host's own address: canonical URLs, social cards and JSON-LD point here. */
  origin: "https://aerospace.stellrspace.com",
  /** The indefinite article before the name ("a STELLR SPACE initiative"). */
  article: "a",
  /** The footer's credit line. */
  label: "A STELLR SPACE Initiative",
  /** One line on what it is, for its JSON-LD node. */
  descriptor: "Education, research and engineering in autonomous spacecraft health management and safe recovery.",
  /** Where the host's own copies are served from. */
  variantPrefix: "/stellrspace-space",
  /** Every page the host serves from its own copy. */
  paths: [
    "/space",
    "/space/academy",
    ...ACADEMY_TRACKS.map((slug) => `/space/academy/${slug}`),
    ...ACADEMY_MISSIONS.map((slug) => `/space/academy/missions/${slug}`),
    "/space/cubesat",
    "/space/everyday-applications",
    "/space/model-rocketry",
    "/space/rocket-engine-digital-twin",
    "/space/rocket-engine-digital-twin-advanced",
    "/space/satellite-engineering",
    "/space/satellite-engineering/interactive-3d",
    "/space/space-station",
    // The owner's profile, unchanged but for one consulting engagement shown on this host only.
    "/about/sudarshana-karkala",
  ],
} as const;

/**
 * The page a host's own copy stands for: /stellrspace-space/space/cubesat is
 * /space/cubesat. Anything else is returned as it is. For code that decides by
 * path (premium routes, the site chrome), which may be handed the rewritten one.
 */
export function fromHostVariant<T extends string | null | undefined>(pathname: T): T {
  const prefix = STELLR_SPACE.variantPrefix;
  return (typeof pathname === "string" && pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname) as T;
}
