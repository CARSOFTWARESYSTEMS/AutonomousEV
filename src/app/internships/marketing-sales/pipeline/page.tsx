import PipelinePage from "@/components/revenue/pipeline/PipelinePage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "pipeline",
  title: "Pipeline | Marketing & Sales | EV.ENGINEER™",
  description: "Qualified pipeline, opportunities, pilots and the revenue model for the Marketing & Sales framework, saved in your browser.",
  index: false,
});

export default function Page() {
  return <PipelinePage />;
}
