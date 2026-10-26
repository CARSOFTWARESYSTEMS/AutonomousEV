import type { Viewport } from "next";
import PremiumContent from "@/components/auth/PremiumContent";
import PremiumPreview from "@/components/auth/PremiumPreview";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import UFlight3DPage from "./UFlight3DPage";
import { structuredData, TITLE, DESCRIPTION } from "./seo";

export { metadata } from "./seo";

export const viewport: Viewport = {
  themeColor: "#030405",
};

function FullExperience() {
  return (
    <>
      <JsonLd data={structuredData} />
      <UFlight3DPage />
    </>
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
          path="/aerospace/uflight-3d"
          title={TITLE}
          description={DESCRIPTION}
          structuredData={structuredData}
        />
      }
    >
      <FullExperience />
    </PremiumContent>
  );
}
