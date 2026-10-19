import type { Metadata } from "next";
import { HomePage } from "@/components/apex/pages/HomePage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("home");

export default function Page() {
  return <HomePage />;
}
