import Footer from "../app/Footer";
import { PublicHeader } from "../app/SiteHeader";
import Hero from "./Hero";
import MissionPreview from "./MissionPreview";
import RevenueJourney from "./RevenueJourney";
import { CaseStudyTeaser, InternshipCta, JourneyStages, Outcomes } from "./Sections";

/**
 * The public overview: seven short sections that answer what this is, who
 * it is for, what problem it solves, what the twelve weeks are, what to do
 * today and how to enter. The tools themselves live on the framework's pages.
 */
export default function OverviewPage() {
  return (
    <>
      <span id="top" />
      <PublicHeader />
      <main>
        <Hero />
        <RevenueJourney />
        <CaseStudyTeaser />
        <JourneyStages />
        <MissionPreview />
        <Outcomes />
        <InternshipCta />
      </main>
      <Footer />
    </>
  );
}
