"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import {
  Brain, BatteryCharging, Fingerprint, Activity,
  Truck, Plane, Cpu, Zap, Search, MessageSquare,
  Settings, Server, Cloud, ShieldCheck, GitBranch,
  Rocket, GraduationCap, ChevronRight, CheckCircle2,
  Users, Presentation, Briefcase, FileSearch, Atom,
  Radar, Smartphone, Network, Code, Layers, Bot, Compass
} from "lucide-react";

// --- DATA STRUCTURES ---

const ROADMAP_PHASES = [
  {
    phase: "Phase 0",
    track: "FOUNDATION & RESEARCH",
    title: "Research Area Identification",
    desc: "Identify high-impact engineering and research problems in EV systems, AI, battery technology, autonomous systems, aerospace engineering, and intelligent energy platforms.",
    focus: ["EV Systems", "AI & Agentic AI", "Battery Technology", "Embedded Systems", "Autonomous Mobility", "Aerospace & eVTOL", "Cybersecurity", "Energy Intelligence"],
    icon: Search,
    link: "/si-ems",
    linkLabel: "Explore SI-EMS",
  },
  {
    phase: "Phase 1",
    track: "AI & PROBLEM DISCOVERY",
    title: "EV Help Agent",
    desc: "Build AI-powered EV support systems capable of understanding customer issues using Voice AI, diagnostics intelligence, and autonomous reasoning workflows.",
    tech: ["Voice AI", "LLMs", "Agentic AI", "RAG", "AI Workflow Systems", "Knowledge Graphs"],
    icon: MessageSquare,
    link: "https://help.ev.engineer",
    linkLabel: "Try Help Agent ↗",
    extraLinks: [
      { href: "/internships/ev-help-agent", label: "Design Flow" },
      { href: "/internships/ev-help-agent/usecases", label: "Real AI Dialogs" }
    ]
  },
  {
    phase: "Phase 2",
    track: "BATTERY INTELLIGENCE",
    title: "EV Battery Intelligence Platform",
    desc: "Develop AI-driven battery lifecycle intelligence systems for diagnostics, thermal safety prediction, battery grading, analytics, and second-life battery ecosystems.",
    focus: ["Battery Diagnostics", "Thermal Runaway Prediction", "Battery Health Analytics", "AI Monitoring", "Safety Intelligence", "Battery Lifecycle Systems"],
    icon: Activity,
    link: "/internships/battery-fire-prevention",
    linkLabel: "Explore Platform",
  },
  {
    phase: "Phase 3",
    track: "BATTERY INTELLIGENCE",
    title: "Battery Pack Aadhaar System",
    desc: "Create a digital identity and lifecycle traceability framework for EV batteries supporting safety, ownership, circular economy, compliance, and recycling intelligence.",
    focus: ["Battery Identity", "Lifecycle Tracking", "QR/NFC Systems", "Battery History", "Recycling Intelligence", "Circular Economy"],
    icon: Fingerprint,
    link: "/internships/battery-aadhaar",
    linkLabel: "Explore System",
  },
  {
    phase: "Phase 4",
    track: "SUPER-INTELLIGENT ENERGY SYSTEMS",
    title: "SI-EMS (Super Intelligent EMS)",
    desc: "Research AI-driven autonomous energy optimization systems for future electric and autonomous mobility platforms.",
    focus: ["Autonomous Energy Systems", "Multi-Agent AI", "Predictive Energy Intelligence", "Digital Twin Systems", "AI Optimization", "Autonomous Decision Systems"],
    icon: Zap,
    link: "/si-ems",
    linkLabel: "Explore SI-EMS",
  },
  {
    phase: "Phase 5",
    track: "AUTONOMOUS MOBILITY & AEROSPACE",
    title: "Autonomous Cargo EV",
    desc: "Research autonomous electric logistics systems for industrial and airport cargo transportation.",
    icon: Truck,
    link: "/design-development/airport-cargo",
    linkLabel: "Explore Cargo EV",
  },
  {
    phase: "Phase 6",
    track: "AUTONOMOUS MOBILITY & AEROSPACE",
    title: "Autonomous Air Taxi (eVTOL)",
    desc: "Research next-generation AI-powered electric aerial mobility and aerospace energy systems.",
    icon: Plane,
    link: "/design-development/passenger-taxi",
    linkLabel: "Explore Air Taxi",
  },
  {
    phase: "Phase 7",
    track: "AEROSPACE & SPACE SYSTEMS",
    title: "IN-SPACe Model Rocketry",
    desc: "Research and develop mission-ready telemetry, avionics, recovery systems, and flight software architecture for student aerospace and model rocketry competitions.",
    focus: ["Telemetry", "Avionics", "Recovery Systems", "Flight Software", "Mission Architecture", "Aerospace Engineering"],
    icon: Rocket,
    link: "https://labs.ev.engineer/Internships/Rocketry/astroforge.html",
    linkLabel: "Explore Rocketry",
  }
];

const LABS = [
  { title: "Battery Intelligence Lab", icon: BatteryCharging, desc: "Diagnostics, thermal runaways & lifecycle analytics." },
  { title: "Agentic AI Lab", icon: Bot, desc: "Autonomous reasoning workflows & Voice AI." },
  { title: "Autonomous Mobility Lab", icon: Radar, desc: "Perception, path planning & self-driving systems." },
  { title: "Aerospace Energy Lab", icon: Rocket, desc: "eVTOL battery systems & high-density power." },
  { title: "Embedded Systems Lab", icon: Cpu, desc: "RTOS, BMS design & firmware development." },
  { title: "EV Diagnostics Lab", icon: Activity, desc: "CAN bus analysis & failure prediction models." },
];

const CAREERS = [
  { title: "EV Battery Diagnostics Engineer", icon: BatteryCharging },
  { title: "Battery Intelligence Engineer", icon: Activity },
  { title: "BMS Software Engineer", icon: Cpu },
  { title: "AI Engineer", icon: Brain },
  { title: "Agentic AI Engineer", icon: Bot },
  { title: "Autonomous Systems Engineer", icon: Radar },
  { title: "Embedded Systems Engineer", icon: Layers },
  { title: "Edge AI Engineer", icon: Network },
  { title: "Aerospace Systems Engineer", icon: Plane },
  { title: "Robotics Engineer", icon: Zap },
];

const JOURNEY = [
  { step: "01", title: "Discovery Call", icon: MessageSquare },
  { step: "02", title: "Technical Screening", icon: Code },
  { step: "03", title: "Bridge Program", icon: GraduationCap },
  { step: "04", title: "Research & Development", icon: Search },
  { step: "05", title: "Engineering Review", icon: Settings },
  { step: "06", title: "Innovation Showcase", icon: Presentation },
  { step: "07", title: "Certification", icon: CheckCircle2 },
  { step: "08", title: "Career & Startup Guidance", icon: Compass },
];

const TECH_STACK = [
  "AI & Agentic AI", "Python", "Flutter", "SwiftUI", "Embedded Systems",
  "CAN Protocol", "MQTT", "Firebase", "ROS/ROS2", "Edge AI", 
  "Computer Vision", "Battery Analytics", "Cybersecurity", "Cloud Infrastructure"
];

// --- COMPONENTS ---

// 1. Hero Section
const HeroSection = () => {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: '120px 0 80px', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      {/* Background Particles / Grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: -1,
        backgroundImage: `
          linear-gradient(to right, rgba(0, 245, 160, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 245, 160, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
      }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', background: 'var(--glass-bg)', border: '1px solid var(--accent-glow)', marginBottom: '24px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--btn-green)', boxShadow: '0 0 10px var(--btn-glow)' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--btn-green)', letterSpacing: '0.05em' }}>EV.ENGINEER™ ROADMAP</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, textShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
            Engineering the <span className="glowing-text">Future</span> of Energy, <br className="hide-mobile" />EV & Autonomous Systems
          </h1>
          
          <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 48px', lineHeight: 1.6 }}>
            A structured innovation ecosystem focused on EV Battery Intelligence, Agentic AI, Autonomous Mobility, Aerospace Systems, and Next-Generation Energy Platforms.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#roadmap" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Explore Internships
            </a>
            <a href="#labs" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'var(--glass-bg)' }}>
              Innovation Labs
            </a>
            <a href="#research" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'var(--glass-bg)', border: '1px solid transparent' }}>
              Research Tracks
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// 2. Roadmap Node
const RoadmapNode = ({ phase, index }: { phase: any, index: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "center 50%"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const glow = useTransform(scrollYProgress, [0, 1], ["0px 0px 0px transparent", "0 0 20px var(--accent-glow)"]);

  const isEven = index % 2 === 0;

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, scale, display: 'flex', flexDirection: isEven ? 'row' : 'row-reverse', alignItems: 'center', gap: '40px', position: 'relative', zIndex: 2 }}
      className="roadmap-node-container"
    >
      {/* Content Side */}
      <div style={{ flex: 1, display: 'flex', justifyContent: isEven ? 'flex-end' : 'flex-start', textAlign: isEven ? 'right' : 'left' }} className="roadmap-content">
        <div className="glass-panel" style={{ maxWidth: '500px', padding: '32px', position: 'relative', borderLeft: !isEven ? '4px solid var(--accent-primary)' : '1px solid var(--glass-border)', borderRight: isEven ? '4px solid var(--accent-primary)' : '1px solid var(--glass-border)' }}>
          
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
            {phase.track}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isEven ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
            {!isEven && <phase.icon size={24} color="var(--accent-primary)" />}
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>{phase.title}</h3>
            {isEven && <phase.icon size={24} color="var(--accent-primary)" />}
          </div>
          
          <div style={{ display: 'inline-block', background: 'rgba(76, 169, 48, 0.1)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px' }}>
            {phase.phase}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '24px' }}>
            {phase.desc}
          </p>
          
          {(phase.focus || phase.tech) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: isEven ? 'flex-end' : 'flex-start', marginBottom: '24px' }}>
              {(phase.focus || phase.tech).map((item: string, i: number) => (
                <span key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {item}
                </span>
              ))}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: isEven ? 'flex-end' : 'flex-start' }}>
            {phase.link.startsWith('http') ? (
              <a href={phase.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                {phase.linkLabel}
              </a>
            ) : (
              <Link href={phase.link} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                {phase.linkLabel} →
              </Link>
            )}
            
            {phase.extraLinks && phase.extraLinks.map((ex: any, i: number) => (
              <Link key={i} href={ex.href} className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem', background: 'transparent' }}>
                {ex.label}
              </Link>
            ))}
          </div>

        </div>
      </div>
      
      {/* Center Axis Node */}
      <motion.div style={{ boxShadow: glow, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-deep)', border: '2px solid var(--accent-primary)', zIndex: 10 }} className="roadmap-axis-node">
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
      </motion.div>
      
      {/* Empty Side for balance */}
      <div style={{ flex: 1 }} className="roadmap-empty"></div>
    </motion.div>
  );
};

const EvolutionRoadmap = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section id="roadmap" className="section" ref={containerRef} style={{ position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Engineering Evolution <span style={{ color: 'var(--accent-primary)' }}>Roadmap</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            From identifying core problems to engineering autonomous aerospace systems.
          </p>
        </div>

        <div style={{ position: 'relative', padding: '40px 0' }}>
          {/* Background Center Line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', background: 'rgba(255,255,255,0.05)', transform: 'translateX(-50%)', zIndex: 0 }} className="roadmap-bg-line"></div>
          
          {/* Animated Center Line */}
          <motion.div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, var(--success), var(--accent-primary))', transformOrigin: 'top', transform: 'translateX(-50%)', scaleY, zIndex: 1, boxShadow: '0 0 20px var(--accent-glow)' }} className="roadmap-animated-line"></motion.div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
            {ROADMAP_PHASES.map((phase, index) => (
              <RoadmapNode key={index} phase={phase} index={index} />
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 992px) {
          .roadmap-node-container {
            flex-direction: row !important;
            gap: 20px !important;
          }
          .roadmap-content {
            flex: unset !important;
            width: calc(100% - 60px) !important;
            text-align: left !important;
            justify-content: flex-start !important;
          }
          .roadmap-content .glass-panel {
            border-left: 4px solid var(--accent-primary) !important;
            border-right: 1px solid var(--glass-border) !important;
          }
          .roadmap-content .glass-panel > div:nth-child(2) {
            justify-content: flex-start !important;
          }
          .roadmap-content .glass-panel > div:nth-child(5) {
            justify-content: flex-start !important;
          }
          .roadmap-content .glass-panel > div:last-child {
            justify-content: flex-start !important;
          }
          .roadmap-empty {
            display: none !important;
          }
          .roadmap-bg-line, .roadmap-animated-line {
            left: 25px !important;
            transform: none !important;
          }
        }
      `}} />
    </section>
  );
};

// 3. Innovation Labs
const InnovationLabs = () => {
  return (
    <section id="labs" className="section" style={{ position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Innovation <span style={{ color: 'var(--accent-primary)' }}>Labs</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            State-of-the-art research environments dedicated to solving specific mobility challenges.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {LABS.map((lab, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, borderColor: 'var(--accent-primary)', boxShadow: '0 10px 40px rgba(76, 169, 48, 0.2)' }}
              className="glass-panel"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '32px' }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(76, 169, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(76, 169, 48, 0.2)' }}>
                <lab.icon size={28} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>{lab.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{lab.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Career Pathways
const CareerPathways = () => {
  return (
    <section className="section" style={{ background: 'linear-gradient(to bottom, transparent, rgba(6, 42, 28, 0.4), transparent)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Career <span style={{ color: 'var(--accent-primary)' }}>Pathways</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Build highly specialized engineering skills for the future of mobility and energy.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          {CAREERS.map((career, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(76, 169, 48, 0.15)', borderColor: 'var(--accent-primary)' }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '999px', cursor: 'default', transition: 'all 0.3s ease' }}
            >
              <career.icon size={20} color="var(--accent-primary)" />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>{career.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 5. Internship Journey
const InternshipJourney = () => {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>The <span style={{ color: 'var(--accent-primary)' }}>Journey</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            A rigorous, structured pathway from problem discovery to engineering excellence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {JOURNEY.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.05)' }}>
                {step.step}
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(76, 169, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent-primary)' }}>
                <step.icon size={24} />
              </div>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>{step.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 6. Technology Ecosystem
const TechnologyEcosystem = () => {
  return (
    <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '64px 32px', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(6, 42, 28, 0.8) 0%, var(--bg-deep) 100%)', border: '1px solid rgba(76, 169, 48, 0.3)', boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 30px rgba(76, 169, 48, 0.1)' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Technology <span style={{ color: 'var(--accent-primary)' }}>Ecosystem</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 48px' }}>
            The tools and frameworks powering our research and autonomous systems.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, background: 'var(--accent-primary)', color: '#fff', boxShadow: '0 5px 15px var(--accent-glow)' }}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, cursor: 'default', transition: 'all 0.2s' }}
              >
                {tech}
              </motion.div>
            ))}
          </div>
          
          <div style={{ marginTop: '64px' }}>
            <a href="https://wa.me/919108206147?text=Hi%2C%20I%20am%20interested%20in%20the%20EV.ENGINEER%20Internship%20Programs." target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 0 30px var(--accent-glow)' }}>
              Apply for Internship
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function RoadmapClient() {
  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', overflowX: 'hidden' }}>
      <HeroSection />
      <EvolutionRoadmap />
      <InnovationLabs />
      <CareerPathways />
      <InternshipJourney />
      <TechnologyEcosystem />
    </div>
  );
}
