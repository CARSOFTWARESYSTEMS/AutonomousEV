/**
 * Where the APEX Rocket Systems microsite lives, said once.
 *
 * Nothing else in the microsite writes "/space/partners/apexrocketsystems" or a
 * host name. Links go through `apexHref`, canonical URLs through `apexUrl`,
 * files in /public through `apexAsset`. Moving the site to APEX's own server
 * is a matter of setting these four values at build time:
 *
 *   NEXT_PUBLIC_APEX_BASE_PATH=/
 *   NEXT_PUBLIC_APEX_SITE_URL=https://www.apexrocketsystems.com
 *   NEXT_PUBLIC_APEX_ASSET_PATH=/apexrocketsystems
 *   NEXT_PUBLIC_APEX_PARENT_PORTAL=none
 *
 * and copying the route folder (see docs/apexrocketsystems.md).
 */

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function normaliseBase(value: string): string {
  const trimmed = trimSlashes(value);
  return trimmed ? `/${trimmed}` : "";
}

/** "" when the microsite is the root of its host, otherwise "/a/b" with no trailing slash. */
export const APEX_BASE_PATH = normaliseBase(process.env.NEXT_PUBLIC_APEX_BASE_PATH ?? "/space/partners/apexrocketsystems");
/** Scheme and host of the canonical address, without a trailing slash. */
export const APEX_SITE_URL = (process.env.NEXT_PUBLIC_APEX_SITE_URL ?? "https://aerospace.gamyaa.in").replace(/\/+$/, "");
/** Folder in /public that holds the APEX images. */
export const APEX_ASSET_PATH = normaliseBase(process.env.NEXT_PUBLIC_APEX_ASSET_PATH ?? "/apexrocketsystems");
/** APEX's own website: the authority for every public claim on this microsite. */
export const APEX_OFFICIAL_SITE_URL = "https://www.apexrocketsystems.com/";

/** A path inside the microsite. `apexHref("/engine")` → "/space/partners/apexrocketsystems/engine". */
export function apexHref(path = "/"): string {
  const [pathname, hash] = path.split("#");
  const sub = trimSlashes(pathname ?? "");
  const joined = sub ? `${APEX_BASE_PATH}/${sub}` : APEX_BASE_PATH || "/";
  return hash ? `${joined}#${hash}` : joined;
}

/** The absolute canonical address of a page in the microsite. */
export function apexUrl(path = "/"): string {
  return `${APEX_SITE_URL}${apexHref(path)}`;
}

/** A file in the APEX asset folder. `apexAsset("brand/x.png")` → "/apexrocketsystems/brand/x.png". */
export function apexAsset(file: string): string {
  return `${APEX_ASSET_PATH}/${trimSlashes(file)}`;
}

/** Pages of APEX's official website that this microsite cites. */
export const APEX_OFFICIAL_PAGES = {
  home: APEX_OFFICIAL_SITE_URL,
  about: `${APEX_OFFICIAL_SITE_URL}about`,
  hardware: `${APEX_OFFICIAL_SITE_URL}hardware`,
  developmentTesting: `${APEX_OFFICIAL_SITE_URL}development-testing`,
  partner: `${APEX_OFFICIAL_SITE_URL}partner-with-us`,
} as const;

/**
 * The portal the microsite currently sits inside, for the breadcrumb and the
 * footer's way back. Set NEXT_PUBLIC_APEX_PARENT_PORTAL=none when it stands alone.
 */
export const APEX_PARENT_PORTAL: { name: string; href: string; url: string } | null =
  process.env.NEXT_PUBLIC_APEX_PARENT_PORTAL === "none"
    ? null
    : { name: "Gamyaa Space", href: "/space", url: "https://aerospace.gamyaa.in/space" };

/** Who hosts and prepared this concept experience. Shown discreetly in the footer only. */
export const APEX_CONCEPT_HOST = {
  name: "Gamyaa Aerospace",
  url: "https://aerospace.gamyaa.in/aerospace",
} as const;

export const APEX_SITE = {
  name: "APEX Rocket Systems",
  shortName: "APEX",
  tagline: "Engineered to ascend.",
  supportingLine: "From propulsion hardware toward validated rocket systems.",
  conceptStatus: "Concept · Engineering Collaboration Proposal",
  disclosure: "Concept experience developed as an engineering collaboration proposal.",
  ownerRole: "Rocket System & Propulsion Program Owner",
  themeColor: "#050607",
} as const;

export type ApexNavItem = { id: string; label: string; path: string };

/** The microsite's navigation. Eight items, no more. */
export const APEX_NAV: readonly ApexNavItem[] = [
  { id: "home", label: "APEX", path: "/" },
  { id: "engine", label: "Engine", path: "/engine" },
  { id: "system", label: "System", path: "/system" },
  { id: "build-validate", label: "Build & Validate", path: "/build-validate" },
  { id: "digital-twin", label: "Digital Twin", path: "/digital-twin" },
  { id: "roadmap", label: "Roadmap", path: "/roadmap" },
  { id: "ecosystem", label: "Ecosystem", path: "/ecosystem" },
  { id: "company", label: "Company", path: "/company" },
];

/** Every route of the microsite, for the sitemap and the route tests. */
export const APEX_ROUTES = APEX_NAV.map((item) => item.path);
