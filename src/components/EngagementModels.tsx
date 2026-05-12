import Link from "next/link";
import React from "react";

export default function EngagementModels() {
  return (
    <div style={{ marginTop: "64px", marginBottom: "64px", borderTop: "1px solid var(--color-glass-border)", paddingTop: "64px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .highlight-card {
          border: 2px solid var(--accent-primary) !important;
          box-shadow: 0 0 30px var(--accent-glow) !important;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) {
          .highlight-card {
            transform: scale(1.03);
          }
          .highlight-card:hover {
            transform: scale(1.05) translateY(-2px) !important;
          }
        }
        .engagement-card {
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .engagement-card:hover {
          box-shadow: 0 10px 40px rgba(76, 169, 48, 0.15);
        }
        .highlight-strip {
          margin-bottom: 64px;
          text-align: center;
          background: rgba(76, 169, 48, 0.05);
          border: 1px solid var(--accent-glow);
          box-shadow: 0 0 20px rgba(76, 169, 48, 0.1);
        }
        .highlight-strip:hover {
          box-shadow: 0 0 30px rgba(76, 169, 48, 0.2);
        }
      `}} />

      {/* Title & Subtitle */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
          EV.ENGINEER™ Engagement Models
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '900px', margin: '0 auto', lineHeight: 1.6 }}>
          Flexible engagement models designed for EV workshops, workforce development, corporate engineering training, technical leadership, startup engineering buildout, and long-term EV ecosystem growth.
        </p>
      </div>

      {/* Highlight Strip */}
      <div className="glass-panel highlight-strip">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '16px' }}>
          Mentored and trained 2000+ engineers and professionals since 2012 across:
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {['iOS & Mobile Applications', 'IoT & Smart Home Systems', 'Cybersecurity', 'Energy Systems', 'Electric Vehicles', 'Automotive Software Development', 'Telematics', 'GenAI & Agentic AI', 'EV Battery Systems', 'Engineering Leadership'].map(skill => (
            <span key={skill} style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-primary)', 
              background: 'rgba(255,255,255,0.05)', 
              padding: '6px 14px', 
              borderRadius: '999px', 
              border: '1px solid rgba(255,255,255,0.1)' 
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Top Center Card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div className="glass-panel engagement-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Community
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Seminar / Webinar</h3>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
            1 Hour
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Online engineering awareness sessions focused on EV systems, battery technologies, diagnostics, software engineering, telematics, energy systems, and workforce development.
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(76, 169, 48, 0.1)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '24px' }}>
            Free
          </div>
          <div>
            <Link href="/workshop-gallery" className="btn btn-secondary" style={{ width: '100%' }}>
              Join Webinar →
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Primary Engagement Cards */}
      <div className="grid-3" style={{ alignItems: 'stretch' }}>
        
        {/* Card 1 - Left */}
        <div className="glass-panel engagement-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Foundation
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>EV Workshop</h3>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
            3–8 Hours
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', flexGrow: 1 }}>
            Short-duration engineering workshops focused on EV systems, battery technologies, diagnostics, embedded systems, software engineering, and connected mobility fundamentals.
          </p>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Suitable For:</div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8, paddingLeft: '16px', listStyleType: 'disc' }}>
              <li>Colleges</li>
              <li>Universities</li>
              <li>Technical Communities</li>
              <li>Student Chapters</li>
              <li>EV Awareness Programs</li>
            </ul>
          </div>
          <Link href="/workshop" className="btn btn-secondary" style={{ width: '100%' }}>
            Explore Workshops →
          </Link>
        </div>

        {/* Card 2 - Center (Highlighted) */}
        <div className="glass-panel engagement-card highlight-card">
          <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: '#fff', padding: '4px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(76, 169, 48, 0.4)' }}>
            Most Preferred
          </div>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', marginTop: '8px' }}>
            Professional
          </div>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Corporate Training</h3>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>
            1–3 Months
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px', flexGrow: 1 }}>
            Structured corporate engineering training programs designed for EV workforce development, diagnostics systems, battery engineering, telematics, software engineering, testing workflows, and technical leadership readiness.
          </p>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '24px', padding: '12px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
            Hire EV experts from EV.ENGINEER™
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Suitable For:</div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8, paddingLeft: '16px', listStyleType: 'disc' }}>
              <li>EV Startups</li>
              <li>OEM Engineering Teams</li>
              <li>Corporate Innovation Groups</li>
              <li>Workforce Upskilling Programs</li>
              <li>Technical Leadership Development</li>
            </ul>
          </div>
          <Link href="/corporate-training" className="btn btn-primary" style={{ width: '100%' }}>
            Explore Corporate Training →
          </Link>
        </div>

        {/* Card 3 - Right */}
        <div className="glass-panel engagement-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Strategic
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Startup Engineering Buildout</h3>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
            1–3 Years
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px', flexGrow: 1 }}>
            Long-term engineering collaboration model focused on building EV engineering culture, technical leadership, architecture direction, engineering teams, diagnostics systems, and startup execution capability.
          </p>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', padding: '12px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
            Hire me as:<br/>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}>Co-Founder | Director | Technical Advisor</span><br/>
            <a href="https://autonomous.ev.engineer/about/sudarshana-karkala" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', marginTop: '6px', display: 'inline-block' }}>About Sudarshana Karkala</a>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>Suitable For:</div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8, paddingLeft: '16px', listStyleType: 'disc' }}>
              <li>EV Startups</li>
              <li>Product Companies</li>
              <li>Deep-Tech Ventures</li>
              <li>Mobility Innovation Teams</li>
              <li>Engineering-Driven Founders</li>
            </ul>
          </div>
          <Link href="/consulting" className="btn btn-secondary" style={{ width: '100%' }}>
            Explore Strategic Consulting →
          </Link>
        </div>

      </div>

      {/* Final CTA Section */}
      <div style={{ marginTop: '80px', textAlign: 'center', paddingBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Looking to Build EV Engineering Capabilities?
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Collaborate with EV.ENGINEER™ for engineering workshops, workforce development, technical leadership, corporate training, startup consulting, diagnostics systems, and long-term EV ecosystem growth.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://itelematics.com/contact" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Contact for Collaboration →
          </a>
          <a href="https://topmate.io/sudarshana_karkala" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Schedule Discovery Call →
          </a>
        </div>
      </div>

    </div>
  );
}
