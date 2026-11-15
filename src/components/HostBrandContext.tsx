"use client";

import { createContext, useContext, type ReactNode } from "react";
import { hostOrganisationFor, type HostBrand } from "@/lib/host-brand";
import { SPACE_INITIATIVE } from "@/data/space-initiative";

/**
 * The host brand for client components, provided by the host's own copy of a
 * page (src/app/stellrspace-space). Null everywhere else, so every other
 * host's pages render as before. Server components read
 * src/lib/host-brand-render instead.
 */
const HostBrandContext = createContext<HostBrand | null>(null);

export function HostBrandProvider({ brand, children }: { brand: HostBrand; children: ReactNode }) {
  return <HostBrandContext.Provider value={brand}>{children}</HostBrandContext.Provider>;
}

export function useHostBrand(): HostBrand | null {
  return useContext(HostBrandContext);
}

/** The organisation a Space page names: ISHAVASYAM.ORG, or the host's brand. */
export function useHostOrganisation() {
  return hostOrganisationFor(useHostBrand(), SPACE_INITIATIVE);
}
