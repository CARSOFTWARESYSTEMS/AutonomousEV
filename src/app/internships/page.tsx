import Link from "next/link";
import { ReactNode } from "react";
import PrerequisitesSection from "@/components/PrerequisitesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AV & EV Internships | EV.ENGINEER™',
  description: 'Practical, engineering-focused internships in EV battery health, autonomous vehicle systems, safety systems, passenger taxis, and RTOS architecture. Kickstart your career in autonomous eMobility.',
  keywords: [
    'EV Internships', 'AV Internships', 'Autonomous Vehicles Internship',
    'Electric Vehicle Research', 'Battery Diagnostics Internship',
    'Robotaxi Internships', 'Super-Intelligent AI EMS',
    'EV Engineering Internships', 'EV Repair Workshop Internships',
    'AICTE Internships', 'VTU Internships in EV'
  ]
};

// Helper component for identical styling of internal and external links
function ProjectCard({ title, desc, link, pricingLink }: { title: string, desc?: string, link: string, pricingLink?: string }) {
  const isExternal = link.startsWith('http');

  // When a pricingLink exists we cannot wrap the whole card in <a> (nested anchors = invalid HTML).
  // Instead, render the card as a <div> and put both links explicitly in the footer.
  if (pricingLink) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
          {title}
        </h3>
        {desc && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1, marginBottom: '16px' }}>{desc}</p>}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
            data-track-event="internship_card_click"
            data-track-title={title}
          >
            Visit Website
            <span style={{ marginLeft: '6px', fontSize: '1.1rem' }}>↗</span>
          </a>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>·</span>
          <a
            href={pricingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="pricing-link"
            data-track-event="internship_pricing_click"
            data-track-title={title}
          >
            Pricing ↗
          </a>
        </div>
      </div>
    );
  }

  // No pricingLink — whole card is a single clickable anchor (original behaviour)
  const cardContent = (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
        {title}
      </h3>
      {desc && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1, marginBottom: '16px' }}>{desc}</p>}

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
        {isExternal ? 'Visit Website' : 'Explore Program'}
        <span style={{ marginLeft: '6px', fontSize: '1.1rem', transition: 'transform 0.2s ease' }} className="cta-arrow">
          {isExternal ? '↗' : '→'}
        </span>
      </div>
    </div>
  );

  return isExternal ? (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} className="project-card-link" data-track-event="internship_card_click" data-track-title={title}>
      {cardContent}
    </a>
  ) : (
    <Link href={link} style={{ textDecoration: 'none' }} className="project-card-link" data-track-event="internship_card_click" data-track-title={title}>
      {cardContent}
    </Link>
  );
}

function Section({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {children}
      </div>
    </div>
  );
}

export default function InternshipsPage() {
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <section className="section">
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '16px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>AV, EV & Battery</span> Internships <span style={{ color: 'var(--accent-primary)' }}>&</span> Workshops
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--accent-primary)", fontWeight: "400", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "48px" }}>
            Building <strong className="glowing-text">World-Class Engineers</strong> to Solve <strong className="glowing-text">Energy</strong> and <strong className="glowing-text">EV Battery</strong> Challenges
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '56px', lineHeight: 1.6 }}>
            Gain hands-on experience in EV Battery Diagnostics, Autonomous System integration, and more.
            Explore ongoing initiatives across Research, Proof of Concepts, and structured Design & Development.
          </p>

          <PrerequisitesSection />

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '64px', justifyContent: 'center' }}>
            <a
              href="https://labs.ev.engineer/"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              data-track-event="cta_click"
              data-track-label="EV Workshop"
            >
              EV Workshop
            </a>
            <Link
              href="/ev-career"
              className="btn btn-primary"
              data-track-event="cta_click"
              data-track-label="Prepare for EV Career"
            >
              Prepare for EV Career
            </Link>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20Resume%20Optimisation"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              data-track-event="cta_click"
              data-track-label="Resume Optimisation"
            >
              Resume Optimisation
            </a>
            <a
              href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20a%20Mock%20Interview"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              data-track-event="cta_click"
              data-track-label="Mock Interview"
            >
              Mock Interview
            </a>
            <a
              href="https://carsoftwaresystems.com/#testimonial"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              data-track-event="cta_click"
              data-track-label="Gallery"
            >
              Gallery
            </a>
          </div>

          <Section title="Design & Development">
            <ProjectCard
              title="EV Battery Intelligence Platform"
              desc="Risk analysis and advanced thermal runaway prevention implementations."
              link="/internships/battery-fire-prevention"
            />
            <ProjectCard
              title="Battery Pack Aadhaar System"
              desc="Unified identity protocols for battery life tracking and health."
              link="/internships/battery-aadhaar"
            />
          </Section>

          <Section title="GenAI & Agentic AI Projects">
            <ProjectCard
              title="EV Help Agent"
              desc="AI Voice Agent that talks to EV users, understands their problems, and answers relevant questions based on real-time queries."
              link="https://help.ev.engineer/"
            />
          </Section>

          <Section title="Research">
            <ProjectCard
              title="Super-Intelligent AI EMS"
              desc="AI-Driven Energy Management Systems for Autonomous EVs."
              link="/si-ems"
            />
            <ProjectCard
              title="EV Battery Health & Diagnostics"
              desc="Advanced diagnostics and intelligence for battery lifecycles."
              link="https://battery.ev.engineer/"
            />
          </Section>

          <Section title="Proof of Concept">
            <ProjectCard
              title="Autonomous Passenger Taxi"
              desc="End-to-end design lifecycle for urban ride services."
              link="/design-development/passenger-taxi"
            />
            <ProjectCard
              title="Autonomous Airport Cargo EV"
              desc="Duty-cycle analysis and integrations for closed-loop environments."
              link="/design-development/airport-cargo"
            />
          </Section>

          <Section title="EV Workshop">
            <ProjectCard
              title="EV Repair Workshop"
              desc="Specialized focus on EV diagnostics, repair mechanisms, and maintenance workflows."
              link="https://repair.ev.engineer/"
            />
            <ProjectCard
              title="BMC - Battery Circular Economy"
              desc="End-to-end financial model for EV battery secondary life — cost breakdown, cell grading, repacking economics, and Business Model Canvas."
              link="/internships/battery-circular-economy"
            />
          </Section>

          <Section title="Miscellaneous">
            <ProjectCard
              title="EV Career"
              link="/ev-career"
            />
            <ProjectCard
              title="EV Startup"
              link="/internships/miscellaneous/startup"
            />
            <ProjectCard
              title="VTU Internyet"
              link="https://vtu.internyet.in/"
            />
            <ProjectCard
              title="AICTE Internships"
              link="https://internship.aicte-india.org/"
            />
            <ProjectCard
              title="Projects @ iTelematics®"
              link="https://itelematics.com/"
              pricingLink="https://itelematics.com/public/iTelematics-FrequentlyAskedQuestions.pdf"
            />
            <ProjectCard
              title="Projects @ Thasmai Infotech"
              link="https://www.thasmaiinfotech.com/#programs"
              pricingLink="https://www.thasmaiinfotech.com/training/Thasmai%20-%20Internship%20and%20Faculty%20Development%20Program%20.pdf"
            />
            <ProjectCard
              title="Webinars @ EV Society™"
              link="https://www.evsociety.org/projects"
            />
            <ProjectCard
              title="CAR Software Systems"
              link="https://carsoftwaresystems.com/"
              pricingLink="https://carsoftwaresystems.com/#pricing"
            />
            <ProjectCard
              title="Ongoing vs Completed"
              link="https://labs.ev.engineer/"
            />
          </Section>

          <div style={{ marginTop: '80px', textAlign: 'center', paddingBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '24px' }}>Ready to Take the Next Step?</h2>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/919108206147?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20the%20EV%2FAV%20internship%20opportunities%20listed%20on%20EV.ENGINEER%E2%84%A2.%20Could%20you%20please%20share%20more%20details%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                data-track-event="internships_whatsapp_click"
              >
                Contact Us
              </a>
              <a
                href="mailto:info@iTelematics.com?subject=Resume%20Submission%20%E2%80%94%20EV%2FAV%20Internship&body=Hi%20Team%2C%0A%0AI%20came%20across%20EV.ENGINEER%E2%84%A2%20and%20would%20like%20to%20apply%20for%20an%20EV%2FAV%20internship%20opportunity.%0A%0APlease%20find%20my%20resume%20attached.%0A%0AThank%20you!"
                className="btn btn-primary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                data-track-event="internships_submit_resume_click"
              >
                Submit Resume
              </a>
              <a
                href="https://carsoftwaresystems.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                data-track-event="internships_training_click"
              >
                Training
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
