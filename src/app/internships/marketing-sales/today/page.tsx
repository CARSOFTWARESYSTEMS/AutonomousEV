import TodayPage from "@/components/revenue/today/TodayPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "today",
  title: "Today's Mission | B2B Revenue Engineering | EV.ENGINEER™",
  description: "One day of the 12-week B2B marketing and sales framework: learn, do, ask, avoid, capture evidence and review — applied to Bengaluru aerospace and defence MSMEs and AS9102 FAI.",
});

export default function Page() {
  return <TodayPage />;
}
