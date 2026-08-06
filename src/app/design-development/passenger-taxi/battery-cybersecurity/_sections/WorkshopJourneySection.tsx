import { WORKSHOP_JOURNEY } from "@/lib/battery-cybersecurity/data/workshopJourney";
import { SectionHeader } from "../SectionHeader";
import pageStyles from "../page.module.css";

export function WorkshopJourneySection() {
  return (
    <section className="section" id="workshop-journey" aria-labelledby="workshop-journey-heading">
      <div className="container">
        <SectionHeader label="Workshop Journey" title="Discovery -> Threat Modelling -> Architecture Review -> Risk Assessment -> Detection Design -> Verification -> POC -> Roadmap" headingId="workshop-journey-heading">
          <p>The eight-stage path a discovery engagement follows, expanding on the three phases described in the Workshop Offering section below.</p>
        </SectionHeader>

        <ol style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", listStyle: "none" }}>
          {WORKSHOP_JOURNEY.sort((a, b) => a.order - b.order).map((stage) => (
            <li key={stage.id} className={pageStyles.navyPanel} style={{ padding: "16px" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--bcs-cyan)", marginBottom: "6px" }}>
                {String(stage.order).padStart(2, "0")}
              </p>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "6px" }}>{stage.name}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
