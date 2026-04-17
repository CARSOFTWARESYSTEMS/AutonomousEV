import Link from "next/link";
import React from "react";
import "./si-ems.css";

export const metadata = {
  title: "AI-Driven SI-EMS Research | Autonomous EV Energy Management | EV.ENGINEER™",
  description: "Explore the flagship research on Super-Intelligent Energy Management Systems (SI-EMS) for Level-4 Autonomous EVs. Advanced AI strategies for energy optimization, pack life extension, and safety-invariant control.",
};

export default function SIEMSPage() {
  const parts = [
    { 
      id: "part0", 
      part: "PART 0", 
      title: "Conceptual Foundations (First Principles)",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 0.1 — What Is an Energy Management System (EMS)?</h3>
            <p style={{ marginBottom: "16px" }}>
              An <strong>Energy Management System (EMS)</strong> is a control system responsible for coordinating the flow of energy between sources, storage elements, conversion devices, and loads within a physical system to satisfy performance objectives while respecting operational constraints.
            </p>
            <p style={{ marginBottom: "16px" }}>
              In electric vehicles, the EMS is the supervisory controller that decides, at every instant of time, <em>how much power to draw from the battery, how much to recover through regenerative braking, how to apportion energy between traction and auxiliary systems, and when to pre-condition the battery for upcoming charging or thermal events.</em>
            </p>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
               <h4 style={{ fontSize: "0.9rem", color: "var(--color-accent)", marginBottom: "8px", textTransform: "uppercase" }}>Classical EMS Control Hierarchy</h4>
               <pre style={{ fontSize: "0.85rem", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
{`Level 3: Mission/Route Optimization (minutes to hours)
Level 2: Supervisory Energy Management (seconds to minutes)
Level 1: Subsystem Controllers (milliseconds to seconds)
         — BMS, Motor Controller, Inverter, HVAC Controller
Level 0: Actuators and Sensors (microseconds to milliseconds)`}
               </pre>
            </div>
            <p>
              The <strong>Utility Function</strong> of a classical EMS focuses on minimizing energy consumption, degradation, and discomfort subject to safety and stability constraints.
            </p>
          </div>

          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 0.2 — What Is a Battery Management System (BMS)?</h3>
            <p style={{ marginBottom: "16px" }}>
              A <strong>Battery Management System (BMS)</strong> is an electronic system that manages a rechargeable battery by monitoring its state, protecting it, and balancing it. The BMS is a <em>subsystem of the EMS</em>, responsible for the battery pack specifically, while the EMS handles the entire vehicle energy flow.
            </p>
            <div className="grid-2" style={{ gap: "20px", marginBottom: "16px" }}>
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--color-accent)", marginBottom: "8px" }}>Monitoring & Estimation</h4>
                <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", paddingLeft: "20px", listStyle: "circle" }}>
                  <li>SoC (State of Charge) - "Fuel gauge"</li>
                  <li>SoH (State of Health) - Battery aging</li>
                  <li>SoP (State of Power) - Max power 10s</li>
                  <li>SoS (State of Safety) - Thermal/Elec safety</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--color-accent)", marginBottom: "8px" }}>Hardware Tiers</h4>
                <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", paddingLeft: "20px", listStyle: "circle" }}>
                  <li>Tier 1: Cell Supervisory Circuit (CSC)</li>
                  <li>Tier 2: Module Management Unit (MMU)</li>
                  <li>Tier 3: BMS Master ECU (ASIL-D)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 0.4 — What Makes an EMS "Super-Intelligent"?</h3>
            <p style={{ marginBottom: "16px" }}>
              The <strong>Super-Intelligent EMS (SI-EMS)</strong> moves beyond reactive models to <strong>Perception-Aware</strong> optimization. It knows what the autonomous vehicle "sees" — predicted stops, road grade, traffic density, and agent behavior.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              <span className="pill" style={{ borderColor: "var(--color-accent)" }}>DRL Policy</span>
              <span className="pill" style={{ borderColor: "var(--color-accent)" }}>Agentic AI</span>
              <span className="pill" style={{ borderColor: "var(--color-accent)" }}>GenAI Synthesis</span>
              <span className="pill" style={{ borderColor: "var(--color-accent)" }}>Digital Twins (PINN)</span>
              <span className="pill" style={{ borderColor: "var(--color-accent)" }}>Quantum Optimization</span>
            </div>
            <p>
              By integrating with Level-4 perception stacks, SI-EMS achieves safety guarantees via hybrid <strong>DRL + MPC + CBF</strong> (Control-Barrier Function) architectures.
            </p>
          </div>
        </>
      )
    },
    {
      id: "part1",
      part: "PART I",
      title: "Problem Landscape",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 1 — Problem Definition & Scope</h3>
            <blockquote style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "16px", background: "rgba(76, 169, 48, 0.05)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              "Given an SAE Level-4 autonomous EV, design a system that reduces energy-per-mission by ≥10%, extends pack life by ≥15%, and maintains zero safety-invariant violations."
            </blockquote>
            <p>
              L4 Autonomous Vehicles differ from conventional EVs in two key ways:
            </p>
            <ul style={{ color: "var(--color-text-secondary)", marginLeft: "20px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Compute Load:</strong> Autonomy stacks consume 300W–2.5kW, equivalent to a residential refrigerator, accounting for 10-25% of energy.</li>
              <li><strong>Deterministic Planning:</strong> The future motion is a known "planned trajectory," which allows for qualitatively superior energy optimization compared to unpredictable human drivers.</li>
            </ul>
          </div>
          <div className="grid-2">
            <div className="glass-panel">
              <h4 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Technical Feasibility</h4>
              <p style={{ fontSize: "0.9rem" }}>TensorRT INT8 quantization allows SAC policies to execute in 1-3ms on NVIDIA Orin. MPC solvers with 10-step horizons solve in 5-15ms, making the 20ms p99 latency budget feasible.</p>
            </div>
            <div className="glass-panel">
              <h4 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Economic Feasibility</h4>
              <p style={{ fontSize: "0.9rem" }}>10% energy saving on a 70kWh robotaxi saves ~$380/year/vehicle. 15% life extension on a $15k pack adds $2,250 in value per vehicle. ROI is positive within 12-18 months at fleet scale.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: "part2",
      part: "PART II",
      title: "System Analysis & Planning",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 5 — System Architecture Overview</h3>
            <p style={{ marginBottom: "16px" }}>The SI-EMS uses a <strong>Five-Layer Architecture</strong> to manage everything from physical sensors to cloud-scale fleet intelligence.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { layer: "Layer 5", title: "Fleet Intelligence Cloud", desc: "Fleet optimizer, Federated Learning aggregator, Digital twin cloud." },
                { layer: "Layer 4", title: "Vehicle-Level SI-EMS", desc: "Edge logic: DRL, MPC, PINN, XAI. Runs on Jetson Orin." },
                { layer: "Layer 3", title: "Autonomy Stack", desc: "Perception, Prediction, Planning. Provides occupancy grids and trajectories." },
                { layer: "Layer 2", title: "Subsystem Controllers", desc: "BMS Master, VCU, Motor Controller, HVAC Controller." },
                { layer: "Layer 1", title: "Hardware", desc: "Cell AFEs, IMU, GNSS, Cameras, LiDAR, Inverters." }
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-glass-border)" }}>
                  <span style={{ color: "var(--color-accent)", fontWeight: "700", whiteSpace: "nowrap" }}>{l.layer}</span>
                  <div>
                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{l.title}</span> — <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{l.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    },
    {
      id: "part3",
      part: "PART III",
      title: "Core Subsystem Architecture",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 7 — BMS Deep Architecture</h3>
            <p style={{ marginBottom: "16px" }}>State of Charge (SoC) estimation via <strong>Extended Kalman Filter (EKF)</strong> using a 2-RC equivalent circuit model:</p>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "12px", fontFamily: "monospace", fontSize: "0.85rem", overflowX: "auto", border: "1px solid var(--color-glass-border)" }}>
{`SoC(k+1) = SoC(k) - (η·I·Δt) / C_nom
V_terminal = OCV(SoC) - I·R_0 - V_RC1 - V_RC2

EKF Predict: x̂_(k|k-1) = f(x̂_(k-1|k-1), u_k)
EKF Update:  x̂_(k|k) = x̂_(k|k-1) + K_k · (y_k - h(x̂_(k|k-1)))`}
            </div>
            <p style={{ marginTop: "16px" }}>
              SI-EMS adds <strong>PINN-Accelerated Electrochemical States</strong>, allowing it to see lithium concentration at electrode surfaces in real-time.
            </p>
          </div>
          <div className="grid-2">
            <div className="glass-panel">
              <h4 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Chapter 10 — Predictive Regen</h4>
              <p style={{ fontSize: "0.9rem" }}>P2EC (Perception-to-Energy Coupling) allows for <strong>Predictive Coasting</strong>. If a red light is predicted 200m ahead, SI-EMS commands coasting followed by optimized regen, increasing recovery by up to 25%.</p>
            </div>
            <div className="glass-panel">
              <h4 style={{ color: "var(--color-accent)", marginBottom: "12px" }}>Chapter 11 — HVAC & Aux</h4>
              <p style={{ fontSize: "0.9rem" }}>AI-driven HVAC manages thermal budgets by co-optimizing cabin comfort with compute cooling (2000W+ heat) and battery preconditioning for charge sessions.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: "part4",
      part: "PART IV",
      title: "AI Intelligence Layer",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 14 — The SI-EMS AI Stack</h3>
            <p style={{ marginBottom: "24px" }}>The system coordinates multiple AI paradigms in a unified control loop:</p>
            <div className="grid-2" style={{ gap: "24px" }}>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(76, 169, 48, 0.2)" }}>
                <h4 style={{ color: "var(--color-accent)" }}>DRL (SAC)</h4>
                <p style={{ fontSize: "0.85rem" }}>LEARNS the <strong>WHAT</strong> — global energy strategy from experience. Samples from fleet telemetry.</p>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(76, 169, 48, 0.2)" }}>
                <h4 style={{ color: "var(--color-accent)" }}>MPC (OSQP)</h4>
                <p style={{ fontSize: "0.85rem" }}>ENFORCES the <strong>HOW</strong> — safety constraints and real-time responsiveness using PINN surrogates.</p>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(76, 169, 48, 0.2)" }}>
                <h4 style={{ color: "var(--color-accent)" }}>Generative AI</h4>
                <p style={{ fontSize: "0.85rem" }}>SYNTHESIZES failure scenarios via Diffusion Models and EXPLAINS decisions via LLM narratives.</p>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(76, 169, 48, 0.2)" }}>
                <h4 style={{ color: "var(--color-accent)" }}>Agentic AI</h4>
                <p style={{ fontSize: "0.85rem" }}>ORCHESTRATES long-horizon plans like V2G bidding and fleet charging negotiation through tool-use.</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: "part5",
      part: "PART V",
      title: "Security Architecture",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 22 — NIST Post-Quantum Defense</h3>
            <p style={{ marginBottom: "16px" }}>SI-EMS is designed for <strong>UN R155/R156</strong> and <strong>ISO 21434</strong> compliance. Key security features include:</p>
            <ul style={{ color: "var(--color-text-secondary)", marginLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}><strong>PQC Algorithms:</strong> ML-KEM/Kyber for long-lived credentials.</li>
              <li style={{ marginBottom: "8px" }}><strong>HSM Integration:</strong> Root-of-trust for all AI model signatures.</li>
              <li style={{ marginBottom: "8px" }}><strong>Byzantine-Robust FL:</strong> Protecting fleet updates from poisoned gradients.</li>
              <li><strong>Secure Inference:</strong> Model obfuscation and hardware-bound model keys.</li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: "part6",
      part: "PART VI",
      title: "Safety & Regulatory",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px", borderLeft: "4px solid var(--success)" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 26 — ASIL-D Decomposition for AI</h3>
            <p style={{ marginBottom: "16px" }}>No autonomous action reaches actuators without being filtered by the <strong>Safety Monitor</strong>. This follows the ISO 26262 ASIL Decomposition strategy:</p>
            <div style={{ padding: "16px", background: "rgba(0,255,160,0.05)", borderRadius: "8px", border: "1px solid rgba(0,255,160,0.1)" }}>
               <p style={{ fontSize: "0.9rem" }}><strong>AI Layer (ASIL-A):</strong> Recommends actions.<br/>
               <strong>+ Software Filter (ASIL-B):</strong> Constraints checking (MPC/CBF).<br/>
               <strong>+ Hardware Monitor (ASIL-D):</strong> Physical cutoff via independent watchdogs.<br/>
               <strong>= System Result (ASIL-D)</strong></p>
            </div>
            <p style={{ marginTop: "16px" }}>
              Complies with <strong>ISO 21448 SOTIF</strong> requirements for reducing residual risk in unknown unsafe scenarios.
            </p>
          </div>
        </>
      )
    },
    {
      id: "part8",
      part: "PART VIII",
      title: "Proof of Concept & Evaluation",
      content: (
        <>
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Chapter 31 — Three-Tier POC Strategy</h3>
            <div className="grid-3" style={{ gap: "20px" }}>
               <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "1.2rem", color: "var(--color-accent)", fontWeight: "700", marginBottom: "8px" }}>Tier 1</div>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "12px" }}>Simulation</div>
                  <p style={{ fontSize: "0.75rem" }}>CARLA + PyBaMM. Validates algorithmic performance.</p>
               </div>
               <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "1.2rem", color: "var(--color-accent)", fontWeight: "700", marginBottom: "8px" }}>Tier 2</div>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "12px" }}>HIL</div>
                  <p style={{ fontSize: "0.75rem" }}>dSPACE + Real BMS ECU. Validates real-time hardware.</p>
               </div>
               <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "1.2rem", color: "var(--color-accent)", fontWeight: "700", marginBottom: "8px" }}>Tier 3</div>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "12px" }}>Edge</div>
                  <p style={{ fontSize: "0.75rem" }}>NVIDIA Orin Deployment. Validates production silicon.</p>
               </div>
            </div>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px", position: "relative" }}>
      {/* Background Accent */}
      <div style={{ position: "fixed", top: "0", left: "50%", transform: "translateX(-50%)", width: "100%", height: "600px", background: "radial-gradient(circle at 50% 0%, rgba(76, 169, 48, 0.12), transparent 70%)", pointerEvents: "none", zIndex: -1 }}></div>

      <div style={{ display: "flex", gap: "64px", alignItems: "flex-start" }}>
        
        {/* Sticky Progress / ToC Sidebar */}
        <aside style={{ position: "sticky", top: "120px", width: "260px", flexShrink: 0, display: "none" }} className="sidebar-desktop">
          <div className="glass-panel" style={{ padding: "20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Research Roadmap</p>
            <nav>
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {parts.map(p => (
                  <li key={p.id}>
                    <a href={`#${p.id}`} className="toc-link" style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", gap: "8px" }}>
                      <span style={{ color: "var(--color-accent)", fontWeight: "700" }}>{p.part}</span>
                      <span className="toc-title">{p.title.split('—')[0].split('(')[0].trim()}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--color-glass-border)" }}>
               <Link href="/contact" className="btn btn-primary" style={{ width: "100%", fontSize: "0.9rem" }}>Collaborate</Link>
            </div>
          </div>
        </aside>

        <div style={{ flex: 1 }}>
          <header style={{ marginBottom: "64px" }}>
            <div className="pill" style={{ marginBottom: "16px", color: "var(--color-accent)" }}>v2.0 FLAGSHIP RESEARCH SYLLABUS</div>
            <h1 style={{ fontSize: "3rem", marginBottom: "20px", lineHeight: "1.1", maxWidth: "900px" }}>
              AI-Driven Super-Intelligent Energy Management Systems for Autonomous EVs
            </h1>
            <p style={{ fontSize: "1.25rem", color: "var(--color-text-secondary)", maxWidth: "800px", lineHeight: "1.5" }}>
              Architectural Design & Proof-of-Concept Syllabus for Level-4 Robotaxi Platforms.
            </p>
          </header>

          <section className="glass-panel" style={{ marginBottom: "64px", borderLeft: "4px solid var(--color-accent)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                   <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Lead Architect & Author</p>
                   <h2 style={{ fontSize: "1.8rem", marginBottom: "0" }}>Sudarshana Karkala</h2>
                   <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Principal Engineer | iTelematics Software Private Limited</p>
                </div>
                <div style={{ textAlign: "right", display: "none" }} className="desktop-only">
                    <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--color-accent)" }}>36</div>
                    <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Core Chapters</p>
                </div>
             </div>
          </section>

          {/* Research Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
            {parts.map((p) => (
              <section key={p.id} id={p.id} className="fade-in">
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "32px", borderBottom: "1px solid var(--color-glass-border)", paddingBottom: "16px" }}>
                  <span style={{ fontSize: "1rem", fontWeight: "800", color: "var(--color-accent)" }}>{p.part}</span>
                  <h2 style={{ fontSize: "2rem", marginBottom: "0" }}>{p.title}</h2>
                </div>
                {p.content}
              </section>
            ))}
          </div>

          <section style={{ marginTop: "100px" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "40px", textAlign: "center" }}>Technical execution timeline</h2>
            <div className="glass-panel">
               <div className="grid-2" style={{ gap: "40px" }}>
                  <div>
                    <h4 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Phase 1: Foundation (M1–M6)</h4>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>Focus on ISO 26262 functional safety documentation, system architectural modeling, and high-fidelity simulation setup using CARLA and PyBaMM.</p>
                  </div>
                  <div>
                    <h4 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Phase 2: Core Stack (M7–M15)</h4>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>Implementation of MPC baselines, P2EC feature extraction algorithms, and Deep Reinforcement Learning (SAC) policy training in simulated environments.</p>
                  </div>
                  <div>
                    <h4 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Phase 3: HIL & AI (M16–M22)</h4>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>Hardware-in-the-Loop validation on dSPACE/Speedgoat, integration of Self-Healing BMS modules, and GenAI-driven scenario synthesis.</p>
                  </div>
                  <div>
                    <h4 style={{ color: "var(--color-accent)", marginBottom: "16px" }}>Phase 4: Deployment (M23–M30+)</h4>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>Edge deployment on NVIDIA Orin/Thor, software-update management (UN R156), and final fleet-coordinated V2X validation.</p>
                  </div>
               </div>
            </div>
          </section>

          <section className="glass-panel" style={{ marginTop: "64px", background: "rgba(76, 169, 48, 0.05)", borderColor: "rgba(76, 169, 48, 0.2)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "1.6rem" }}>Research Status: Phase 1</h3>
                <span className="pill" style={{ background: "var(--color-accent)", color: "white", border: "none", padding: "6px 16px" }}>85% Complete</span>
             </div>
             <div className="grid-2">
                <ul className="check-list">
                   <li>✓ Complete taxonomy defined</li>
                   <li>✓ PI-EMS Layer-4 architecture finalized</li>
                   <li>✓ P2EC feature set formulated</li>
                </ul>
                <ul className="check-list">
                   <li>✓ ISO 26262 HARA complete</li>
                   <li className="in-progress">[/] CARLA simulation environment integration</li>
                   <li className="todo">[ ] Baseline MPC benchmarking</li>
                </ul>
             </div>
          </section>

          <section style={{ textAlign: "center", marginTop: "120px", padding: "80px 0", borderTop: "1px solid var(--color-glass-border)" }}>
            <h2 style={{ fontSize: "2.8rem", marginBottom: "24px" }}>Partner with us</h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "48px", maxWidth: "700px", margin: "0 auto 48px", fontSize: "1.2rem" }}>
              We are looking for research collaborators, OEMs, and post-doctoral candidates to participate in the Tier-2 HIL and Tier-3 validation phases.
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
