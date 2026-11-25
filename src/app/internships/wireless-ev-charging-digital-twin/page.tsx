import type { Viewport } from "next";
import { manrope, inter } from "@/app/space/fonts";
import WirelessTwinPage from "@/components/wireless-ev-twin/WirelessTwinPage";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#05080d",
};

export default function Page() {
  return (
    <div className={`${manrope.variable} ${inter.variable}`}>
      <JsonLd data={structuredData} />
      <WirelessTwinPage />
    </div>
  );
}
