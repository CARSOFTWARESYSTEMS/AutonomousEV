import type { Metadata } from "next";
import { DigitalTwinPage } from "@/components/apex/pages/DigitalTwinPage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("digital-twin");

export default function Page() {
  return <DigitalTwinPage />;
}
