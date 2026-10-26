import CaseStudyPage from "@/components/revenue/case/CaseStudyPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "caseStudy",
  title: "Case Study: Balloon Drawings & AS9102 FAI Reporting | Marketing & Sales | EV.ENGINEER™",
  description: "The live case: FAI Engineer for Bengaluru aerospace and defence MSMEs — what the product does today, and the customer problems still to be validated.",
});

export default function Page() {
  return <CaseStudyPage />;
}
