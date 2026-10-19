import type { Metadata } from "next";
import { CompanyPage } from "@/components/apex/pages/CompanyPage";
import { apexMetadata } from "@/data/apex/seo";

export const metadata: Metadata = apexMetadata("company");

export default function Page() {
  return <CompanyPage />;
}
