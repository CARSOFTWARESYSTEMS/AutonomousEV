import StepPage from "@/components/revenue/steps/StepPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "close",
  title: "Proposal & Close — Step 9 | Marketing & Sales | EV.ENGINEER™",
  description: "Turn validated value into a clear proposal, and guide an aerospace customer through technical review, security, procurement and the purchase order.",
});

export default function Page() {
  return <StepPage page="close" />;
}
