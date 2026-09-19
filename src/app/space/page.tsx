import SpaceLanding from "./SpaceLanding";
import { visionReferences } from "./spaceData";
import { buildSpaceEntityGraph } from "@/lib/structured-data/spaceGraph";
import { SEO_TITLE, SEO_DESCRIPTION } from "./seo";

const spaceEntityGraph = {
  "@context": "https://schema.org",
  "@graph": buildSpaceEntityGraph({
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    datePublished: "2026-08-14",
    dateModified: "2026-08-14",
    ogImageUrl: "https://autonomous.ev.engineer/space/opengraph-image",
    diagramImageUrl: "https://autonomous.ev.engineer/space/autonomous-spacecraft-health-management-loop.svg",
    citationUrls: visionReferences.map((ref) => ref.href),
  }),
};

export default function SpacePage() {
  return <SpaceLanding entityGraph={spaceEntityGraph} />;
}
