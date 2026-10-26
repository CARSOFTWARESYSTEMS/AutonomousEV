import AppShell from "../app/AppShell";
import FourWins from "./FourWins";
import Hero from "./Hero";
import StepJourney from "./StepJourney";
import TodayPreview from "./TodayPreview";
import { CaseStudyTeaser, CentralQuestion, CustomerSection, DesignedBy, InternshipCta, ProblemSection } from "./Sections";

/**
 * The public overview, short on purpose: nine sections that answer what we
 * sell, to whom, what problem they might have, what marketing and sales are,
 * and what to do first — then who designed it. The work itself lives on Today
 * and the step pages.
 */
export default function OverviewPage() {
  return (
    <AppShell page="overview">
      <Hero />
      <CentralQuestion />
      <CustomerSection />
      <ProblemSection />
      <StepJourney />
      <TodayPreview />
      <CaseStudyTeaser />
      <FourWins />
      <InternshipCta />
      <DesignedBy />
    </AppShell>
  );
}
