import StepPage from "@/components/revenue/steps/StepPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "customer",
  title: "Customer — Steps 1–2: Understand the Customer, Find the Pain | Marketing & Sales | EV.ENGINEER™",
  description: "Who in a Bengaluru aerospace or defence MSME does the FAI work, feels the problem and approves a purchase — and how to find workflow pain without assuming it.",
});

export default function Page() {
  return <StepPage page="customer" />;
}
