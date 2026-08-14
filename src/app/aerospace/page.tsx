"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Manrope, Inter } from "next/font/google";
import {
  Shield, Plane, Satellite, Cloud, Bug, Brain, Lock,
  Network, Terminal, Database, ChevronRight, Menu, X,
  MessageSquare, ArrowRight, Star,
  Cpu, Radio, Wifi, Code, BookOpen, FlaskConical, Rocket,
  ChevronDown, ChevronUp, Mail, ExternalLink, Layers, Globe
} from "lucide-react";
import styles from "./aerospace.module.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-uflight-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-uflight-inter",
});

const FONT_MANROPE = "var(--font-uflight-manrope)";
const FONT_INTER = "var(--font-uflight-inter)";

// Social icon shims
const Github = ({ size = 24, color }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "currentColor"}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const Youtube = ({ size = 24, color }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "currentColor"}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const Linkedin = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const navLinks = [
  "Home", "Learning Paths", "Research", "Labs", "Projects", "Resources"
];

const learningPathCards = [
  { icon: <Plane size={20} />, title: "Aircraft Cybersecurity", count: "8 Modules", color: "#7C3AED" },
  { icon: <Radio size={20} />, title: "Drone Security", count: "6 Modules", color: "#3B82F6" },
  { icon: <Shield size={20} />, title: "Aviation Security", count: "7 Modules", color: "#06B6D4" },
  { icon: <Rocket size={20} />, title: "Air Taxi Security", count: "5 Modules", color: "#8B5CF6" },
  { icon: <Satellite size={20} />, title: "Satellite Security", count: "5 Modules", color: "#3B82F6" },
  { icon: <Cpu size={20} />, title: "Embedded Security", count: "9 Modules", color: "#06B6D4" },
  { icon: <Cloud size={20} />, title: "Cloud Security", count: "6 Modules", color: "#7C3AED" },
  { icon: <Brain size={20} />, title: "AI for Aerospace", count: "7 Modules", color: "#10B981" },
];

const stats = [
  { value: "150+", label: "Tutorials" },
  { value: "20+", label: "Learning Paths" },
  { value: "100+", label: "Hands-on Labs" },
  { value: "50+", label: "Research Topics" },
];

const topics = [
  "Aircraft Security", "Drone Security", "eVTOL Security", "Airport Security", "Satellite Security",
  "Embedded Systems", "Cloud Security", "Secure OTA", "CAN Bus", "ARINC 429", "AFDX",
  "MIL-STD-1553", "RTOS", "Embedded Linux", "Cryptography", "Secure Boot", "Firmware Security",
  "Threat Modeling", "Digital Twin", "DevSecOps", "AWS", "Azure", "Python", "Rust", "C++",
  "Reverse Engineering", "AI Security", "LLMs", "Machine Learning", "Computer Vision",
  "Threat Detection", "Quantum Cryptography", "DO-178C", "DO-326A", "DO-356A", "NIST", "FAA",
  "DGCA", "MITRE ATT&CK", "OWASP",
];

const fullPaths = [
  { icon: <Plane size={22} />, title: "Aircraft Cybersecurity", lessons: 25, color: "#7C3AED", desc: "Avionics protocols, threat modeling, secure communication" },
  { icon: <Radio size={22} />, title: "Drone Security", lessons: 18, color: "#3B82F6", desc: "UAV penetration testing, firmware analysis, RF attacks" },
  { icon: <Globe size={22} />, title: "Airport OT Security", lessons: 16, color: "#06B6D4", desc: "Operational technology, ICS/SCADA, zero-trust architecture" },
  { icon: <Satellite size={22} />, title: "Satellite Security", lessons: 15, color: "#8B5CF6", desc: "GNSS spoofing, uplink protection, satellite threat models" },
  { icon: <Brain size={22} />, title: "AI for Aviation", lessons: 20, color: "#10B981", desc: "AI-powered threat detection, anomaly analysis, LLMs in aerospace" },
  { icon: <Cpu size={22} />, title: "Battery Cybersecurity", lessons: 14, color: "#F59E0B", desc: "BMS attacks, secure firmware, lithium cell safety protocols" },
  { icon: <Cloud size={22} />, title: "Cloud Security", lessons: 18, color: "#3B82F6", desc: "AWS/Azure for aviation, cloud-native security architecture" },
  { icon: <Lock size={22} />, title: "Secure Embedded Systems", lessons: 22, color: "#7C3AED", desc: "RTOS hardening, secure boot, cryptographic implementations" },
];

const labs = [
  { icon: <Network size={18} />, title: "Aircraft CAN Bus Analysis", level: "Intermediate", color: "#7C3AED" },
  { icon: <Radio size={18} />, title: "ARINC Protocol Lab", level: "Advanced", color: "#3B82F6" },
  { icon: <Bug size={18} />, title: "Drone Penetration Testing", level: "Advanced", color: "#EF4444" },
  { icon: <Cpu size={18} />, title: "Firmware Reverse Engineering", level: "Expert", color: "#F59E0B" },
  { icon: <Shield size={18} />, title: "Secure OTA Updates", level: "Intermediate", color: "#10B981" },
  { icon: <Terminal size={18} />, title: "Threat Modeling Workshop", level: "Beginner", color: "#06B6D4" },
  { icon: <Wifi size={18} />, title: "Flight Network Monitoring", level: "Intermediate", color: "#8B5CF6" },
  { icon: <Satellite size={18} />, title: "ADS-B Security", level: "Intermediate", color: "#3B82F6" },
  { icon: <Globe size={18} />, title: "GNSS Spoofing Detection", level: "Advanced", color: "#06B6D4" },
  { icon: <Database size={18} />, title: "SOC Simulation", level: "Advanced", color: "#7C3AED" },
  { icon: <Cpu size={18} />, title: "Battery Cybersecurity Lab", level: "Intermediate", color: "#F59E0B" },
  { icon: <Cloud size={18} />, title: "Cloud Security Lab", level: "Beginner", color: "#10B981" },
];

const projects = [
  { icon: <Shield size={20} />, title: "Aircraft IDS", desc: "Intrusion detection system for avionics networks", stars: 240, color: "#7C3AED" },
  { icon: <Radio size={20} />, title: "Drone IDS", desc: "Real-time anomaly detection for UAV systems", stars: 182, color: "#3B82F6" },
  { icon: <Lock size={20} />, title: "Secure OTA Framework", desc: "Cryptographically verified firmware update pipeline", stars: 315, color: "#06B6D4" },
  { icon: <Cpu size={20} />, title: "Battery Security Toolkit", desc: "BMS vulnerability scanner and hardening tools", stars: 98, color: "#F59E0B" },
  { icon: <Network size={20} />, title: "Threat Intelligence Platform", desc: "Aviation-specific CTI aggregation and analysis", stars: 157, color: "#8B5CF6" },
  { icon: <Terminal size={20} />, title: "Flight Log Analyzer", desc: "Forensic analysis tool for avionics black boxes", stars: 204, color: "#10B981" },
  { icon: <Brain size={20} />, title: "AI Flight Assistant", desc: "LLM-powered security advisory for flight ops", stars: 289, color: "#3B82F6" },
  { icon: <Layers size={20} />, title: "Digital Twin Platform", desc: "Cyber range simulation for aerospace systems", stars: 441, color: "#7C3AED" },
];

const research = [
  { title: "AI Powered Aviation Security", tag: "Active", color: "#7C3AED" },
  { title: "Quantum Safe Aviation", tag: "Research", color: "#3B82F6" },
  { title: "Aircraft Digital Twin", tag: "Active", color: "#06B6D4" },
  { title: "Drone Swarm Defense", tag: "Proposal", color: "#8B5CF6" },
  { title: "Autonomous Flight Security", tag: "Active", color: "#10B981" },
  { title: "Airport Zero Trust", tag: "Research", color: "#F59E0B" },
  { title: "Satellite Threat Detection", tag: "Active", color: "#3B82F6" },
  { title: "Secure Avionics", tag: "Ongoing", color: "#7C3AED" },
];

const roadmap = [
  { level: "Level 1", title: "Foundations", topics: ["Networking", "Linux", "Python", "Cybersecurity Basics"], color: "#3B82F6" },
  { level: "Level 2", title: "Core Engineering", topics: ["Embedded Systems", "Drone Technology", "Cloud", "Secure Coding"], color: "#7C3AED" },
  { level: "Level 3", title: "Specialization", topics: ["Aircraft Systems", "DO-178C", "DO-326A", "Threat Modeling"], color: "#8B5CF6" },
  { level: "Level 4", title: "Expert Track", topics: ["Security Architect", "Research Engineer", "Chief Security Engineer"], color: "#06B6D4" },
];

const community = [
  { icon: <Youtube size={24} />, name: "YouTube", handle: "@AerospaceCyber", color: "#FF0000", bg: "rgba(255,0,0,0.08)" },
  { icon: <Github size={24} />, name: "GitHub", handle: "aerospace", color: "#ffffff", bg: "rgba(255,255,255,0.06)" },
  { icon: <Linkedin size={24} />, name: "LinkedIn", handle: "Aerospace", color: "#0A66C2", bg: "rgba(10,102,194,0.1)" },
  { icon: <MessageSquare size={24} />, name: "Discord", handle: "Aerospace Community", color: "#5865F2", bg: "rgba(88,101,242,0.1)" },
  { icon: <Code size={24} />, name: "ResearchGate", handle: "Aerospace Research", color: "#00D2D3", bg: "rgba(0,210,211,0.08)" },
  { icon: <BookOpen size={24} />, name: "Medium", handle: "@AerospaceCyber", color: "#ffffff", bg: "rgba(255,255,255,0.05)" },
  { icon: <Globe size={24} />, name: "X / Twitter", handle: "@AerospaceCyber", color: "#ffffff", bg: "rgba(255,255,255,0.05)" },
  { icon: <Mail size={24} />, name: "Newsletter", handle: "Weekly Digest", color: "#06B6D4", bg: "rgba(6,182,212,0.08)" },
];

const testimonials = [
  { name: "Arjun Mehta", role: "Avionics Engineer, ISRO", text: "Aerospace completely changed how I approach aircraft security. The labs are incredibly realistic and the research depth is unmatched.", avatar: "AM" },
  { name: "Sarah Mitchell", role: "Drone Security Researcher", text: "Finally, a platform that treats aerospace cybersecurity seriously. The community and open source projects are world-class.", avatar: "SM" },
  { name: "Ravi Kumar", role: "Defense Cybersecurity Lead", text: "We onboard our aerospace security team with Aerospace paths. The DO-178C and threat modeling content is industry standard.", avatar: "RK" },
];

const faqs = [
  { q: "Who is Aerospace for?", a: "Aerospace is built for aerospace engineers, aviation professionals, cybersecurity engineers, embedded developers, drone builders, eVTOL engineers, AI researchers, students, defense organizations, and airport operators." },
  { q: "Is the content free?", a: "Core tutorials, research papers, and open-source projects are freely accessible. Premium membership unlocks hands-on labs, certification paths, and community features." },
  { q: "What makes Aerospace different from general cybersecurity platforms?", a: "Aerospace is 100% focused on aerospace systems — from avionics protocols like ARINC 429 and CAN Bus to drone RF security and satellite threat modeling. No generic content." },
  { q: "Do I need an aerospace background to start?", a: "No. Level 1 begins with networking and Linux fundamentals. The roadmap progresses from foundational cybersecurity to aerospace-specific specialization at Level 3." },
  { q: "Can organizations get access for teams?", a: "Yes. We offer enterprise licenses for defense organizations, aerospace companies, and academic institutions. Reach out via email or LinkedIn." },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: "#10B981", Intermediate: "#3B82F6", Advanced: "#F59E0B", Expert: "#EF4444"
  };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 999,
      background: `${colors[level] || "#3B82F6"}22`,
      color: colors[level] || "#3B82F6",
      border: `1px solid ${colors[level] || "#3B82F6"}44`,
      letterSpacing: "0.05em", textTransform: "uppercase"
    }}>{level}</span>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? "rgba(124,58,237,0.08)" : "rgba(17,21,46,0.6)",
        border: `1px solid ${open ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, padding: "16px 20px", cursor: "pointer", transition: "all 0.2s"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>{q}</span>
        {open ? <ChevronUp size={18} color="#7C3AED" /> : <ChevronDown size={18} color="#B5B8C9" />}
      </div>
      {open && (
        <p style={{ marginTop: 12, marginBottom: 0, color: "#B5B8C9", fontSize: 14, lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: FONT_MANROPE,
  fontSize: "clamp(24px, 3.2vw, 32px)",
  fontWeight: 800, letterSpacing: "-0.02em",
  color: "#fff", margin: "0 0 16px", lineHeight: 1.15
};

const sectionDesc: React.CSSProperties = {
  color: "#B5B8C9", fontSize: 16, lineHeight: 1.7,
  maxWidth: 560, margin: "0 auto", textAlign: "center"
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 999, padding: "6px 16px", marginBottom: 16 }}>
      <span style={{ color: "#B39DDB", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</span>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 16, fontFamily: FONT_MANROPE }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(l => (
          <a key={l} href="#" style={{ color: "#B5B8C9", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.target as HTMLElement).style.color = "#B5B8C9"}
          >{l}</a>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AerospacePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`${styles.root} ${manrope.variable} ${inter.variable}`} style={{ background: "#090B1D", minHeight: "100vh", fontFamily: FONT_INTER, overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,11,29,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #7C3AED, #3B82F6)"
          }}>
            <Plane size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: FONT_MANROPE, fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: "#fff" }}>
            Aerospace
          </span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}
          className={styles.hiddenMobile}>
          {navLinks.map(link => (
            <a key={link} href="#" style={{
              padding: "6px 12px", borderRadius: 8, color: "#B5B8C9", fontSize: 13, fontWeight: 500,
              textDecoration: "none", transition: "color 0.2s, background 0.2s", display: "block"
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#fff"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "#B5B8C9"; (e.target as HTMLElement).style.background = "transparent"; }}
            >{link}</a>
          ))}
          <a href="https://www.uflight.in/" target="_blank" rel="noopener noreferrer" style={{
            padding: "6px 14px", borderRadius: 8, fontWeight: 600, fontSize: 13,
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
            border: "1px solid rgba(124,58,237,0.4)", color: "#B39DDB",
            textDecoration: "none", display: "block"
          }}>UFlight</a>
          <Link href="/" style={{
            padding: "6px 14px", borderRadius: 8, fontWeight: 600, fontSize: 13,
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
            border: "1px solid rgba(124,58,237,0.4)", color: "#B39DDB",
            textDecoration: "none", display: "block", marginLeft: 8
          }}>EV.ENGINEER</Link>
          <a href="https://www.evsociety.org" target="_blank" rel="noopener noreferrer" style={{
            padding: "6px 14px", borderRadius: 8, fontWeight: 600, fontSize: 13,
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
            border: "1px solid rgba(124,58,237,0.4)", color: "#B39DDB",
            textDecoration: "none", display: "block", marginLeft: 8
          }}>EV Society</a>
        </div>

        {/* Right: auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link href="/contact" style={{
            padding: "7px 16px", borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            border: "none", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0,
            textDecoration: "none", display: "block"
          }}>Express Interest</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
            className={styles.showMobile}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 99,
          background: "rgba(9,11,29,0.98)", borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8
        }}>
          {navLinks.map(link => (
            <Fragment key={link}>
              <a href="#" onClick={() => setMobileOpen(false)} style={{
                padding: "10px 0", color: "#B5B8C9", fontSize: 15, textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.05)"
              }}>{link}</a>
              {link === "Resources" && (
                <>
                  <a href="https://www.uflight.in/" target="_blank" rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)} style={{
                      marginTop: 4, padding: "10px 16px", borderRadius: 10, fontWeight: 600,
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                      border: "1px solid rgba(124,58,237,0.4)", color: "#B39DDB", fontSize: 15,
                      textDecoration: "none", textAlign: "center"
                    }}>
                    UFlight
                  </a>
                  <Link href="/" onClick={() => setMobileOpen(false)} style={{
                    marginTop: 4, padding: "10px 16px", borderRadius: 10, fontWeight: 600,
                    background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                    border: "1px solid rgba(124,58,237,0.4)", color: "#B39DDB", fontSize: 15,
                    textDecoration: "none", textAlign: "center"
                  }}>
                    EV.ENGINEER
                  </Link>
                  <a href="https://www.evsociety.org" target="_blank" rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)} style={{
                      marginTop: 4, padding: "10px 16px", borderRadius: 10, fontWeight: 600,
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                      border: "1px solid rgba(124,58,237,0.4)", color: "#B39DDB", fontSize: 15,
                      textDecoration: "none", textAlign: "center"
                    }}>
                    EV Society
                  </a>
                </>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{
        paddingTop: 116, paddingBottom: 56,
        display: "flex", alignItems: "center", position: "relative", overflow: "hidden"
      }} className={styles.gridBg}>
        {/* Orbs */}
        <div className={styles.orb} style={{ width: 600, height: 600, background: "#7C3AED", top: -100, left: -200 }} />
        <div className={styles.orb} style={{ width: 400, height: 400, background: "#3B82F6", bottom: -100, right: -100 }} />
        <div className={styles.orb} style={{ width: 300, height: 300, background: "#06B6D4", top: "40%", left: "40%" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", width: "100%", gap: 48, alignItems: "center" }}
          className={styles.heroGrid}>
          {/* Left */}
          <div className={styles.fadeInUp}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 999, padding: "7px 16px", marginBottom: 28
            }}>
              <Shield size={14} color="#7C3AED" />
              <span style={{ color: "#B39DDB", fontSize: 13, fontWeight: 500 }}>EV Society · Aerospace Research Platform</span>
            </div>

            <h1 style={{
              fontFamily: FONT_MANROPE, fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", margin: "0 0 20px"
            }}>
              <span style={{ color: "#fff" }}>Learn Aerospace</span><br />
              <span style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cybersecurity</span><br />
              <span style={{ color: "#fff" }}>The Right Way</span>
            </h1>

            <p style={{ color: "#B5B8C9", fontSize: 16, lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>
              Protect Aircraft, Drones, Air Taxis, Airports, Satellites and Future Air Mobility Systems through practical engineering, cybersecurity research, and hands-on labs.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <button style={{
                padding: "13px 28px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: "opacity 0.2s"
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Explore Learning <ArrowRight size={16} />
              </button>
              <button style={{
                padding: "13px 24px", borderRadius: 12, background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.35)", color: "#93C5FD", fontWeight: 600, fontSize: 15, cursor: "pointer"
              }}>Research Projects</button>
              <Link href="/contact" style={{
                padding: "13px 24px", borderRadius: 12, background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)", color: "#B5B8C9", fontWeight: 600, fontSize: 15, cursor: "pointer",
                textDecoration: "none", display: "block"
              }}>Join Community</Link>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  paddingRight: 36, marginRight: 36, borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none"
                }}>
                  <div style={{ fontFamily: FONT_MANROPE, fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#B5B8C9", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Floating card */}
          <div className={styles.floatAnim} style={{ position: "relative" }}>
            <div style={{
              background: "rgba(17,21,46,0.85)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(124,58,237,0.25)", borderRadius: 24,
              padding: "24px", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Featured Learning Paths
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: FONT_MANROPE }}>Start Learning Today</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#FF6B6B", "#FFD93D", "#6BCB77"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {learningPathCards.map(card => (
                  <div key={card.title}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${card.color}18`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${card.color}44`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${card.color}22`, flexShrink: 0, color: card.color
                    }}>{card.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{card.title}</div>
                      <div style={{ fontSize: 12, color: "#B5B8C9", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: card.color }} />
                        {card.count}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#B5B8C9" />
                  </div>
                ))}
              </div>

              <button style={{
                width: "100%", marginTop: 16, padding: "12px", borderRadius: 12,
                background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                color: "#B39DDB", fontWeight: 600, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                View All Learning Paths <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ padding: "72px 32px", maxWidth: 1280, margin: "0 auto", gap: 56, alignItems: "center" }}
        className={styles.aboutGrid}>
        {/* Left – Cyber illustration */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 400, maxWidth: "100%", aspectRatio: "400 / 420", height: "auto",
            borderRadius: 28, overflow: "hidden", position: "relative",
            background: "linear-gradient(135deg, #11152E, #0D1230)",
            border: "1px solid rgba(124,58,237,0.2)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5)"
          }}>
            {/* SVG cyber aircraft wireframe */}
            <svg viewBox="0 0 400 420" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* Grid */}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 52} x2="400" y2={i * 52} stroke="rgba(124,58,237,0.08)" strokeWidth="1" />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="420" stroke="rgba(124,58,237,0.08)" strokeWidth="1" />
              ))}
              {/* Aircraft body */}
              <path d="M200 80 L320 200 L280 220 L200 180 L120 220 L80 200 Z" fill="none" stroke="url(#planeGrad)" strokeWidth="1.5" />
              {/* Wings */}
              <path d="M200 140 L380 280 L320 290 L200 200 Z" fill="rgba(124,58,237,0.06)" stroke="rgba(124,58,237,0.4)" strokeWidth="1" />
              <path d="M200 140 L20 280 L80 290 L200 200 Z" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
              {/* Tail */}
              <path d="M200 180 L230 320 L200 360 L170 320 Z" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
              {/* Engines */}
              <ellipse cx="290" cy="240" rx="24" ry="10" fill="none" stroke="rgba(124,58,237,0.6)" strokeWidth="1.2" />
              <ellipse cx="110" cy="240" rx="24" ry="10" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="1.2" />
              {/* Cockpit */}
              <ellipse cx="200" cy="100" rx="14" ry="22" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.6)" strokeWidth="1.5" />
              {/* Scan lines */}
              <line x1="80" y1="200" x2="320" y2="200" stroke="rgba(6,182,212,0.2)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="200" y1="80" x2="200" y2="380" stroke="rgba(124,58,237,0.2)" strokeWidth="0.5" strokeDasharray="4 4" />
              {/* Data nodes */}
              {[[200, 200], [320, 200], [80, 200], [200, 80], [290, 240], [110, 240]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill={i % 2 === 0 ? "#7C3AED" : "#06B6D4"} opacity="0.8" />
              ))}
              {/* Hex elements */}
              <polygon points="200,30 215,38 215,54 200,62 185,54 185,38" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
            </svg>

            {/* Floating badge */}
            <div style={{
              position: "absolute", bottom: 24, left: 24, right: 24,
              background: "rgba(9,11,29,0.9)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Youtube size={18} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Open Source Research</div>
                <div style={{ fontSize: 12, color: "#B5B8C9" }}>GitHub · 8 Active Projects</div>
              </div>
            </div>
          </div>

          {/* Floating stat card */}
          <div style={{
            position: "absolute", top: 20, right: -20, background: "rgba(17,21,46,0.9)",
            backdropFilter: "blur(16px)", border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 14, padding: "14px 18px", zIndex: 2
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#3B82F6", fontFamily: FONT_MANROPE }}>50+</div>
            <div style={{ fontSize: 12, color: "#B5B8C9" }}>Research Topics</div>
          </div>
        </div>

        {/* Right */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 999, padding: "6px 14px", marginBottom: 20 }}>
            <span style={{ color: "#B39DDB", fontSize: 12, fontWeight: 500 }}>About Aerospace</span>
          </div>
          <h2 style={{ fontFamily: FONT_MANROPE, fontSize: "clamp(26px, 3.6vw, 36px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 20px" }}>
            Teaching Aerospace<br />
            <span style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>to the World</span>
          </h2>
          <p style={{ color: "#B5B8C9", fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
            Aerospace is a next-generation platform focused on aviation, drones, autonomous aircraft, embedded systems, AI security, cloud security, and practical engineering.
          </p>
          <p style={{ color: "#B5B8C9", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
            <span style={{ color: "#7C3AED", fontWeight: 600 }}>Mission:</span> Build highly skilled Aerospace Engineers through practical learning and open research. Powered by EV.ENGINEER.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { icon: <Github size={16} />, label: "GitHub" },
              { icon: <Youtube size={16} />, label: "YouTube" },
              { icon: <Linkedin size={16} />, label: "LinkedIn" },
              { icon: <BookOpen size={16} />, label: "Research Papers" },
            ].map(btn => (
              <a key={btn.label} href="#" style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#B5B8C9", fontSize: 14, fontWeight: 500, textDecoration: "none",
                transition: "all 0.2s"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.3)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#B5B8C9"; }}
              >
                {btn.icon} {btn.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics ── */}
      <section style={{ padding: "56px 32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto 48px", textAlign: "center" }}>
          <SectionLabel>Topics</SectionLabel>
          <h2 style={sectionH2}>Everything You Need to Know</h2>
          <p style={sectionDesc}>From avionics protocols to AI security — all aerospace cybersecurity domains in one place.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 1000, margin: "0 auto" }}>
          {topics.map(t => <span key={t} className={styles.tagPill}>{t}</span>)}
        </div>
      </section>

      {/* ── Learning Paths ── */}
      <section style={{ padding: "56px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <SectionLabel>Learning Paths</SectionLabel>
          <h2 style={sectionH2}>Structured Paths to Mastery</h2>
          <p style={sectionDesc}>Curated learning journeys from foundational security to advanced aerospace specialization.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {fullPaths.map(p => (
            <div key={p.title} className={`${styles.cardHover} ${styles.gradientBorder}`} style={{ padding: 1 }}>
              <div style={{
                background: "linear-gradient(135deg, #11152E, #13183A)", borderRadius: 20,
                padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${p.color}20`, color: p.color, flexShrink: 0
                  }}>{p.icon}</div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
                    background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30`
                  }}>{p.lessons} Lessons</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 18, color: "#fff", margin: "0 0 8px" }}>{p.title}</h3>
                  <p style={{ color: "#B5B8C9", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: p.color, fontSize: 14, fontWeight: 600 }}>
                  Start Path <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hands-on Labs ── */}
      <section style={{ padding: "56px 32px", background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <SectionLabel>Hands-on Labs</SectionLabel>
            <h2 style={sectionH2}>Learn by Doing</h2>
            <p style={sectionDesc}>Real-world cybersecurity labs designed for aerospace systems. No setup required.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {labs.map(lab => (
              <div key={lab.title} className={styles.cardHover} style={{
                background: "rgba(17,21,46,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 10,
                cursor: "pointer", transition: "all 0.2s"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${lab.color}44`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `${lab.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: lab.color
                  }}>{lab.icon}</div>
                  <LevelBadge level={lab.level} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 15, color: "#fff", margin: "0 0 4px" }}>{lab.title}</h3>
                  <div style={{ fontSize: 12, color: "#B5B8C9", display: "flex", alignItems: "center", gap: 6 }}>
                    <FlaskConical size={11} /> Hands-on Lab
                  </div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4, color: lab.color, fontSize: 13, fontWeight: 600 }}>
                  Launch Lab <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Source Projects ── */}
      <section style={{ padding: "56px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <SectionLabel>Open Source</SectionLabel>
          <h2 style={sectionH2}>Build in the Open</h2>
          <p style={sectionDesc}>Production-grade aerospace cybersecurity tools, freely available on GitHub.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {projects.map(p => (
            <div key={p.title} className={styles.cardHover} style={{
              background: "rgba(17,21,46,0.6)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 18, padding: "18px", cursor: "pointer", transition: "all 0.2s"
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${p.color}44`; (e.currentTarget as HTMLElement).style.background = "rgba(17,21,46,0.9)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.background = "rgba(17,21,46,0.6)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: `${p.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: p.color
                }}>{p.icon}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#B5B8C9", fontSize: 13 }}>
                  <Star size={13} /> {p.stars}
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: "#fff", margin: "0 0 8px", fontFamily: FONT_MANROPE }}>{p.title}</h3>
              <p style={{ color: "#B5B8C9", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>{p.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: p.color, fontSize: 13, fontWeight: 600 }}>
                <Github size={14} /> View on GitHub <ExternalLink size={12} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Research ── */}
      <section style={{ padding: "56px 32px", background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <SectionLabel>Research</SectionLabel>
            <h2 style={sectionH2}>Cutting-Edge Research Areas</h2>
            <p style={sectionDesc}>Advancing the state of aerospace cybersecurity through open research.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {research.map((r, i) => (
              <div key={r.title} className={styles.cardHover} style={{
                background: "rgba(17,21,46,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18, padding: "18px", display: "flex", flexDirection: "column", gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: r.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                  }}>{String(i + 1).padStart(2, "0")}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                    background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}30`,
                    textTransform: "uppercase", letterSpacing: "0.06em"
                  }}>{r.tag}</span>
                </div>
                <h3 style={{ fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 16, color: "#fff", margin: 0, lineHeight: 1.3 }}>{r.title}</h3>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4, color: r.color, fontSize: 13, fontWeight: 600 }}>
                  Read More <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certification Roadmap ── */}
      <section style={{ padding: "56px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <SectionLabel>Certification Roadmap</SectionLabel>
          <h2 style={sectionH2}>Your Path to Expertise</h2>
          <p style={sectionDesc}>A structured progression from fundamentals to security architect — at your own pace.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, position: "relative" }}>
          {/* connector line */}
          <div style={{
            position: "absolute", top: 36, left: "12.5%", right: "12.5%", height: 2,
            background: "linear-gradient(90deg, #7C3AED, #3B82F6, #8B5CF6, #06B6D4)",
            borderRadius: 2, zIndex: 0
          }} className={styles.hiddenMobile} />

          {roadmap.map((r, i) => (
            <div key={r.level} style={{ position: "relative", zIndex: 1 }}>
              {/* Node */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", background: r.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONT_MANROPE, fontWeight: 800, fontSize: 13, color: "#fff",
                  boxShadow: `0 0 24px ${r.color}66`, zIndex: 1
                }}>{i + 1}</div>
              </div>
              <div style={{
                background: "rgba(17,21,46,0.8)", border: `1px solid ${r.color}30`,
                borderRadius: 18, padding: "16px", textAlign: "center"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: r.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{r.level}</div>
                <div style={{ fontFamily: FONT_MANROPE, fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 14 }}>{r.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {r.topics.map(t => (
                    <span key={t} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 999,
                      background: `${r.color}12`, color: "#B5B8C9", border: `1px solid ${r.color}20`
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "56px 32px", background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <SectionLabel>Testimonials</SectionLabel>
            <h2 style={sectionH2}>Trusted by Industry Experts</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {testimonials.map(t => (
              <div key={t.name} className={`${styles.cardHover} ${styles.gradientBorder}`} style={{ padding: 1 }}>
                <div style={{
                  background: "linear-gradient(135deg, #11152E, #13183A)", borderRadius: 20, padding: "20px",
                  height: "100%", display: "flex", flexDirection: "column", gap: 16
                }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <p style={{ color: "#B5B8C9", fontSize: 15, lineHeight: 1.7, margin: 0, flex: 1 }}>&ldquo;{t.text}&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff"
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#B5B8C9" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section style={{ padding: "56px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <SectionLabel>Community</SectionLabel>
          <h2 style={sectionH2}>Find Us Online</h2>
          <p style={sectionDesc}>Follow our channels and stay updated with the latest aerospace cybersecurity research.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {community.map(c => (
            <a key={c.name} href="#" style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "24px 16px", borderRadius: 18, textDecoration: "none",
              background: c.bg, border: `1px solid ${c.color}22`,
              transition: "all 0.2s", textAlign: "center"
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.borderColor = `${c.color}55`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = `${c.color}22`; }}
            >
              <div style={{ color: c.color }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: "#B5B8C9" }}>{c.handle}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "56px 32px", background: "rgba(17,21,46,0.4)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 style={sectionH2}>Common Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "56px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))",
            border: "1px solid rgba(124,58,237,0.25)", borderRadius: 28, padding: "44px 32px",
            position: "relative", overflow: "hidden"
          }}>
            <div className={styles.orb} style={{ width: 300, height: 300, background: "#7C3AED", top: -80, left: -80, opacity: 0.2 }} />
            <div className={styles.orb} style={{ width: 200, height: 200, background: "#06B6D4", bottom: -60, right: -60, opacity: 0.15 }} />
            <Shield size={36} color="#7C3AED" style={{ marginBottom: 16 }} />
            <h2 style={{ fontFamily: FONT_MANROPE, fontSize: "clamp(24px, 3.4vw, 32px)", fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
              Ready to Secure the Future of Flight?
            </h2>
            <p style={{ color: "#B5B8C9", fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }}>
              Join thousands of aerospace engineers and cybersecurity professionals building the future of safe aviation.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{
                padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8
              }}>
                Start Learning Free <ArrowRight size={18} />
              </button>
              <Link href="/contact" style={{
                padding: "14px 28px", borderRadius: 12, background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)", color: "#B5B8C9", fontWeight: 600, fontSize: 16, cursor: "pointer",
                textDecoration: "none", display: "block"
              }}>Express Interest</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 32px 28px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ gap: 40, marginBottom: 40 }}
            className={styles.footerGrid}>
            {/* Col 1 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plane size={16} color="#fff" />
                </div>
                <span style={{ fontFamily: FONT_MANROPE, fontWeight: 800, fontSize: 16, color: "#fff" }}>
                  Aerospace
                </span>
              </div>
              <p style={{ color: "#B5B8C9", fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 280 }}>
                A next-generation Aerospace learning and research platform. Powered by EV.ENGINEER.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[<Github key="gh" size={16} />, <Youtube key="yt" size={16} />, <Linkedin key="li" size={16} />, <MessageSquare key="ms" size={16} />].map((icon, i) => (
                  <a key={i} href="#" style={{
                    width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#B5B8C9", transition: "all 0.2s", textDecoration: "none"
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.2)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#B5B8C9"; }}
                  >{icon}</a>
                ))}
              </div>
            </div>

            {/* Col 2 */}
            <FooterCol title="Learning" links={["Tutorials", "Labs", "Research", "Projects", "Certification"]} />
            {/* Col 3 */}
            <FooterCol title="Resources" links={["Blogs", "Whitepapers", "GitHub", "Downloads", "Research Papers"]} />
            {/* Col 4 */}
            <FooterCol title="Contact" links={["Email Us", "LinkedIn", "YouTube", "Discord", "Newsletter"]} />
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#B5B8C9", fontSize: 13 }}>© 2026 Aerospace · Building the Future of Safe Aviation</span>
            <span style={{ color: "#B5B8C9", fontSize: 13 }}>Powered by EV.ENGINEER</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", paddingTop: 16 }}>
            <a href="https://www.uflight.in/" target="_blank" rel="noopener noreferrer" style={{ color: "#B5B8C9", fontSize: 13, textDecoration: "none" }}>UFlight</a>
            <a href="https://www.evsociety.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#B5B8C9", fontSize: 13, textDecoration: "none" }}>EV Society</a>
            <a href="https://itelematics.com" target="_blank" rel="noopener noreferrer" style={{ color: "#B5B8C9", fontSize: 13, textDecoration: "none" }}>iTelematics</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
