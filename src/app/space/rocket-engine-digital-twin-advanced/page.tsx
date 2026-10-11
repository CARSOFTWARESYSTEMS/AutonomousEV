import type { Viewport } from "next";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import AdvancedTwinPage from "@/components/propulsion-twin-advanced/AdvancedTwinPage";
import { inter, manrope } from "../fonts";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#05070b",
};

export default function Page() {
  return (
    <div className={`${manrope.variable} ${inter.variable}`}>
      <JsonLd data={structuredData} />
      <AdvancedTwinPage />
    </div>
  );
}
