import { describe, expect, it } from "vitest";
import { STELLR_HOST_BRAND as STELLR, brandGraph, brandMetadata, brandText } from "./host-brand";

describe("brandText: the page's organisation as the host's brand", () => {
  it("names STELLR SPACE in place of ISHAVASYAM.ORG, with its own article", () => {
    expect(brandText("Space Academy is part of an independent ISHAVASYAM.ORG education initiative.", STELLR)).toBe("Space Academy is part of an independent STELLR SPACE education initiative.");
    expect(brandText("CubeTwin is an ISHAVASYAM.ORG education and research initiative", STELLR)).toBe("CubeTwin is a STELLR SPACE education and research initiative");
    expect(brandText("An ISHAVASYAM.ORG Initiative on EV.ENGINEER", STELLR)).toBe("A STELLR SPACE Initiative on EV.ENGINEER");
    expect(brandText("Space Academy | ISHAVASYAM.ORG", STELLR)).toBe("Space Academy | STELLR SPACE");
    expect(brandText("ISHAVASYAM.ORG · Space Research Organisation", STELLR)).toBe("STELLR SPACE");
  });

  it("moves the page's own addresses to the host, and leaves every other address", () => {
    expect(brandText("https://aerospace.ev.engineer/space/academy/cansat", STELLR)).toBe("https://aerospace.stellrspace.com/space/academy/cansat");
    expect(brandText("https://autonomous.ev.engineer/space#mission", STELLR)).toBe("https://aerospace.stellrspace.com/space#mission");
    expect(brandText("https://ishavasyam.org/#organization", STELLR)).toBe("https://aerospace.stellrspace.com/#organization");
    for (const kept of ["https://autonomous.ev.engineer/", "https://autonomous.ev.engineer/spacecraft", "https://autonomous.ev.engineer/about/sudarshana-karkala", "https://aerospace.ishavasyam.org/about/sudarshana-karkala"]) {
      expect(brandText(kept, STELLR)).toBe(kept);
    }
  });

  it("never rebrands the owner's own role", () => {
    for (const role of ["Founder · ISHAVASYAM.ORG", "Founder — ISHAVASYAM.ORG", "He is the Founder of ISHAVASYAM.ORG; EV.ENGINEER is his identity."]) {
      expect(brandText(role, STELLR)).toBe(role);
    }
    expect(brandText("Founder of ISHAVASYAM.ORG. Space is an ISHAVASYAM.ORG initiative.", STELLR)).toBe("Founder of ISHAVASYAM.ORG. Space is a STELLR SPACE initiative.");
  });
});

describe("brandGraph", () => {
  const ORG = { "@type": "Organization", "@id": "https://ishavasyam.org/#organization", name: "ISHAVASYAM.ORG", url: "https://ishavasyam.org/", description: "ISHAVASYAM.ORG is the organisation behind the Space initiative." };
  const PERSON = { "@type": "Person", "@id": "https://autonomous.ev.engineer/about/sudarshana-karkala#person", name: "Sudarshana Karkala", description: "He is the Founder of ISHAVASYAM.ORG." };

  it("makes the host's brand the page's organisation, and points every reference at it", () => {
    const graph = brandGraph({ "@context": "https://schema.org", "@graph": [ORG, { "@type": "WebPage", "@id": "https://aerospace.ev.engineer/space/cubesat#webpage", name: "CubeTwin | ISHAVASYAM.ORG", publisher: { "@id": ORG["@id"] } }] }, STELLR);
    expect(graph["@graph"]).toEqual([
      { "@type": "Organization", "@id": "https://aerospace.stellrspace.com/#organization", name: "STELLR SPACE", url: "https://aerospace.stellrspace.com/", description: STELLR.descriptor },
      { "@type": "WebPage", "@id": "https://aerospace.stellrspace.com/space/cubesat#webpage", name: "CubeTwin | STELLR SPACE", publisher: { "@id": "https://aerospace.stellrspace.com/#organization" } },
    ]);
  });

  it("leaves a Person node exactly as it is, and keeps ISHAVASYAM.ORG's node where a person points at it", () => {
    const linked = { ...PERSON, worksFor: { "@id": ORG["@id"] } };
    const graph = brandGraph([ORG, linked], STELLR) as object[];
    expect(graph).toContainEqual(linked);
    expect(graph).toContainEqual(ORG);
    expect(graph.map((n) => (n as { name: string }).name)).toContain("STELLR SPACE");
    expect(brandGraph([ORG, PERSON], STELLR)).toEqual([expect.objectContaining({ name: "STELLR SPACE" }), PERSON]);
  });
});

describe("brandMetadata", () => {
  it("puts the page on the host, names the host as the site, and gives it the host's card where one is given", () => {
    const image = { url: "https://aerospace.stellrspace.com/stellrspace-space/og/cubesat.png", width: 1200, height: 630, type: "image/png", alt: "CubeTwin" };
    const metadata = brandMetadata(
      { title: "CubeTwin | ISHAVASYAM.ORG", creator: "ISHAVASYAM.ORG", alternates: { canonical: "https://aerospace.ev.engineer/space/cubesat" }, openGraph: { siteName: "EV.ENGINEER", url: "https://aerospace.ev.engineer/space/cubesat" }, twitter: { card: "summary_large_image" } },
      STELLR,
      image,
    );
    expect(metadata).toMatchObject({ title: "CubeTwin | STELLR SPACE", creator: "STELLR SPACE", alternates: { canonical: "https://aerospace.stellrspace.com/space/cubesat" } });
    expect(String(metadata.metadataBase)).toBe("https://aerospace.stellrspace.com/");
    expect(metadata.openGraph).toMatchObject({ siteName: "STELLR SPACE", url: "https://aerospace.stellrspace.com/space/cubesat", images: [image] });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", images: [image] });
  });
});
