import StepPage from "@/components/revenue/steps/StepPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "pilot",
  title: "Pilot — Step 8: Prove Value | Marketing & Sales | EV.ENGINEER™",
  description: "Compare the customer's current FAI workflow with the FAI-assisted workflow on measures agreed before the pilot starts.",
});

export default function Page() {
  return <StepPage page="pilot" />;
}
