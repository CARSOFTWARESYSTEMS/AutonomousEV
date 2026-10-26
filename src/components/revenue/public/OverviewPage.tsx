import AppShell from "../app/AppShell";
import Hero from "./Hero";
import StepJourney from "./StepJourney";
import TodayPreview from "./TodayPreview";
import { CaseStudyTeaser, CentralQuestion, CustomerSection, DesignedBy, FourWins, InternshipCta, ProblemSection } from "./Sections";

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
      <CaseStudyTeaser />
      <TodayPreview />
      <FourWins />
      <InternshipCta />
      <DesignedBy />
    </AppShell>
  );
}
