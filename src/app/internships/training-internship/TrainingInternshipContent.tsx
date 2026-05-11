"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Calendar, Award, Target, CheckSquare, Wrench, FileText,
  Briefcase, GraduationCap, Users, Zap
} from "lucide-react";
import { PHASES, MONTH13, DELIVERABLES, OUTCOMES, ROLES, STATS } from "./training-data";

// ─── HERO ─────────────────────────────────────────────────────────────────────

const HeroSection = () => (
  <div style={{
    position: "relative", overflow: "hidden",
    padding: "130px 0 90px", minHeight: "85vh",
    display: "flex", alignItems: "center",
  }}>
    <div style={{
      position: "absolute", inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(to right, rgba(0,245,160,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,245,160,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "48px 48px",
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
    }} />
    <div style={{
      position: "absolute", top: "30%", left: "50%",
      transform: "translate(-50%,-50%)",
      width: "700px", height: "400px",
      background: "radial-gradient(ellipse at center, rgba(76,169,48,0.08) 0%, transparent 70%)",
      zIndex: 0, pointerEvents: "none",
    }} />

    <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 18px", borderRadius: "999px",
          background: "var(--glass-bg)", border: "1px solid var(--accent-glow)",
          marginBottom: "28px",
        }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "var(--btn-green)", boxShadow: "0 0 10px var(--btn-glow)",
          }} />
          <span style={{
            fontSize: "0.82rem", fontWeight: 700,
            color: "var(--btn-green)", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            EV.ENGINEER™ — Structured Pathway
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.1rem, 4.5vw, 3.8rem)", fontWeight: 800,
          lineHeight: 1.1, marginBottom: "24px",
          letterSpacing: "-0.03em",
        }}>
          Training &amp; <span className="glowing-text">Internship</span><br />
          Selection Process &amp; Program Details
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "var(--text-secondary)",
          maxWidth: "680px", margin: "0 auto 20px", lineHeight: 1.7,
        }}>
          A structured 12-month engineering pathway combining 6 months of training and 6 months of
          internship, designed to build industry-ready EV engineers and technical leaders.
        </p>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: "8px",
          justifyContent: "center", margin: "0 auto 48px", maxWidth: "820px",
        }}>
          {["Training", "POC", "Product", "Testing", "Certification"].map((f, i, arr) => (
            <React.Fragment key={i}>
              <span style={{
                fontSize: "0.78rem", fontWeight: 600,
                color: i === arr.length - 1 ? "var(--accent-primary)" : "var(--text-muted)",
                padding: "4px 12px", borderRadius: "999px",
                background: i === arr.length - 1
                  ? "rgba(76,169,48,0.12)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === arr.length - 1 ? "rgba(76,169,48,0.3)" : "rgba(255,255,255,0.07)"}`,
                letterSpacing: "0.03em",
              }}>{f}</span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", alignSelf: "center" }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#phases" className="btn btn-primary" style={{ padding: "0.85rem 2.2rem", fontSize: "1.05rem" }}>
            Explore Phases
          </a>
          <a href="#student-offer" className="btn btn-secondary" style={{ padding: "0.85rem 2.2rem", fontSize: "1.05rem", borderColor: "rgba(56,189,248,0.6)", color: "#38bdf8" }}>
            Student Free Offer
          </a>
        </div>
      </motion.div>
    </div>
  </div>
);

// ─── MINI BADGES ──────────────────────────────────────────────────────────────

const MiniBadges = () => (
  <section style={{ padding: "0 0 80px" }}>
    <div className="container">
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center",
      }}>
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "8px 18px", borderRadius: "999px",
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-primary)" }}>
              {s.value}
            </span>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── ROADMAP NODE ─────────────────────────────────────────────────────────────

const RoadmapNode = ({ phase, index }: { phase: typeof PHASES[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 55%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const glowBox = useTransform(
    scrollYProgress, [0, 1],
    ["0 0 0px transparent", "0 0 22px var(--accent-glow)"]
  );

  const isEven = index % 2 === 0;

  const CardContent = (
    <div className={`roadmap-card glass-panel ${isEven ? "card-left" : "card-right"}`} style={phase.isCore ? { borderColor: "var(--accent-primary)", boxShadow: "0 0 20px rgba(76,169,48,0.15)" } : {}}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: isEven ? "flex-end" : "flex-start",
        gap: "10px", marginBottom: "18px",
      }} className="card-header-row">
        <span style={{
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
          color: "var(--accent-primary)", textTransform: "uppercase",
          background: "rgba(76,169,48,0.1)", padding: "3px 10px",
          borderRadius: "4px", border: "1px solid rgba(76,169,48,0.2)",
        }}>{phase.label}</span>
      </div>

      <h3 style={{
        fontSize: "1.25rem", fontWeight: 700,
        color: "var(--text-primary)", marginBottom: "12px",
        lineHeight: 1.3, letterSpacing: "-0.02em",
        textAlign: isEven ? "right" : "left",
      }} className="card-title">{phase.title}</h3>

      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        justifyContent: isEven ? "flex-end" : "flex-start",
        marginBottom: "14px", flexWrap: "wrap",
      }} className="card-duration-row">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={13} color="var(--text-muted)" />
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {phase.duration}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckSquare size={13} color="var(--text-muted)" />
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {phase.effort}
          </span>
        </div>
      </div>

      <ul style={{
        color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.65,
        marginBottom: "18px", listStyle: "none", padding: 0,
        textAlign: isEven ? "right" : "left",
      }} className="card-desc">
        {phase.items.map((item, i) => (
          <li key={i} style={{ marginBottom: "6px" }}>
            <span style={{ color: "var(--accent-primary)", marginRight: "6px" }}>•</span>{item}
          </li>
        ))}
      </ul>

      {phase.phaseTotal && (
        <div style={{
          display: "flex", flexDirection: "column", gap: "4px",
          padding: "10px 14px", borderRadius: "8px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "20px",
          alignItems: isEven ? "flex-end" : "flex-start",
          textAlign: isEven ? "right" : "left",
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Phase Fees</span>
          <div style={{ display: "flex", gap: "16px", marginBottom: "4px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Online: {phase.phaseTotal.monthlyOnline}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Workspace: {phase.phaseTotal.monthlyWorkspace}</span>
          </div>
          <div style={{ display: "flex", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}><strong style={{ color: "var(--accent-primary)" }}>Total Online:</strong> {phase.phaseTotal.online}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}><strong style={{ color: "var(--accent-primary)" }}>Total Workspace:</strong> {phase.phaseTotal.workspace}</span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "2px" }}>({phase.phaseTotal.note})</span>
        </div>
      )}

      {phase.milestone && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "8px",
          padding: "10px 14px", borderRadius: "8px",
          background: "rgba(76,169,48,0.06)", border: "1px solid rgba(76,169,48,0.15)",
          marginBottom: "10px",
          justifyContent: isEven ? "flex-end" : "flex-start",
        }} className="card-deliverable">
          <Award size={13} color="var(--accent-primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
          <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 600 }}>
            {phase.milestone}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className="roadmap-node-wrap"
    >
      {isEven ? (
        <>
          <div className="roadmap-card-side side-left">{CardContent}</div>
          <motion.div style={{ boxShadow: glowBox }} className="roadmap-axis-dot">
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--accent-primary)", letterSpacing: "0.02em" }}>{phase.num}</span>
          </motion.div>
          <div className="roadmap-balance-side" />
        </>
      ) : (
        <>
          <div className="roadmap-balance-side" />
          <motion.div style={{ boxShadow: glowBox }} className="roadmap-axis-dot">
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--accent-primary)", letterSpacing: "0.02em" }}>{phase.num}</span>
          </motion.div>
          <div className="roadmap-card-side side-right">{CardContent}</div>
        </>
      )}
    </motion.div>
  );
};

// ─── ROADMAP SECTION ──────────────────────────────────────────────────────────

const RoadmapSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 });

  return (
    <section id="phases" className="section" ref={containerRef} style={{ position: "relative" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", marginBottom: "14px", fontWeight: 800 }}>
              Program Structure — <span style={{ color: "var(--accent-primary)" }}>Phase by Phase</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "560px", margin: "0 auto" }}>
              Each phase builds on the previous, ensuring readiness before progression.
            </p>
          </motion.div>
        </div>

        <div style={{ position: "relative", padding: "20px 0 40px" }}>
          <div className="roadmap-bg-line" />
          <motion.div className="roadmap-progress-line" style={{ scaleY }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "72px" }}>
            {PHASES.map((phase, i) => (
              <RoadmapNode key={i} phase={phase} index={i} />
            ))}

            {/* Month 13 Node */}
            <motion.div className="roadmap-node-wrap">
              <div className="roadmap-card-side side-right">
                <div className="roadmap-card glass-panel card-right" style={{ background: "linear-gradient(135deg, rgba(76,169,48,0.12), rgba(6,40,28,0.8))", borderColor: "rgba(76,169,48,0.45)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "10px", marginBottom: "18px" }} className="card-header-row">
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-primary)", background: "rgba(76,169,48,0.4)", padding: "3px 10px", borderRadius: "4px" }}>
                      M13
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.3, textAlign: "left" }} className="card-title">
                    Award, Certification &amp; Placement Support
                  </h3>
                  <ul style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "0", listStyle: "none", padding: 0, textAlign: "left" }} className="card-desc">
                    {MONTH13.map((item, i) => (
                      <li key={i} style={{ marginBottom: "6px" }}>
                        <span style={{ color: "var(--accent-primary)", marginRight: "6px" }}>•</span>
                        {item === "Career guidance" ? <Link href="/ev-career" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>Career guidance</Link> : item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <motion.div className="roadmap-axis-dot">
                <Award size={20} color="var(--accent-primary)" />
              </motion.div>
              <div className="roadmap-balance-side" />
            </motion.div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .roadmap-node-wrap { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 0; position: relative; z-index: 2; }
        .roadmap-card-side { flex: 0 0 calc(50% - 40px); max-width: calc(50% - 40px); display: flex; }
        .side-left { justify-content: flex-end; }
        .side-right { justify-content: flex-start; }
        .roadmap-balance-side { flex: 0 0 calc(50% - 40px); max-width: calc(50% - 40px); }
        .roadmap-axis-dot { width: 52px; height: 52px; border-radius: 50%; background: var(--bg-deep); border: 2px solid var(--accent-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 10; position: absolute; left: 50%; transform: translateX(-50%); }
        .roadmap-bg-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: rgba(255,255,255,0.04); transform: translateX(-50%); z-index: 0; }
        .roadmap-progress-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: linear-gradient(to bottom, var(--success), var(--accent-primary)); transform-origin: top; transform: translateX(-50%); z-index: 1; box-shadow: 0 0 18px var(--accent-glow); }
        @media (max-width: 1024px) { .roadmap-card { max-width: 380px; padding: 22px 24px; } .side-left { padding-right: 24px; } .side-right { padding-left: 24px; } }
        @media (max-width: 768px) {
          .roadmap-node-wrap { flex-direction: row !important; gap: 0 !important; }
          .roadmap-card-side { flex: 1 !important; padding-left: 16px !important; padding-right: 0 !important; justify-content: flex-start !important; order: 2 !important; }
          .roadmap-axis-dot { order: 1 !important; flex-shrink: 0; }
          .roadmap-balance-side { display: none !important; }
          .roadmap-card { max-width: 100% !important; padding: 20px !important; border-left: 3px solid var(--accent-primary) !important; border-right: 1px solid var(--glass-border) !important; }
          .card-header-row { justify-content: flex-start !important; }
          .card-title, .card-desc { text-align: left !important; }
          .card-duration-row { justify-content: flex-start !important; }
          .card-deliverable { justify-content: flex-start !important; }
          .roadmap-bg-line { left: 26px !important; transform: none !important; }
          .roadmap-progress-line { left: 26px !important; transform: none !important; }
        }
      `}} />
    </section>
  );
};

// ─── LIST SECTIONS ────────────────────────────────────────────────────────────

const GridSection = ({ title, items, isRoles }: { title: string, items: string[], isRoles?: boolean }) => (
  <section className="section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px" }}>{title}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: "16px 24px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px",
            transition: "all 0.3s ease"
          }} className="glass-panel hover-glow">
            {isRoles ? <Briefcase size={20} color="var(--accent-primary)" /> : <CheckSquare size={20} color="var(--accent-primary)" />}
            <span style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 500 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .hover-glow:hover { transform: translateY(-2px); border-color: var(--accent-primary); background: rgba(76,169,48,0.05); }
      `}} />
    </div>
  </section>
);

// ─── STUDENT OFFER ────────────────────────────────────────────────────────────

const StudentOffer = () => (
  <section id="student-offer" className="section" style={{ position: "relative", overflow: "hidden", background: "rgba(6,42,28,0.4)" }}>
    <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "800px" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "999px",
        background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", marginBottom: "24px"
      }}>
        <GraduationCap size={16} color="#38bdf8" />
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Limited Offer — For Students
        </span>
      </div>
      
      <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "20px", color: "var(--text-primary)" }}>
        Free Training &amp; Internship<br />
        <span style={{ color: "#38bdf8" }}>For Qualified Students</span>
      </h2>
      
      <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px", lineHeight: 1.6 }}>
        EV.ENGINEER™ believes in nurturing exceptional engineering talent. Qualified students may be
        eligible for a fully sponsored Training &amp; Internship pathway — including coaching,
        mentorship, and placement support — at <strong>no cost</strong>.
      </p>

      <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "12px", padding: "24px", marginBottom: "32px", textAlign: "left" }}>
        <h4 style={{ color: "#38bdf8", fontSize: "1.1rem", marginBottom: "12px" }}>Security Deposit Details</h4>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "12px" }}>
          <span style={{ color: "var(--text-secondary)" }}>Advance (Security Deposit)</span>
          <strong style={{ color: "var(--text-primary)" }}>₹15,000</strong>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
          Refundable after successful completion of Phase 4, subject to program terms. 
          This advance payment and refund concept is <strong>only</strong> for the 'Free Training & Internship For Qualified Students'.
          Once you complete Phase 4, you will get the refund amount back.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {[
          { title: "Eligibility-Based", desc: "Merit-only selection via code test & interview." },
          { title: "Full Coaching", desc: "Complete 6-mo training + 6-mo internship pathway." },
          { title: "Placement Support", desc: "Mock interviews, resume support, career guidance." }
        ].map((feat, i) => (
          <div key={i} style={{ background: "var(--glass-bg)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
            <h4 style={{ color: "var(--text-primary)", fontSize: "1rem", marginBottom: "8px" }}>{feat.title}</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>{feat.desc}</p>
          </div>
        ))}
      </div>

      <a
        href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20a%20student%20interested%20in%20the%20EV.ENGINEER%E2%84%A2%20Free%20Training%20%26%20Internship%20Student%20Offer.%20Please%20share%20eligibility%20details."
        target="_blank" rel="noopener noreferrer"
        className="btn"
        style={{ background: "#38bdf8", color: "#000", fontWeight: 600, padding: "1rem 2.5rem", borderRadius: "999px", boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}
      >
        📲 Contact Us for Student Offer
      </a>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "16px" }}>
        ⚠️ Free coaching is subject to eligibility, seat availability, and final confirmation.
      </p>
    </div>
  </section>
);

// ─── CTA SECTION ──────────────────────────────────────────────────────────────

const CTASection = () => (
  <section id="cta" className="section" style={{ position: "relative", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      width: "800px", height: "400px",
      background: "radial-gradient(ellipse at center, rgba(76,169,48,0.09) 0%, transparent 70%)",
      pointerEvents: "none",
    }} />

    <div className="container" style={{ position: "relative", zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="glass-panel"
        style={{
          padding: "72px 48px", textAlign: "center",
          background: "radial-gradient(circle at center, rgba(6,42,28,0.85) 0%, var(--bg-deep) 100%)",
          border: "1px solid rgba(76,169,48,0.28)",
          boxShadow: "0 0 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(76,169,48,0.06)",
        }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "5px 16px", borderRadius: "999px",
          background: "rgba(76,169,48,0.1)", border: "1px solid rgba(76,169,48,0.25)",
          marginBottom: "24px",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--btn-green)", boxShadow: "0 0 8px var(--btn-glow)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--btn-green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Start Your Journey
          </span>
        </div>

        <h2 style={{
          fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800,
          marginBottom: "18px", letterSpacing: "-0.03em", lineHeight: 1.15,
        }}>
          Start Your <span className="glowing-text">EV Engineering</span> Journey
        </h2>

        <p style={{
          color: "var(--text-secondary)", fontSize: "clamp(0.95rem,1.5vw,1.1rem)",
          maxWidth: "640px", margin: "0 auto 48px", lineHeight: 1.7,
        }}>
          Join a structured training and internship pathway designed to build real-world EV engineering
          skills, product development discipline, and industry readiness.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20the%20EV.ENGINEER%E2%84%A2%20Training%20%26%20Internship%20Program.%20Please%20share%20details."
            target="_blank" rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: "0.9rem 2.2rem", fontSize: "1rem", boxShadow: "0 0 28px var(--accent-glow)" }}
          >
            Apply Now
          </a>
          <a
            href="https://topmate.io/sudarshana_karkala"
            target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: "0.9rem 2.2rem", fontSize: "1rem" }}
          >
            Schedule Discovery Call
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function TrainingInternshipContent() {
  return (
    <div style={{ backgroundColor: "var(--bg-dark)", minHeight: "100vh", overflowX: "hidden" }}>
      <HeroSection />
      <MiniBadges />
      <RoadmapSection />
      <GridSection title="Program Deliverables" items={DELIVERABLES} />
      <GridSection title="Program Outcomes" items={OUTCOMES} />
      <GridSection title="EV Career Roles You Can Pursue" items={ROLES} isRoles />
      <StudentOffer />
      <CTASection />
    </div>
  );
}
