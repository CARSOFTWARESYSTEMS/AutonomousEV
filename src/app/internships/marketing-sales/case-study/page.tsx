import CaseStudyPage from "@/components/revenue/case/CaseStudyPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "caseStudy",
  title: "Case Study: Balloon Drawings & AS9102 FAI Reporting | B2B Revenue Engineering",
  description: "The live case: FAI Engineer, the Bengaluru aerospace market, problem hypotheses, ICP, buyer map, evidence, value proposition, demo, ROI, objections and pilot.",
});

export default function Page() {
  return <CaseStudyPage />;
}
