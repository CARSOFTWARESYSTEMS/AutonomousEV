import { SectionHeader } from "../SectionHeader";
import { AssessmentWizard } from "./assessment-wizard/AssessmentWizard";

export function AssessmentWizardSection() {
  return (
    <section className="section bg-surface" id="assessment-wizard" aria-labelledby="assessment-wizard-heading">
      <div className="container">
        <SectionHeader label="Engineering Assessment Tool" title="Battery Cybersecurity Assessment Wizard" headingId="assessment-wizard-heading">
          <p>
            A structured, engineering-grade self-assessment across 9 trust dimensions — Identity, Integrity,
            Authenticity, Availability, Safety, Evidence, Resilience, Detection, and Verification. Fully deterministic,
            runs entirely in your browser, and produces a traceable, exportable report.
          </p>
        </SectionHeader>
        <AssessmentWizard />
      </div>
    </section>
  );
}
