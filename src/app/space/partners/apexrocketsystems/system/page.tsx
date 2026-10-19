import type { Metadata } from "next";
import { SystemPage } from "@/components/apex/pages/SystemPage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("system");

export default function Page() {
  return <SystemPage />;
}
