import EverydayApplicationsContent from "./EverydayApplicationsContent";
import PremiumContent from "@/components/auth/PremiumContent";
import PremiumPreview from "@/components/auth/PremiumPreview";
import SpaceHeader from "@/app/space/components/SpaceHeader";
import { TITLE, DESCRIPTION, structuredData } from "./seo";
export { metadata } from "./seo";

function FullExperience() {
  return <EverydayApplicationsContent />;
}

/**
 * Signed-in visitors get the full experience. Everyone else — and the server
 * render search engines index — gets the public preview (premiumAuthRoutes).
 */
export default function EverydayApplicationsPage() {
  return (
    <PremiumContent
      preview={
        <PremiumPreview
          path="/space/everyday-applications"
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
