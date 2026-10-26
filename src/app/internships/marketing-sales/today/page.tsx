import TodayPage from "@/components/revenue/today/TodayPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "today",
  title: "Today | Marketing & Sales | EV.ENGINEER™",
  description: "What to do today, step by step: what you are learning, why it matters, what to do, what to ask, what to avoid and the result to finish with — for selling FAI software to Bengaluru aerospace and defence MSMEs.",
});

export default function Page() {
  return <TodayPage />;
}
