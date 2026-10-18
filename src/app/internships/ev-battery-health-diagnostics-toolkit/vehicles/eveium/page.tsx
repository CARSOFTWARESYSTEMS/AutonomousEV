import type { Viewport } from "next";
import EveiumPage from "@/components/ev-battery-toolkit/eveium/EveiumPage";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { manrope, inter } from "@/app/space/fonts";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = { themeColor: "#070a17" };

export default function Page() {
  return (
    <div className={`${manrope.variable} ${inter.variable}`}>
      <JsonLd data={structuredData} />
      <EveiumPage />
    </div>
  );
}
