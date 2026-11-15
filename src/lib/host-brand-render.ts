/**
 * Which host a server render is for, set by the host's own copy of a page
 * (src/app/stellrspace-space) before the shared page renders, and read by the
 * shared server components inside it (the footer, the JSON-LD, the copy).
 *
 * One slot per request: React's `cache` gives every server render its own, as
 * next-intl's setRequestLocale does. Nothing sets it on any other host's
 * pages, so they render exactly as before. In client components `cache` keeps
 * nothing, so this reads null there: they use HostBrandContext instead.
 */
import { cache } from "react";
import { SPACE_INITIATIVE } from "@/data/space-initiative";
import { brandText, hostOrganisationFor, type HostBrand } from "./host-brand";

type RenderHost = {
  /** The host the page is rendered for. */
  host: string | null;
  /** The brand the page's organisation is named as, or null to leave its copy as it is (the owner's profile). */
  brand: HostBrand | null;
};

const slot = cache((): RenderHost => ({ host: null, brand: null }));

export function setRenderHost(host: string, brand: HostBrand | null): void {
  Object.assign(slot(), { host, brand });
}

/** The host this render is for, or null for every host but those with their own copies. */
export function renderHost(): string | null {
  return slot().host;
}

/** The brand this render names the page's organisation as, or null. */
export function renderHostBrand(): HostBrand | null {
  return slot().brand;
}

/** A piece of copy as this render presents it: unchanged on every host but one with its own brand. */
export function hostText(text: string): string {
  const brand = renderHostBrand();
  return brand ? brandText(text, brand) : text;
}

/** The organisation a Space page names in this render: ISHAVASYAM.ORG, or the host's brand. */
export function hostOrganisation() {
  return hostOrganisationFor(renderHostBrand(), SPACE_INITIATIVE);
}
