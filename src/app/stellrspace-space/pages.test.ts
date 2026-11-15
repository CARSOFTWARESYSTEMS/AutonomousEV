import { describe, expect, it, vi } from "vitest";
import { STELLR_SPACE } from "@/data/space-host-brands";
import { hostPage } from "./pages";
import { STELLR_CARDS } from "./cards";
import { metadata as profileMetadata } from "../about/sudarshana-karkala/page";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
  Archivo: () => ({ variable: "--font-archivo" }),
  IBM_Plex_Mono: () => ({ variable: "--font-plex-mono" }),
}));

const SPACE_PATHS = STELLR_SPACE.paths.filter((path) => path.startsWith("/space"));
type Image = { url: string; alt?: string };
const images = (value: unknown) => [value].flat().filter(Boolean) as (Image | string)[];
const urlOf = (image: Image | string) => (typeof image === "string" ? image : image.url);

describe("aerospace.stellrspace.com's own copies", () => {
  it("has a copy for every path it serves, and none for any other", () => {
    for (const path of STELLR_SPACE.paths) expect(hostPage(path), path).not.toBeNull();
    for (const path of ["/space/partners/apexrocketsystems", "/aerospace", "/space/academy/missions/unknown", "/"]) expect(hostPage(path), path).toBeNull();
  });

  it.each(SPACE_PATHS)("%s: STELLR SPACE's metadata, on its own address, naming no ISHAVASYAM.ORG", async (path) => {
    const metadata = await hostPage(path)!.metadata();
    expect(JSON.stringify(metadata)).not.toMatch(/ishavasyam/i);
    expect(String(metadata.metadataBase)).toBe("https://aerospace.stellrspace.com/");
    expect(metadata.alternates?.canonical).toBe(`https://aerospace.stellrspace.com${path}`);
    expect(metadata.openGraph?.siteName).toBe("STELLR SPACE");
    expect(String((metadata.openGraph as { url?: string })?.url)).toBe(`https://aerospace.stellrspace.com${path}`);
    const all = [...images(metadata.openGraph?.images), ...images(metadata.twitter?.images)];
    expect(all.length).toBeGreaterThanOrEqual(2);
    for (const image of all) expect(urlOf(image)).toMatch(/^https:\/\/aerospace\.stellrspace\.com\//);
  });

  it("shows the host's own card where the shared one names ISHAVASYAM.ORG", async () => {
    const cardOf = async (path: string) => urlOf(images((await hostPage(path)!.metadata()).openGraph?.images)[0]);
    for (const path of ["/space/academy", "/space/academy/cansat", "/space/academy/missions/survive-the-eclipse"]) expect(await cardOf(path)).toBe("https://aerospace.stellrspace.com/stellrspace-space/og/academy.png");
    for (const card of STELLR_CARDS.filter((c) => c !== "academy")) expect(await cardOf(`/space/${card}`)).toBe(`https://aerospace.stellrspace.com/stellrspace-space/og/${card}.png`);
    expect(await cardOf("/space/space-station")).toBe("https://aerospace.stellrspace.com/space/space-station/opengraph-image");
  });

  it("serves the profile with its metadata unchanged, only naming its card's address", async () => {
    const page = hostPage("/about/sudarshana-karkala")!;
    expect(page.rebrand).toBe(false);
    const metadata = await page.metadata();
    const { openGraph, twitter, ...rest } = metadata;
    const { openGraph: ownOpenGraph, twitter: ownTwitter, ...ownRest } = profileMetadata;
    expect(rest).toEqual(ownRest);
    expect({ ...openGraph, images: undefined }).toEqual({ ...ownOpenGraph, images: undefined });
    expect({ ...twitter, images: undefined }).toEqual({ ...ownTwitter, images: undefined });
    expect(images(openGraph?.images)).toEqual([{ url: "https://autonomous.ev.engineer/about/sudarshana-karkala/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "Sudarshana Karkala — EV.ENGINEER™, Founder of ISHAVASYAM.ORG" }]);
  });
});
