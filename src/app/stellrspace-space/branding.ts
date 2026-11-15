import type { SpaceBranding } from "../space/SpaceLanding";
import { STELLR_SPACE } from "@/data/space-host-brands";
import { HOST_FOOTER_LINKS } from "@/lib/host-brand";

/** EV.ENGINEER's own address: "/" on this host is the Space page itself (next.config.ts redirects it). */
const EV_ENGINEER_URL = HOST_FOOTER_LINKS[0].href;

/** The /space page body, named for STELLR SPACE throughout: header, hero, credits, FAQ and footer. */
export const STELLR_BRANDING: SpaceBranding = {
  brand: STELLR_SPACE.name,
  // stellrspace.com itself is a parked page; the brand is this site.
  brandUrl: null,
  article: STELLR_SPACE.article,
  evEngineerHref: EV_ENGINEER_URL,
  headerBrand: STELLR_SPACE.name,
  footerLine: STELLR_SPACE.label,
  footerLinks: [...HOST_FOOTER_LINKS],
};
