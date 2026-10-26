import type { Viewport } from "next";
import PremiumContent from "@/components/auth/PremiumContent";
import PremiumPreview from "@/components/auth/PremiumPreview";
import SpaceHeader from "@/app/space/components/SpaceHeader";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import RocketTwinPage from "@/components/rocket-engine-twin/RocketTwinPage";
import { inter, manrope } from "../fonts";
import { structuredData, TITLE, DESCRIPTION } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#05070b",
};

function FullExperience() {
  return (
    <div className={`${manrope.variable} ${inter.variable}`}>
      <JsonLd data={structuredData} />
      <RocketTwinPage />
    </div>
  );
}

/**
 * Signed-in visitors get the full experience. Everyone else — and the server
 * render search engines index — gets the public preview (premiumAuthRoutes).
 */
export default function Page() {
  return (
    <PremiumContent
      preview={
        <PremiumPreview
          path="/space/rocket-engine-digital-twin"
          title={TITLE}
          description={DESCRIPTION}
          structuredData={structuredData}
          header={<SpaceHeader basePath="/space" />}
        />
      }
    >
      <FullExperience />
    </PremiumContent>
  );
}
