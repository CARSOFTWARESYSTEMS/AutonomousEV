import StepPage from "@/components/revenue/steps/StepPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "marketing",
  title: "Marketing — Steps 3–4: Learn Marketing, Generate Leads | Marketing & Sales | EV.ENGINEER™",
  description: "Find the right Bengaluru aerospace and defence customers, research them, and create a relevant reason for them to start a conversation about FAI software.",
});

export default function Page() {
  return <StepPage page="marketing" />;
}
