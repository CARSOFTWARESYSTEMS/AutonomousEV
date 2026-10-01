import type { Viewport } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import SatelliteExplorerPage from "./SatelliteExplorerPage";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#04050a",
};

export default function Page() {
  return (
    <>
      <JsonLd data={structuredData} />
      <SatelliteExplorerPage />
    </>
  );
}
