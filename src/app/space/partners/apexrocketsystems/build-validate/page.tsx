import type { Metadata } from "next";
import { BuildValidatePage } from "@/components/apex/pages/BuildValidatePage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("build-validate");

export default function Page() {
  return <BuildValidatePage />;
}
