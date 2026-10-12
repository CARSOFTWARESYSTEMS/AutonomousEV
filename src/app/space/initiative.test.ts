// The Space initiative is an ISHAVASYAM.ORG initiative. These tests hold every
// Space page, its metadata, its structured data and the AI-search file to
// that, and hold the name to the one way it is written.
//
// What may still say "EV Society" in the Space section, and why:
//  - the 2026 rocketry workshop guide, which records who prepared that guide;
//  - the /space community link and the one sentence that describes it.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { ISHAVASYAM, EV_SOCIETY } from "@/data/public-entities";
import { SPACE_INITIATIVE } from "@/data/space-initiative";
import { ISHAVASYAM_ID } from "@/lib/structured-data/entities";
import { buildSpaceEntityGraph } from "@/lib/structured-data/spaceGraph";
import { FAQ as CUBETWIN_FAQ } from "@/lib/cubetwin/content";
import { metadata as spaceMetadata } from "./layout";
import { faqs } from "./spaceData";
import { metadata as cubesatMetadata, structuredData as cubesatGraph } from "./cubesat/seo";
import { metadata as everydayMetadata, structuredData as everydayGraph } from "./everyday-applications/seo";
import { metadata as rocketryMetadata, structuredData as rocketryGraph } from "./model-rocketry/seo";
import { metadata as satelliteMetadata, structuredData as satelliteGraph } from "./satellite-engineering/seo";
import { metadata as explorerMetadata, structuredData as explorerGraph } from "./satellite-engineering/interactive-3d/seo";
import { metadata as stationMetadata } from "./space-station/seo";

const ROOT = join(__dirname, "../../..");
const SPACE = join(ROOT, "src/app/space");
/** A record of who prepared one 2026 workshop guide. Its attribution is history, not the initiative's ownership. */
const HISTORICAL = "2026-INSPACe-ROCKETRY-059";

function sources(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== HISTORICAL) sources(path, found);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) found.push(path);
  }
  return found;
}

const files = [...sources(SPACE), join(ROOT, "src/lib/cubetwin/content.ts"), join(ROOT, "src/lib/structured-data/spaceGraph.ts"), join(ROOT, "src/data/space-initiative.ts")];
/** Source with every run of white space made one space, so a phrase broken across two lines is still found. */
const read = (path: string) => readFileSync(path, "utf8").replace(/\s+/g, " ");

describe("the Space initiative's identity", () => {
  it("is written one way", () => {
    expect(SPACE_INITIATIVE.brand).toBe("ISHAVASYAM.ORG");
    expect(SPACE_INITIATIVE.label).toBe("An ISHAVASYAM.ORG Initiative");
    expect(SPACE_INITIATIVE.line).toBe("Space · An ISHAVASYAM.ORG Initiative");
    expect(SPACE_INITIATIVE.sentence).toBe("Space is an ISHAVASYAM.ORG education, research and engineering initiative.");
    expect(SPACE_INITIATIVE.url).toBe("https://ishavasyam.org/");
    expect(ISHAVASYAM.name).not.toMatch(/™/);
  });

  it("is never spelled another way in a Space source file, outside a URL", () => {
    for (const path of files) {
      const text = read(path).replace(/https?:\/\/[^\s"'`)]+/g, "");
      expect(text, relative(ROOT, path)).not.toMatch(/Ishavasyam\.org|Ishavasyam Org|ISHAVASYAM\.ORG™|\bIshavasyam\b(?!\w)(?![A-Z_a-z]*[:(=])/);
    }
  });

  it("keeps EV Society a separate entity that does not steward Space", () => {
    expect(EV_SOCIETY.id).not.toBe(ISHAVASYAM.id);
    expect(EV_SOCIETY.description).not.toMatch(/space/i);
    expect(ISHAVASYAM.description).toMatch(/Space initiative/);
  });
});

describe("no Space page presents the initiative as EV Society's", () => {
  // Ownership, authorship and branding phrasings. A bare mention of EV Society is judged file by file below.
  const OWNERSHIP = /EV Society(?:™)?(?:'s)? (?:initiative|Initiative|education|educational|research|technical team|Space|Mission)|An EV Society|EV SOCIETY™|"EV Society"|EV Society(?:™)? ·|EV Society \/ EV\.ENGINEER|\| EV Society|EV Society,? UFlight|EV Society & EV\.ENGINEER/;

  it("in any source file of the Space section", () => {
    const offenders = files.filter((path) => OWNERSHIP.test(read(path))).map((path) => relative(ROOT, path));
    expect(offenders).toEqual([]);
  });

  it("and mentions EV Society only where it has a role of its own: the community link on /space", () => {
    const mentioning = files.filter((path) => /EV Society|evsociety/i.test(read(path))).map((path) => relative(ROOT, path));
    expect(mentioning).toEqual(["src/app/space/SpaceLanding.tsx"]);
    const landing = read(join(SPACE, "SpaceLanding.tsx"));
    expect(landing.match(/EV Society|evsociety/gi)).toHaveLength(3);
    expect(landing).toMatch(/Community membership is offered through/);
    expect(landing).toMatch(/https:\/\/www\.evsociety\.org\/join/);
  });

  it("leaves the 2026 workshop guide's own attribution as it was", () => {
    expect(read(join(SPACE, HISTORICAL, "RocketryContent.tsx"))).toMatch(/Prepared by the EV Society \/ EV\.ENGINEER technical team/);
  });
});

describe("metadata and structured data", () => {
  const pages = { "/space": spaceMetadata, "/space/cubesat": cubesatMetadata, "/space/everyday-applications": everydayMetadata, "/space/model-rocketry": rocketryMetadata, "/space/satellite-engineering": satelliteMetadata, "/space/satellite-engineering/interactive-3d": explorerMetadata, "/space/space-station": stationMetadata };

  it.each(Object.entries(pages))("%s names ISHAVASYAM.ORG as publisher and EV Society nowhere", (_route, metadata) => {
    expect(metadata.publisher).toBe("ISHAVASYAM.ORG");
    expect(JSON.stringify(metadata)).not.toMatch(/EV Society|evsociety/i);
  });

  const graphs = {
    "/space": { "@graph": buildSpaceEntityGraph({ title: "t", description: "d", datePublished: "2026-08-14", dateModified: "2026-10-12", ogImageUrl: "https://autonomous.ev.engineer/space/opengraph-image", diagramImageUrl: "https://autonomous.ev.engineer/space/x.svg", citationUrls: [] }) },
    "/space/cubesat": cubesatGraph,
    "/space/everyday-applications": everydayGraph,
    "/space/model-rocketry": rocketryGraph,
    "/space/satellite-engineering": satelliteGraph,
    "/space/satellite-engineering/interactive-3d": explorerGraph,
  };

  it.each(Object.entries(graphs))("%s: the graph has the ISHAVASYAM.ORG organisation, points its page at it, and resolves every reference", (_route, data) => {
    const graph = (data as { "@graph": Record<string, unknown>[] })["@graph"];
    const text = JSON.stringify(graph);
    expect(text).not.toMatch(/EV Society|evsociety/i);
    const owner = graph.find((node) => node["@id"] === ISHAVASYAM_ID)!;
    expect(owner).toMatchObject({ "@type": "Organization", name: "ISHAVASYAM.ORG", url: "https://ishavasyam.org/" });
    const page = graph.find((node) => [node["@type"]].flat().includes("WebPage"))!;
    expect(page.publisher).toEqual({ "@id": ISHAVASYAM_ID });
    // No dangling ownership: every organisation or brand the graph points at is defined in the same graph.
    // (Two of these graphs point at the site's Person node without repeating it. That predates this change and is left as it was.)
    const defined = new Set(graph.map((node) => node["@id"]).filter(Boolean));
    const used = [...text.matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]).filter((id) => /#(organization|brand|website)$/.test(id));
    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((id) => !defined.has(id))).toEqual([]);
  });
});

describe("visible ownership statements", () => {
  it("answers the FAQ as an independent ISHAVASYAM.ORG initiative, with the disclaimers intact", () => {
    const official = faqs.find((f) => f.q === "Is this an official ISRO or government programme?")!;
    expect(official.a).toMatch(/^No\. This is an independent ISHAVASYAM\.ORG initiative\./);
    expect(official.a).toMatch(/do not imply endorsement, affiliation or partnership with ISRO, IN-SPACe, NSIL or the Department of Space/);
    expect(JSON.stringify(faqs)).not.toMatch(/EV Society/);
  });

  it("describes CubeTwin's responsibility in the agreed words", () => {
    const answer = CUBETWIN_FAQ.find((f) => /responsible/i.test(f.q))!.a;
    expect(answer).toMatch(/^CubeTwin is an ISHAVASYAM\.ORG education and research initiative hosted within the EV\.ENGINEER engineering ecosystem\. Commercial engineering, where applicable, is handled separately by iTelematics Software Private Limited under explicit agreements\./);
  });

  it("names ISHAVASYAM.ORG on every Space social card", () => {
    for (const card of ["opengraph-image.tsx", "cubesat/opengraph-image.tsx", "everyday-applications/opengraph-image.tsx", "model-rocketry/opengraph-image.tsx"]) {
      const text = read(join(SPACE, card));
      expect(text, card).toMatch(/ISHAVASYAM\.ORG/);
      expect(text, card).not.toMatch(/EV SOCIETY|EV Society/);
    }
  });
});

describe("AI-search file", () => {
  const llms = read(join(ROOT, "public/llms.txt"));

  it("describes Space, CubeTwin and Satellite Engineering as ISHAVASYAM.ORG's", () => {
    expect(llms).toMatch(/Space is an ISHAVASYAM\.ORG education, > research and engineering initiative\./);
    expect(llms).toMatch(/\[Space\]\(https:\/\/autonomous\.ev\.engineer\/space\): An ISHAVASYAM\.ORG/);
    expect(llms).toMatch(/ISHAVASYAM\.ORG educational R&D CubeSat energy simulator/);
    expect(llms).toMatch(/within the ISHAVASYAM\.ORG Space initiative/);
    expect(llms).not.toMatch(/EV Society's aerospace|stewards the Space Initiative|EV Society Space initiative|EV Society educational R&D/);
  });

  it("keeps the routes on their present domain", () => {
    expect(llms).toMatch(/https:\/\/autonomous\.ev\.engineer\/space\b/);
    expect(llms).not.toMatch(/https:\/\/ishavasyam\.org\/space/);
  });
});
