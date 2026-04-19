import Link from "next/link";
import { ReactNode } from "react";
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
function ProjectCard({ title, desc, link }: { title: string, desc?: string, link: string }) {
  const isExternal = link.startsWith('http');
  const cardContent = (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
        {title}
        {isExternal && <span style={{ marginLeft: '6px', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>↗</span>}
      </h3>
      {desc && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{desc}</p>}
    </div>
  );

  return isExternal ? (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      {cardContent}
    </a>
  ) : (
    <Link href={link} style={{ textDecoration: 'none' }}>
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
            AV, EV & Battery <span style={{ color: 'var(--accent-primary)' }}>Internships</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', marginBottom: '56px', lineHeight: 1.6 }}>
            Gain hands-on experience in EV Battery Diagnostics, Autonomous System integration, and more.
            Explore ongoing initiatives across Research, Proof of Concepts, and structured Design & Development.
          </p>

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
          
          <Section title="Design & Development">
            <ProjectCard 
              title="AI-Powered EV Battery Fire Prevention System" 
              desc="Risk analysis and advanced thermal runaway prevention implementations." 
              link="/internships/battery-fire-prevention" 
            />
            <ProjectCard 
              title="Battery Pack Aadhaar System" 
              desc="Unified identity protocols for battery life tracking and health." 
              link="/internships/battery-aadhaar" 
            />
          </Section>

          <Section title="EV Repair Workshop">
            <ProjectCard 
              title="EV Repair Workshop" 
              desc="Specialized focus on EV diagnostics, repair mechanisms, and maintenance workflows." 
              link="https://repair.ev.engineer/" 
            />
          </Section>

          <Section title="Miscellaneous">
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
              link="https://itelematics.com/ev-engineer" 
            />
            <ProjectCard 
              title="Projects @ Thasmai Infotech" 
              link="https://www.thasmaiinfotech.com/#programs" 
            />
            <ProjectCard 
              title="Webinars @ EV Society™" 
              link="https://www.evsociety.org/projects" 
            />
            <ProjectCard 
              title="Ongoing vs Completed" 
              link="https://labs.ev.engineer/" 
            />
          </Section>

          <div style={{ marginTop: '80px', textAlign: 'center', paddingBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '24px' }}>Ready to Take the Next Step?</h2>
            <a href="https://itelematics.com/contact" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}>
              Contact Us
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
