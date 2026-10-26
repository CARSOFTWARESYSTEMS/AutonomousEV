import PipelinePage from "@/components/revenue/pipeline/PipelinePage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "pipeline",
  title: "Revenue Cockpit | B2B Revenue Engineering | EV.ENGINEER™",
  description: "Qualified pipeline, opportunities, pilots and the revenue model for the B2B Revenue Engineering framework, saved in your browser.",
  index: false,
});

export default function Page() {
  return <PipelinePage />;
}
