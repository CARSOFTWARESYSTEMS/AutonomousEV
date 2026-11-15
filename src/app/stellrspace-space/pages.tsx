// The pages aerospace.stellrspace.com serves from its own copies (see
// src/data/space-host-brands.ts): what each one's metadata is there, and what
// it renders. ./[...path]/page.tsx serves them.
//
// Every Space page is the shared page, named for STELLR SPACE: its metadata
// through brandMetadata, its JSON-LD and copy through the host brand its
// render is given. The owner's profile is the shared profile, unchanged but
// for the one consulting engagement shown on this host only.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { STELLR_SPACE } from "@/data/space-host-brands";
import { STELLR_HOST_BRAND, brandMetadata } from "@/lib/host-brand";
import { buildIshavasyamSpaceGraph as buildHostSpaceGraph } from "@/lib/structured-data/ishavasyamSpaceGraph";
import { metadata as spaceLayoutMetadata } from "../space/layout";
import SpaceLanding from "../space/SpaceLanding";
import { visionReferences } from "../space/spaceData";
import { STELLR_BRANDING } from "./branding";
import { SPACE_METADATA } from "./space-metadata";
import { stellrCardUrl, type StellrCard } from "./cards";
import { SITE_ORIGIN, ORG_NAME, ORG_DESCRIPTOR, SEO_TITLE, SEO_DESCRIPTION, OG_IMAGE_URL, DATE_PUBLISHED, DATE_MODIFIED } from "./seo";

type Params = Record<string, string>;
/** A page module as Next.js loads it. Its params are whatever its route's are: `never` here accepts every page's. */
type PageModule = {
  default: (props: { params: Promise<never> }) => ReactNode | Promise<ReactNode>;
  metadata?: Metadata;
  generateMetadata?: (props: { params: Promise<never> }) => Metadata | Promise<Metadata>;
};
/** A page's params, for its own type. */
const paramsOf = (params: Params) => Promise.resolve(params) as Promise<never>;

export type HostPage = {
  /** Name the page's organisation as the host's brand (every Space page), or leave its copy as it is (the owner's profile). */
  rebrand: boolean;
  metadata(): Promise<Metadata>;
  render(): Promise<ReactNode>;
};

/** Swaps the shared card for the host's own in a list of Open Graph or Twitter images. */
function withCard(images: unknown, card: StellrCard): unknown {
  const swap = (url: string) => (url.endsWith("/opengraph-image") ? stellrCardUrl(card) : url);
  return [images]
    .flat()
    .filter(Boolean)
    .map((image) => (typeof image === "string" ? swap(image) : { ...(image as object), url: swap(String((image as { url: string | URL }).url)) }));
}

/**
 * A shared Space page, named for STELLR SPACE. `card` is set where the shared
 * social card names ISHAVASYAM.ORG, so the host shows its own instead.
 */
function spacePage(load: () => Promise<PageModule>, options: { params?: Params; card?: StellrCard } = {}): HostPage {
  const params = options.params ?? {};
  return {
    rebrand: true,
    async metadata() {
      const page = await load();
      const own = page.metadata ?? (await page.generateMetadata?.({ params: paramsOf(params) })) ?? {};
      // As Next.js merges them on the shared route: the page's fields over the /space layout's.
      const metadata = brandMetadata({ ...spaceLayoutMetadata, ...own }, STELLR_HOST_BRAND);
      if (!options.card) return metadata;
      return {
        ...metadata,
        openGraph: { ...metadata.openGraph, images: withCard(metadata.openGraph?.images, options.card) } as Metadata["openGraph"],
        twitter: { ...metadata.twitter, images: withCard(metadata.twitter?.images, options.card) } as Metadata["twitter"],
      };
    },
    async render() {
      const { default: Page } = await load();
      return <Page params={paramsOf(params)} />;
    },
  };
}

const spaceGraph = {
  "@context": "https://schema.org",
  "@graph": buildHostSpaceGraph({
    origin: SITE_ORIGIN,
    orgName: ORG_NAME,
    orgDescriptor: ORG_DESCRIPTOR,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    ogImageUrl: OG_IMAGE_URL,
    diagramImageUrl: `${SITE_ORIGIN}/space/autonomous-spacecraft-health-management-loop.svg`,
    citationUrls: visionReferences.map((ref) => ref.href),
  }),
};

/** /space: the shared page body with STELLR SPACE's own branding, metadata and graph (written in full in ./seo.ts). */
const SPACE_HOME: HostPage = {
  rebrand: true,
  metadata: async () => SPACE_METADATA,
  render: async () => <SpaceLanding entityGraph={spaceGraph} branding={STELLR_BRANDING} />,
};

/** The profile's own address, where its card is: Next.js adds it to the shared route from the opengraph-image file, which this copy has not. */
const PROFILE_URL = "https://autonomous.ev.engineer/about/sudarshana-karkala";

/** The owner's profile: its metadata, card and copy exactly as everywhere else. */
const PROFILE: HostPage = {
  rebrand: false,
  async metadata() {
    const [{ metadata }, card] = await Promise.all([import("../about/sudarshana-karkala/page"), import("../about/sudarshana-karkala/opengraph-image")]);
    const image = { url: `${PROFILE_URL}/opengraph-image`, ...card.size, type: card.contentType, alt: card.alt };
    return { ...metadata, openGraph: { ...metadata.openGraph, images: [image] }, twitter: { ...metadata.twitter, images: [image] } };
  },
  async render() {
    const { default: Profile } = await import("../about/sudarshana-karkala/page");
    return <Profile />;
  },
};

const track = (slug: string) => spacePage(() => import("../space/academy/[track]/page"), { params: { track: slug }, card: "academy" });

const PAGES: Record<string, HostPage> = {
  "/space": SPACE_HOME,
  "/space/academy": spacePage(() => import("../space/academy/page"), { card: "academy" }),
  "/space/academy/missions/build-your-first-cubesat": spacePage(() => import("../space/academy/missions/build-your-first-cubesat/page"), { card: "academy" }),
  "/space/academy/missions/survive-the-eclipse": spacePage(() => import("../space/academy/missions/survive-the-eclipse/page"), { card: "academy" }),
  "/space/academy/missions/stable-model-rocket": spacePage(() => import("../space/academy/missions/stable-model-rocket/page"), { card: "academy" }),
  "/space/cubesat": spacePage(() => import("../space/cubesat/page"), { card: "cubesat" }),
  "/space/everyday-applications": spacePage(() => import("../space/everyday-applications/page"), { card: "everyday-applications" }),
  "/space/model-rocketry": spacePage(() => import("../space/model-rocketry/page"), { card: "model-rocketry" }),
  "/space/rocket-engine-digital-twin": spacePage(() => import("../space/rocket-engine-digital-twin/page")),
  "/space/rocket-engine-digital-twin-advanced": spacePage(() => import("../space/rocket-engine-digital-twin-advanced/page")),
  "/space/satellite-engineering": spacePage(() => import("../space/satellite-engineering/page")),
  "/space/satellite-engineering/interactive-3d": spacePage(() => import("../space/satellite-engineering/interactive-3d/page")),
  "/space/space-station": spacePage(() => import("../space/space-station/page")),
  "/about/sudarshana-karkala": PROFILE,
};

/** The host's copy of the page at `path` (as the host serves it, /space/cubesat), or null. */
export function hostPage(path: string): HostPage | null {
  if (!(STELLR_SPACE.paths as readonly string[]).includes(path)) return null;
  const academyTrack = /^\/space\/academy\/(?!missions\/)([^/]+)$/.exec(path);
  return PAGES[path] ?? (academyTrack ? track(academyTrack[1]) : null);
}
