/**
 * A Space page as a host with its own name presents it: the organisation the
 * page belongs to (its title, publisher, social card, structured data and
 * copy) becomes the host's brand in place of ISHAVASYAM.ORG.
 *
 * Two things never change:
 *  - the owner's own role. "Founder of ISHAVASYAM.ORG" (or "Founder ·",
 *    "Founder —") describes the person, not the page, and stays as it is;
 *    so does every Person node of the structured data.
 *  - the owner's profile, and any address on aerospace.ishavasyam.org.
 *
 * Pure functions, shared by server and client code. Which brand a render is
 * for comes from ./host-brand-render (server) or HostBrandContext (client).
 */
import type { Metadata } from "next";
import { ISHAVASYAM } from "@/data/public-entities";
import { STELLR_SPACE } from "@/data/space-host-brands";

export type HostBrand = {
  id: string;
  /** Always written exactly so. */
  name: string;
  /** The host's own address, no trailing slash. */
  origin: string;
  /** The indefinite article before the name. */
  article: "a" | "an";
  /** "A STELLR SPACE Initiative". */
  label: string;
  /** Where the brand's name links on its own host. */
  url: string;
  /** One line on what it is, for its structured-data node. */
  descriptor: string;
};

export const STELLR_HOST_BRAND: HostBrand = {
  id: STELLR_SPACE.id,
  name: STELLR_SPACE.name,
  origin: STELLR_SPACE.origin,
  article: STELLR_SPACE.article,
  label: STELLR_SPACE.label,
  url: `${STELLR_SPACE.origin}/space`,
  descriptor: STELLR_SPACE.descriptor,
};

const ORG = "ISHAVASYAM\\.ORG";
/** The owner's own role: kept word for word. */
const PERSONAL = new RegExp(`Founder(?: of|\\s*[·—–-])\\s*${ORG}`, "g");
const HOLD = "\u0000";

/** A piece of copy, metadata or structured data, with the page's organisation named as the host's brand. */
export function brandText(text: string, brand: HostBrand): string {
  if (!/ishavasyam|ev\.engineer\/space/i.test(text)) return text;
  const kept: string[] = [];
  const held = text.replace(PERSONAL, (phrase) => `${HOLD}${kept.push(phrase) - 1}${HOLD}`);
  const article = brand.article;
  return held
    .replace(new RegExp(`${ORG} · Space Research Organisation`, "g"), brand.name)
    .replace(new RegExp(`\\bAn ${ORG}`, "g"), `${article.charAt(0).toUpperCase()}${article.slice(1)} ${brand.name}`)
    .replace(new RegExp(`\\ban ${ORG}`, "g"), `${article} ${brand.name}`)
    .replace(new RegExp(ORG, "g"), brand.name)
    .replace(/https:\/\/ishavasyam\.org(?=[/#?"\s]|$)/g, brand.origin)
    .replace(/https:\/\/(?:autonomous|aerospace)\.ev\.engineer\/space(?=[/#?"\s]|$)/g, `${brand.origin}/space`)
    .replace(new RegExp(`${HOLD}(\\d+)${HOLD}`, "g"), (_, i: string) => kept[Number(i)]);
}

/** Every string in a value, through brandText. URLs included; Dates and functions as they are. */
export function brandValue<T>(value: T, brand: HostBrand): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return brandText(v, brand);
    if (v instanceof URL) return new URL(brandText(v.href, brand));
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(value) as T;
}

type Node = Record<string, unknown>;
const isNode = (v: unknown): v is Node => !!v && typeof v === "object" && !Array.isArray(v);
const isPerson = (n: Node) => [n["@type"]].flat().includes("Person");
/** ISHAVASYAM.ORG's own node, as opposed to a reference to it ({"@id": …} alone). */
const isOrgNode = (v: unknown): v is Node => isNode(v) && v["@id"] === ISHAVASYAM.id && "@type" in v;

/**
 * A JSON-LD graph as the host presents it: ISHAVASYAM.ORG's node becomes the
 * brand's, every reference to it points at the brand's, and names and
 * addresses follow. Person nodes are left exactly as they are; if one of them
 * points at ISHAVASYAM.ORG, its node is kept beside the brand's.
 */
export function brandGraph<T>(data: T, brand: HostBrand): T {
  const persons: Node[] = [];
  const findPersons = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(findPersons);
    else if (isNode(v)) {
      if (isPerson(v)) persons.push(v);
      else Object.values(v).forEach(findPersons);
    }
  };
  findPersons(data);
  const keepOrg = JSON.stringify(persons).includes(ISHAVASYAM.id);
  const brandNode: Node = { "@type": "Organization", "@id": `${brand.origin}/#organization`, name: brand.name, url: `${brand.origin}/`, description: brand.descriptor };

  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return brandText(v, brand);
    if (Array.isArray(v)) return v.flatMap((x) => (isOrgNode(x) ? (keepOrg ? [x, brandNode] : [brandNode]) : [walk(x)]));
    if (isNode(v)) {
      if (isPerson(v)) return v;
      if (isOrgNode(v)) return brandNode;
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(data) as T;
}

export type SocialImage = { url: string; width: number; height: number; type: string; alt: string };

/**
 * A page's metadata as the host presents it: names, canonical and Open Graph
 * addresses on the host, the host as the site, and, where given, the host's
 * own social card for both Open Graph and Twitter.
 */
export function brandMetadata(metadata: Metadata, brand: HostBrand, image?: SocialImage): Metadata {
  const m = brandValue(metadata, brand);
  const images = image ? [image] : undefined;
  return {
    ...m,
    metadataBase: new URL(brand.origin),
    openGraph: { ...(m.openGraph ?? {}), siteName: brand.name, ...(images ? { images } : {}) } as Metadata["openGraph"],
    twitter: { ...(m.twitter ?? {}), ...(images ? { images } : {}) } as Metadata["twitter"],
  };
}

/** The organisation a Space page names: the shared initiative's, or the host's brand. Its URL is where its name links. */
export function hostOrganisationFor(brand: HostBrand | null, initiative: { brand: string; url: string; label: string }) {
  return brand
    ? { brand: brand.name, url: brand.url, article: brand.article, label: brand.label }
    : { brand: initiative.brand, url: initiative.url, article: "an" as const, label: initiative.label };
}

/** The Space footer's links on a host with its own brand: EV.ENGINEER's own site (that host's "/" is Space), UFlight and iTelematics. */
export const HOST_FOOTER_LINKS = [
  { label: "EV.ENGINEER", href: "https://ev.engineer/" },
  { label: "UFlight", href: "https://www.uflight.in/" },
  { label: "iTelematics", href: "https://itelematics.com/" },
] as const;
