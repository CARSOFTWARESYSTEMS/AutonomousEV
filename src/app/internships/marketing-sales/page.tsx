import OverviewPage from "@/components/revenue/public/OverviewPage";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import { structuredData } from "./seo";

export { metadata } from "./seo";

export default function Page() {
  return (
    <>
      <JsonLd data={structuredData} />
      <OverviewPage />
    </>
  );
}
