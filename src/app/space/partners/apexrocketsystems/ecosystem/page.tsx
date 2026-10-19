import type { Metadata } from "next";
import { EcosystemPage } from "@/components/apex/pages/EcosystemPage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("ecosystem");

export default function Page() {
  return <EcosystemPage />;
}
