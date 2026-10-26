import StepPage from "@/components/revenue/steps/StepPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "revenue",
  title: "Revenue & Profit — Step 10 | Marketing & Sales | EV.ENGINEER™",
  description: "Revenue is only good when customer value is real: purchase, support, renewal, expansion and profit, explained simply.",
});

export default function Page() {
  return <StepPage page="revenue" />;
}
