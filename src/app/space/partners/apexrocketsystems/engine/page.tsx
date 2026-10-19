import type { Metadata } from "next";
import { EnginePage } from "@/components/apex/pages/EnginePage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("engine");

export default function Page() {
  return <EnginePage />;
}
