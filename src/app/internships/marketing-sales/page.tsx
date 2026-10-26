import type { Viewport } from "next";
import RevenuePage from "@/components/revenue/RevenuePage";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { display } from "./fonts";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#06090f",
};

export default function Page() {
  return (
    <div className={display.variable}>
      <JsonLd data={structuredData} />
      <RevenuePage />
    </div>
  );
}
