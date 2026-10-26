import StepPage from "@/components/revenue/steps/StepPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "sales",
  title: "Sales — Steps 5–7: Learn Sales, Talk to the Customer, Demonstrate Value | Marketing & Sales | EV.ENGINEER™",
  description: "Understand whether the customer's problem is real, run a discovery meeting with the Customer Meeting Guide, and demonstrate only relevant value.",
});

export default function Page() {
  return <StepPage page="sales" />;
}
