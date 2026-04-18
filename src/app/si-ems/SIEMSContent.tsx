"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import "./si-ems.css";
import { syllabusData } from "./syllabus-data";
import SyllabusSection from "@/components/SyllabusSection";

export default function SIEMSContent() {
  const [activePart, setActivePart] = useState(syllabusData[0].id);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="si-ems-page container" style={{ paddingTop: "120px", paddingBottom: isMobile ? "100px" : "80px", position: "relative" }}>
      {/* Background Accent */}
      <div style={{ position: "fixed", top: "0", left: "50%", transform: "translateX(-50%)", width: "100%", height: "600px", background: "radial-gradient(circle at 50% 0%, rgba(76, 169, 48, 0.12), transparent 70%)", pointerEvents: "none", zIndex: -1 }}></div>

      {/* Mobile Drawer Toggle */}
      {isMobile && (
        <button 
          onClick={() => setIsDrawerOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1000,
            cursor: "pointer",
            fontSize: "1.2rem"
          }}
        >
          ☰
        </button>
      )}

      {/* Mobile Navigation Drawer */}
      {isDrawerOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1001 }}>
          <div 
            onClick={() => setIsDrawerOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          />
          <div style={{ 
            position: "absolute", 
            top: 0, 
            right: 0, 
            bottom: 0, 
            width: "80%", 
            background: "var(--background-dark)", 
            padding: "32px",
            borderLeft: "1px solid var(--glass-border)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "var(--accent-primary)", margin: 0 }}>Syllabus Chapters</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: "none",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {syllabusData.map(part => (
                <div key={part.id} style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: "700", marginBottom: "8px" }}>{part.part}</p>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {part.chapters.map(ch => (
                      <li key={ch.id} style={{ marginBottom: "12px" }}>
                        <a 
                          href={`#${ch.id}`} 
                          onClick={() => setIsDrawerOpen(false)}
                          style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}
                        >
                          {ch.number} — {ch.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", marginBottom: "24px" }}>
                <a 
                  href="#detailed-index" 
                  onClick={() => setIsDrawerOpen(false)}
                  style={{ color: "var(--accent-primary)", textDecoration: "none", fontSize: "1rem", fontWeight: "700" }}
                >
                  Detailed Index
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "64px", alignItems: "flex-start" }}>
        
        {/* Fixed Sidebar (Desktop) */}
        {!isMobile && (
          <div style={{ width: "280px", flexShrink: 0 }}>
            <aside style={{ position: "fixed", top: "120px", width: "280px" }} className="sidebar-desktop">
            <div className="glass-panel" style={{ padding: "20px" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Research Roadmap</p>
              <nav style={{ paddingRight: "10px" }}>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0", listStyle: "none", padding: 0 }}>
                  {syllabusData.map(p => (
                    <li key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <a
                        href={`#${p.id}`}
                        className="toc-link"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          padding: "6px 8px",
                          gap: "2px",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--accent-primary)", letterSpacing: "1px", textTransform: "uppercase" }}>
                          {p.part}
                        </span>
                        <span
                          className="toc-title"
                          style={{
                            fontSize: "0.8rem",
                            color: activePart === p.id ? "var(--accent-primary)" : "var(--text-secondary)",
                            lineHeight: "1.3",
                          }}
                        >
                          {p.title}
                        </span>
                      </a>
                    </li>
                  ))}
                  <li style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "12px", paddingTop: "12px" }}>
                    <a href="#detailed-index" className="toc-link" style={{ display: "block", padding: "8px", textDecoration: "none" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--accent-primary)", letterSpacing: "1px", textTransform: "uppercase" }}>Index</span>
                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>Detailed Chapter Links</span>
                    </a>
                  </li>
                </ul>
              </nav>
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--glass-border)" }}>
                 <Link href="/contact" className="btn btn-primary" style={{ width: "100%", fontSize: "0.9rem", textAlign: "center", display: "block" }}>Collaborate</Link>
              </div>
            </div>
            </aside>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <header style={{ marginBottom: "64px" }}>
            <div className="pill" style={{ marginBottom: "16px", color: "var(--accent-primary)" }}>ishavasyam.org™</div>
            <h1 style={{ fontSize: isMobile ? "2.2rem" : "3.5rem", marginBottom: "20px", lineHeight: "1.1" }}>
              AI-Driven Super-Intelligent Energy Management Systems for Autonomous EVs
            </h1>
            <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "800px" }}>
              Architectural Design & Proof-of-Concept  for Level-4 Robotaxi Platforms.
            </p>
          </header>

          <section className="glass-panel" style={{ marginBottom: "64px", borderLeft: "4px solid var(--accent-primary)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                <div>
                   <p style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Lead Architect & Author</p>
                   <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Sudarshana Karkala</h2>
                   <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "12px" }}>Principal Architect | iTelematics Software Private Limited</p>
                   <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "8px" }}>
                     Available for strategic architectural consulting and advanced automotive R&D partnerships.
                   </p>
                   <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", flexWrap: "wrap" }}>
                     <a href="tel:+919845561518" style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                       <span>📞</span> +91 9845561518
                     </a>
                     <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
                     <a href="https://www.linkedin.com/in/sudarshanakarkala/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                       <span>🔗</span> LinkedIn Profile
                     </a>
                   </div>
                </div>
                {!isMobile && (
                  <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--accent-primary)" }}>36</div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Core Chapters</p>
                  </div>
                )}
             </div>
          </section>

          {/* Research Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "100px" }}>
            {syllabusData.map((part) => (
              <section key={part.id} id={part.id} className="fade-in">
                <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "16px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--accent-primary)", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                    {part.part}
                  </span>
                  <h2 style={{ fontSize: isMobile ? "1.5rem" : "2.2rem", marginBottom: "0", lineHeight: "1.2" }}>{part.title}</h2>
                </div>
                
                {part.chapters.map(chapter => (
                  <div key={chapter.id} id={chapter.id} style={{ marginBottom: "64px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--accent-primary)", background: "rgba(76,169,48,0.1)", padding: "4px 12px", borderRadius: "4px" }}>
                        CH {chapter.number}
                      </span>
                      <h3 style={{ fontSize: isMobile ? "1.3rem" : "1.8rem", margin: 0 }}>{chapter.title}</h3>
                    </div>
                    {chapter.sections.map((section, idx) => (
                      <SyllabusSection key={idx} section={section} isMobile={isMobile} />
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>

          <section id="detailed-index" className="glass-panel" style={{ marginTop: "100px", marginBottom: "100px" }}>
            <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "16px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--accent-primary)", letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Index</span>
              <h2 style={{ fontSize: isMobile ? "1.5rem" : "2.2rem", marginBottom: "0", lineHeight: "1.2" }}>Detailed Chapters</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "32px" }}>
              {syllabusData.map((part) => (
                <div key={`index-${part.id}`}>
                  <h3 style={{ fontSize: "1rem", color: "var(--accent-primary)", marginBottom: "12px", lineHeight: "1.3" }}>
                    {part.part}: {part.title}
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {part.chapters.map(chapter => (
                      <li key={`index-${chapter.id}`} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ color: "var(--glass-border)", fontSize: "0.8rem", marginTop: "2px" }}>▶</span>
                        <a href={`#${chapter.id}`} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", lineHeight: "1.4" }} className="hover-text-primary">
                          {chapter.number} — {chapter.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section style={{ textAlign: "center", marginTop: "120px", padding: "80px 0", borderTop: "1px solid var(--glass-border)" }}>
            <h2 style={{ fontSize: "2.8rem", marginBottom: "24px" }}>Partner with us</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px", maxWidth: "700px", margin: "0 auto", fontSize: "1.2rem" }}>
              We are looking for research collaborators, OEMs, and post-doctoral candidates to participate in the Tier-2 HIL and Tier-3 validation phases.
            </p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "48px", maxWidth: "700px", margin: "0 auto 48px", fontSize: "1.2rem", fontWeight: "300" }}>
              For direct research inquiries, please contact: <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>+91 9845561518</span>
            </p>
            <div className="flex-responsive" style={{ gap: "20px", justifyContent: "center" }}>
              <Link href="/contact" className="btn btn-primary" style={{ padding: "1.2rem 2.5rem" }}>Connect Us</Link>
              <Link href="/consulting" className="btn btn-secondary" style={{ padding: "1.2rem 2.5rem" }}>R&D Consulting</Link>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
