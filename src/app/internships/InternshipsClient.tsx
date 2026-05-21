"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PrerequisitesSection from "@/components/PrerequisitesSection";
import { Rocket } from "lucide-react";

function ProjectCard({ title, desc, link, pricingLink, secondaryLink, secondaryLinkLabel, tertiaryLink, tertiaryLinkLabel, category, badge, tags, ctaLabel, icon: Icon }: { title: string, desc?: string, link: string, pricingLink?: string, secondaryLink?: string, secondaryLinkLabel?: string, tertiaryLink?: string, tertiaryLinkLabel?: string, category?: string, badge?: string, tags?: string[], ctaLabel?: string, icon?: any }) {
  const isExternal = link.startsWith('http');
  const sLink = pricingLink || secondaryLink;
  const sLabel = pricingLink ? "Pricing" : secondaryLinkLabel;

  if (sLink) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {category && (
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
            {category}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {Icon && <Icon size={20} color="var(--accent-primary)" />}
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
            {title}
          </h3>
        </div>
        {badge && (
          <div style={{ display: 'inline-block', background: 'rgba(76, 169, 48, 0.1)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '12px', alignSelf: 'flex-start' }}>
            {badge}
          </div>
        )}
        {desc && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1, marginBottom: '16px' }}>{desc}</p>}
        {tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isExternal ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
              data-track-event="internship_card_click"
              data-track-title={title}
            >
              {ctaLabel ? ctaLabel : "Visit Website"}
              <span style={{ marginLeft: '6px', fontSize: '1.1rem' }}>↗</span>
            </a>
          ) : (
            <Link
              href={link}
              style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
              data-track-event="internship_card_click"
              data-track-title={title}
            >
              {ctaLabel ? ctaLabel : "Explore Program"}
              <span style={{ marginLeft: '6px', fontSize: '1.1rem' }}>→</span>
            </Link>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>·</span>
          {sLink.startsWith('http') ? (
            <a
              href={sLink}
              target="_blank"
              rel="noopener noreferrer"
              className="pricing-link"
              data-track-event={pricingLink ? "internship_pricing_click" : "internship_secondary_click"}
              data-track-title={title}
            >
              {sLabel} ↗
            </a>
          ) : (
            <Link
              href={sLink}
              className="pricing-link"
              data-track-event="internship_secondary_click"
              data-track-title={title}
            >
              {sLabel} →
            </Link>
          )}
          
          {tertiaryLink && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>·</span>
              {tertiaryLink.startsWith('http') ? (
                <a
                  href={tertiaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pricing-link"
                  data-track-event="internship_tertiary_click"
                  data-track-title={title}
                >
                  {tertiaryLinkLabel} ↗
                </a>
              ) : (
                <Link
                  href={tertiaryLink}
                  className="pricing-link"
                  data-track-event="internship_tertiary_click"
                  data-track-title={title}
                >
                  {tertiaryLinkLabel} →
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  const cardContent = (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {category && (
        <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
          {category}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {Icon && <Icon size={20} color="var(--accent-primary)" />}
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
          {title}
        </h3>
      </div>
      {badge && (
        <div style={{ display: 'inline-block', background: 'rgba(76, 169, 48, 0.1)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '12px', alignSelf: 'flex-start' }}>
          {badge}
        </div>
      )}
      {desc && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flexGrow: 1, marginBottom: '16px' }}>{desc}</p>}
      
      {tags && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {tags.map((tag, i) => (
            <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
        {ctaLabel ? ctaLabel : (isExternal ? 'Visit Website' : 'Explore Program')}
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

export default function InternshipsClient() {
  const pathname = usePathname();
  const isWorkshop = pathname === "/workshop";

  const typeText = isWorkshop ? "workshop" : "internship";
  const typeTextCapitalized = isWorkshop ? "Workshop" : "Internship";

  const contactUsMsg = encodeURIComponent(`Hi, I would like to know more about the EV/AV ${typeText} opportunities listed on EV.ENGINEER™. Could you please share more details?`);
  const registerNowMsg = encodeURIComponent(`Hi, I am interested in ${typeText}s. Please let me know more details.`);

  // Workshop poster popup
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    if (!isWorkshop) return;
    setShowPoster(true);
    const timer = setTimeout(() => setShowPoster(false), 10000);
    return () => clearTimeout(timer);
  }, [isWorkshop]);

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>

      {/* Workshop Poster Full-Screen Popup */}
      {showPoster && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <img
            src="/sudarshana-karkala_ev-battery-workshop_poster.png"
            alt="EV Battery Workshop Poster"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 100px)',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 8px 64px rgba(0, 0, 0, 0.8)',
            }}
          />
          <button
            onClick={() => setShowPoster(false)}
            className="btn btn-primary"
            style={{
              marginTop: '20px',
              padding: '0.6rem 2rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            data-track-event="workshop_poster_close"
          >
            Close
          </button>
        </div>
      )}
      <section className="section">
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '16px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>AV, EV & Battery</span> {isWorkshop ? "Workshops" : "Internships"}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--accent-primary)", fontWeight: "400", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "48px" }}>
            Building <strong className="glowing-text">World-Class Engineers</strong> to Solve <strong className="glowing-text">Energy</strong> and <strong className="glowing-text">EV Battery</strong> Challenges
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '56px', lineHeight: 1.6 }}>
            Gain hands-on experience in EV Battery Diagnostics, Autonomous System integration, and more.
            Explore ongoing initiatives across Research, Proof of Concepts, and structured Design & Development.
          </p>

          {!isWorkshop && <PrerequisitesSection />}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '64px', justifyContent: 'center' }}>
            <Link
              href="/internships/roadmap"
              className="btn btn-secondary"
              data-track-event="cta_click"
              data-track-label="Roadmap Plan"
            >
              Roadmap Plan
            </Link>

            <Link
              href="/ev-career"
              className="btn btn-primary"
              data-track-event="cta_click"
              data-track-label="Prepare for EV Jobs & Career"
            >
              Prepare for EV Jobs & Career
            </Link>
            <a
              href="https://topmate.io/sudarshana_karkala"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              data-track-event="cta_click"
              data-track-label="Book Discovery Call"
            >
              Book Discovery Call
            </a>
            <button
              onClick={() => setShowPoster(true)}
              className="btn btn-primary"
              data-track-event="cta_click"
              data-track-label="Upcoming Event"
            >
              Upcoming Event
            </button>
            <Link
              href="/workshop-gallery"
              className="btn btn-secondary"
              data-track-event="cta_click"
              data-track-label="Previous Events"
            >
              Previous Events
            </Link>


          </div>

          <Section title="Design & Development">
            <ProjectCard
              title="EV Battery Intelligence Platform"
              desc="Risk analysis and advanced thermal runaway prevention implementations."
              link="/internships/battery-cybersecurity"
              ctaLabel="Cybersecurity"
              secondaryLink="/internships/battery-fire-prevention"
              secondaryLinkLabel="Fire Prevention"
            />
            <ProjectCard
              title="EV Battery Pack Design"
              desc="Comprehensive handbook mapping electrochemistry, structural CTP frames, BMS algorithms, and cloud telemetry."
              link="/internships/battery-pack-design"
              ctaLabel="Explore Handbook"
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
              secondaryLink="/internships/ev-help-agent"
              secondaryLinkLabel="design flow"
              tertiaryLink="/internships/ev-help-agent/usecases"
              tertiaryLinkLabel="Real AI Dialogs"
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
              title="Autonomous Air Taxi (eVTOL)"
              desc="End-to-end design lifecycle for urban air mobility."
              link="/design-development/passenger-taxi"
            />
            <ProjectCard
              title="Autonomous Airport Cargo EV"
              desc="Duty-cycle analysis and integrations for closed-loop environments."
              link="/design-development/airport-cargo"
            />
          </Section>

          <Section title="Space & Aerospace Engineering">
            <ProjectCard
              title="IN-SPACe Model Rocketry"
              desc="End-to-end mission architecture, telemetry systems, avionics, recovery mechanisms, and systems engineering for national-level student rocketry competitions."
              link="https://labs.ev.engineer/Internships/Rocketry/astroforge.html"
              ctaLabel="Student Competition 2026"
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
              title="Selection Process & Fees structure"
              link="/internships/training-internship"
              ctaLabel="Explore Program →"
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
                href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20EV%20Certificates%20and%20Job%20Oriented%20Training%20programs%20on%20EV.ENGINEER%E2%84%A2.%20Could%20you%20please%20provide%20more%20information%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                data-track-event="cta_click"
                data-track-label="EV Certificate"
              >
                EV Certificate
              </a>
              <a
                href={`mailto:info@iTelematics.com?subject=Resume%20Submission%20%E2%80%94%20EV%2FAV%20${typeTextCapitalized}&body=Hi%20Team%2C%0A%0AI%20came%20across%20EV.ENGINEER%E2%84%A2%20and%20would%20like%20to%20apply%20for%20an%20EV%2FAV%20${typeText}%20opportunity.%0A%0APlease%20find%20my%20resume%20attached.%0A%0AThank%20you!`}
                className="btn btn-primary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                data-track-event="internships_submit_resume_click"
              >
                Submit Resume
              </a>
              <a
                href="https://labs.ev.engineer/"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                target="_blank"
                rel="noopener noreferrer"
                data-track-event="cta_click"
                data-track-label="Ongoing vs Completed"
              >
                Ongoing vs Completed
              </a>
              <a
                href="https://carsoftwaresystems.com/#testimonial"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                target="_blank"
                rel="noopener noreferrer"
                data-track-event="cta_click"
                data-track-label="Gallery"
              >
                Gallery
              </a>
              <a
                href={`https://wa.me/919108206147?text=${registerNowMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                data-track-event="internships_register_now_click"
              >
                Register Now
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
