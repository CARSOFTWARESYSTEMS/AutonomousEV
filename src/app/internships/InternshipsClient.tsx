"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PrerequisitesSection from "@/components/PrerequisitesSection";
import { Rocket } from "lucide-react";

function ProjectCard({ title, desc, link, pricingLink, secondaryLink, secondaryLinkLabel, tertiaryLink, tertiaryLinkLabel, quaternaryLink, quaternaryLinkLabel, quinaryLink, quinaryLinkLabel, category, badge, tags, ctaLabel, icon: Icon }: { title: string, desc?: string, link: string, pricingLink?: string, secondaryLink?: string, secondaryLinkLabel?: string, tertiaryLink?: string, tertiaryLinkLabel?: string, quaternaryLink?: string, quaternaryLinkLabel?: string, quinaryLink?: string, quinaryLinkLabel?: string, category?: string, badge?: string, tags?: string[], ctaLabel?: string, icon?: any }) {
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

          {quaternaryLink && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>·</span>
              {quaternaryLink.startsWith('http') ? (
                <a
                  href={quaternaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pricing-link"
                  data-track-event="internship_quaternary_click"
                  data-track-title={title}
                >
                  {quaternaryLinkLabel} ↗
                </a>
              ) : (
                <Link
                  href={quaternaryLink}
                  className="pricing-link"
                  data-track-event="internship_quaternary_click"
                  data-track-title={title}
                >
                  {quaternaryLinkLabel} →
                </Link>
              )}
            </>
          )}

          {quinaryLink && (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>·</span>
              {quinaryLink.startsWith('http') ? (
                <a
                  href={quinaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pricing-link"
                  data-track-event="internship_quinary_click"
                  data-track-title={title}
                >
                  {quinaryLinkLabel} ↗
                </a>
              ) : (
                <Link
                  href={quinaryLink}
                  className="pricing-link"
                  data-track-event="internship_quinary_click"
                  data-track-title={title}
                >
                  {quinaryLinkLabel} →
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

function Section({ title, children, gridClassName }: { title: string, children: ReactNode, gridClassName?: string }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h2>
      <div
        className={gridClassName}
        style={gridClassName ? undefined : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}
      >
        {children}
      </div>
    </div>
  );
}

type AnswerItem = { q: string; a: ReactNode };

const ANSWER_ITEMS: AnswerItem[] = [
  {
    q: "Who can apply?",
    a: (
      <>
        Students with basic programming (Python, Flutter or React Native), circuits, sensors and AI/ML
        fundamentals who want hands-on EV, battery, cybersecurity, autonomous-systems or aerospace project
        experience. A discovery call confirms fit before you start.
      </>
    ),
  },
  {
    q: "What prerequisites are required?",
    a: (
      <>
        Basic EV architecture and lithium-ion battery knowledge, working programming skills, and the ability to
        break down and debug technical problems. See the Prerequisites section above for the full list.
      </>
    ),
  },
  {
    q: "What will I learn?",
    a: (
      <>
        Depending on the track: EV battery systems and BMS (cell → module → pack, SOC/SOH), automotive
        cybersecurity, real-world data acquisition and analysis, AI/ML for battery intelligence, or — on the{" "}
        <Link href="/space/2026-INSPACe-ROCKETRY-059" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
          model rocketry track
        </Link>{" "}
        — aerodynamics, propulsion, recovery, avionics and telemetry.
      </>
    ),
  },
  {
    q: "Is this an internship, paid training, or a workshop?",
    a: (
      <>
        It differs by track. The 12-month{" "}
        <Link href="/internships/training-internship" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
          Training &amp; Internship Program
        </Link>{" "}
        combines 6 months of training with 6 months of internship and publishes phase-wise fees (online or
        workspace); a separate merit-based free track exists for qualified students with a refundable security
        deposit. The{" "}
        <Link href="/space/2026-INSPACe-ROCKETRY-059" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
          model rocketry guide
        </Link>{" "}
        is an independent educational workbook, not an internship or employment offer.
      </>
    ),
  },
  {
    q: "Is a stipend guaranteed?",
    a: (
      <>
        No stipend is published or guaranteed. The standard pathway publishes phase-wise training fees, and the
        merit-based student track requires a refundable security deposit rather than paying a stipend — see the{" "}
        <Link href="/internships/training-internship" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
          Selection Process &amp; Fees
        </Link>{" "}
        page for verified details.
      </>
    ),
  },
  {
    q: "How do I apply?",
    a: (
      <>
        Use the Apply button above to fill the application form, or email your resume via the Submit Resume
        button below. A short discovery call typically follows before a track is confirmed.
      </>
    ),
  },
  {
    q: "How can I contact the programme team?",
    a: (
      <>
        Reach the team through the{" "}
        <Link href="/contact" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
          EV.ENGINEER contact page
        </Link>{" "}
        or WhatsApp above. For programme-lead background, see{" "}
        <Link href="/about/sudarshana-karkala" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>
          Sudarshana Karkala&apos;s profile
        </Link>.
      </>
    ),
  },
];

function InternshipAnswerBlocks() {
  return (
    <div style={{ marginBottom: '64px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Common Questions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {ANSWER_ITEMS.map((item) => (
          <div key={item.q} className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '10px' }}>{item.q}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
          </div>
        ))}
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
            src="/workshops/EV ENGINEER Sudarshana Karkala.png"
            alt="EV Battery Intelligence Platform"
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
          {!isWorkshop && <InternshipAnswerBlocks />}

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


            <Link
              href="/workshop-gallery"
              className="btn btn-secondary"
              data-track-event="cta_click"
              data-track-label="Workshop Gallery"
            >
              Workshop Gallery
            </Link>

            <Link
              href="https://forms.gle/CeBqi41CMrrEd6B5A"
              className="btn btn-primary"
              data-track-event="cta_click"
              data-track-label="Apply"
            >
              Apply
            </Link>

          </div>

          <Section title="Design & Development" gridClassName="grid-2">
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
            <ProjectCard
              title="AegisCAN — CAN & BMS Cybersecurity"
              desc="Learn Battery, BMS, BESS, CAN, validation and embedded cybersecurity through a hands-on engineering prototype."
              link="/internships/AegisCAN"
              badge="12-Week E&C / EEE Mini Project"
              ctaLabel="Explore AegisCAN"
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
              title="EV Auto Rickshaw"
              desc="D+6 electric three-wheeler configurator, engineering simulator and business-plan platform for Tier-2/Tier-3 South India."
              link="/internships/evAutoRickshaw"
              badge="EV Engineering R&D Simulator"
              ctaLabel="Configure the EV"
            />
            <ProjectCard
              title="Autonomous Air Taxi (eVTOL)"
              desc="End-to-end design lifecycle for urban air mobility."
              link="/design-development/passenger-taxi"
              secondaryLink="/design-development/passenger-taxi/battery-cybersecurity"
              secondaryLinkLabel="Cybersecurity"
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
              secondaryLink="/space/2026-INSPACe-ROCKETRY-059"
              secondaryLinkLabel="Workshop Topics & Workbook"
              tertiaryLink="https://www.inspace.gov.in/inspace?id=workshop_on_essentials_of_model_rocketry"
              tertiaryLinkLabel="IN-SPACe Workshop Listing"
              quaternaryLink="/workbook/inspace-model-rocketry-workshop-brochure.pdf"
              quaternaryLinkLabel="Workshop Brochure (PDF)"
              quinaryLink="/workbook/model-rocketry-7-day-learning-workbook-2026.pdf"
              quinaryLinkLabel="7-Day Learning Workbook (PDF)"
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
