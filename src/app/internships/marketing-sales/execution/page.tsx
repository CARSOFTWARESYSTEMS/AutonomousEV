import PhasePage from "@/components/revenue/journey/PhasePage";
import { PHASES } from "@/components/revenue/data/framework";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "execution",
  title: "Prove the Business — Weeks 9–12 | B2B Revenue Engineering | EV.ENGINEER™",
  description: "Weeks 9–12: target accounts, customer conversations, opportunities, pilots, proposals, pipeline and revenue evidence.",
});

export default function Page() {
  return <PhasePage phase={PHASES[2]} />;
}
