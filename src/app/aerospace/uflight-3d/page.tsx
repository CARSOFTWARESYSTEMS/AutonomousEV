import type { Viewport } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import UFlight3DPage from "./UFlight3DPage";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#030405",
};

export default function Page() {
  return (
    <>
      <JsonLd data={structuredData} />
      <UFlight3DPage />
    </>
  );
}
