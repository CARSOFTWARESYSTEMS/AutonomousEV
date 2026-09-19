import SpaceLanding from "../space/SpaceLanding";
import { visionReferences } from "../space/spaceData";
import { buildIshavasyamSpaceGraph } from "@/lib/structured-data/ishavasyamSpaceGraph";
import { SITE_ORIGIN, ORG_NAME, ORG_DESCRIPTOR, SEO_TITLE, SEO_DESCRIPTION } from "./seo";

const entityGraph = {
  "@context": "https://schema.org",
  "@graph": buildIshavasyamSpaceGraph({
    origin: SITE_ORIGIN,
    orgName: ORG_NAME,
    orgDescriptor: ORG_DESCRIPTOR,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    datePublished: "2026-08-14",
    dateModified: "2026-09-19",
    ogImageUrl: `${SITE_ORIGIN}/ishavasyam-space/opengraph-image`,
    diagramImageUrl: `${SITE_ORIGIN}/space/autonomous-spacecraft-health-management-loop.svg`,
    citationUrls: visionReferences.map((ref) => ref.href),
  }),
};

export default function IshavasyamSpacePage() {
  return <SpaceLanding entityGraph={entityGraph} />;
}
