import PhasePage from "@/components/revenue/journey/PhasePage";
import { PHASES } from "@/components/revenue/data/framework";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "sales",
  title: "Prove the Sales Motion — Weeks 5–8 | B2B Revenue Engineering | EV.ENGINEER™",
  description: "Weeks 5–8: account research, prospecting, customer discovery, qualification, demo, ROI, pilot, proposal and negotiation for aerospace B2B software.",
});

export default function Page() {
  return <PhasePage phase={PHASES[1]} />;
}
