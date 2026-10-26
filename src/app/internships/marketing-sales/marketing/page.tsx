import PhasePage from "@/components/revenue/journey/PhasePage";
import { PHASES } from "@/components/revenue/data/framework";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "marketing",
  title: "Prove the Market — Weeks 1–4 | B2B Revenue Engineering | EV.ENGINEER™",
  description: "Weeks 1–4: the Bengaluru aerospace market, the FAI workflow, customer pain, ICP, buyers, positioning, value proposition and go-to-market.",
});

export default function Page() {
  return <PhasePage phase={PHASES[0]} />;
}
