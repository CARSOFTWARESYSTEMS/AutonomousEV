import type { Viewport } from "next";
import AqipPage from "@/components/aqip/AqipPage";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { display } from "./fonts";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#070a1a",
};

export default function Page() {
  return (
    <div className={display.variable}>
      <JsonLd data={structuredData} />
      <AqipPage />
    </div>
  );
}
