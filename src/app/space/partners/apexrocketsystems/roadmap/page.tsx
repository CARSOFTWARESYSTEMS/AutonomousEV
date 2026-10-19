import type { Metadata } from "next";
import { RoadmapPage } from "@/components/apex/pages/RoadmapPage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("roadmap");

export default function Page() {
  return <RoadmapPage />;
}
