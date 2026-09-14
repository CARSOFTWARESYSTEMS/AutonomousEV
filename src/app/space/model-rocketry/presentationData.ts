// Content for Presentation Mode — a condensed, workshop-projection summary
// of the full webpage. Deliberately terse: presentation mode summarizes,
// it does not duplicate every paragraph from the webpage sections.

export interface PresentationSlide {
  id: string;
  kicker: string;
  title: string;
  bullets: string[];
  notes: string;
}

export const SLIDES: PresentationSlide[] = [
  {
    id: "intro",
    kicker: "01",
    title: "Model Rocketry: Your First Aerospace System",
    bullets: [
      "A small, flyable system that teaches real aerospace engineering",
      "Mission idea → design → build → test → fly → analyse",
      "The same engineering mindset scales to real spacecraft",
    ],
    notes: "Open by framing model rocketry as a complete engineering system, not a toy. Set expectations: this is a full mission cycle in miniature.",
  },
  {
    id: "what-is-it",
    kicker: "02",
    title: "What Exactly Is Model Rocketry?",
    bullets: [
      "Small, certified commercial motors — not homemade propulsion",
      "Teaches physics, systems engineering and a full design-build-test-fly-analyse cycle",
      "An accessible entry point into the same spectrum as high-power and professional rocketry",
    ],
    notes: "Emphasize: certified commercial motors only. This distinction matters for the safety framing throughout the rest of the talk.",
  },
  {
    id: "model-vs-real",
    kicker: "03",
    title: "Model Rocket vs Real Launch Vehicle",
    bullets: [
      "Different scale. Same engineering mindset.",
      "Requirements, margins, testing, FMEA all transfer directly",
      "Model rocketry: educational risk. Professional rocketry: mission/public/asset safety",
    ],
    notes: "Use the comparison table from the webpage as a reference if questions come up about scale differences.",
  },
  {
    id: "system-of-systems",
    kicker: "04",
    title: "A Rocket Is a System of Systems",
    bullets: [
      "Aerodynamics, Structures, Propulsion, Avionics, Recovery, Ground Systems",
      "Every subsystem has interfaces, dependencies and failure modes",
      "This is systems engineering, taught by example",
    ],
    notes: "This slide is a good moment to invite questions about how subsystems depend on each other.",
  },
  {
    id: "mission-timeline",
    kicker: "05",
    title: "Mission Timeline: 3…2…1 → Recovery",
    bullets: [
      "Ignition → lift-off → rail exit → powered ascent → burnout",
      "Coast → apogee → recovery deployment → descent → landing",
      "Post-flight: telemetry review and engineering analysis",
    ],
    notes: "Walk through each phase and name which subsystems are active — this mirrors the interactive Virtual Launch hero on the webpage.",
  },
  {
    id: "anatomy",
    kicker: "06",
    title: "Rocket Anatomy",
    bullets: [
      "Vehicle: nose cone, airframe, couplers, fins, launch lug",
      "Propulsion: motor, motor mount, retention",
      "Avionics, Recovery, Ground Segment — each with distinct components",
    ],
    notes: "If projecting from a laptop, consider switching to the live Rocket Explorer on the webpage for this slide instead of static bullets.",
  },
  {
    id: "flight-forces",
    kicker: "07",
    title: "How a Rocket Flies — Forces & Stability",
    bullets: [
      "Four forces: thrust, weight, drag, aerodynamic side force",
      "Centre of Gravity (CG) ahead of Centre of Pressure (CP) = stable",
      "Static margin: the distance between CP and CG, in body diameters",
    ],
    notes: "Good place to pose the knowledge check: does moving CG forward increase or decrease stability?",
  },
  {
    id: "propulsion",
    kicker: "08",
    title: "Propulsion: Understanding Thrust Safely",
    bullets: [
      "Motors classified by total impulse and described by a thrust-time curve",
      "Motor selection is a data-sheet exercise, not a manufacturing exercise",
      "Always: certified commercial motors, manufacturer instructions, official range procedures",
    ],
    notes: "State the safety boundary explicitly and clearly: this talk does not cover motor or propellant manufacture.",
  },
  {
    id: "avionics",
    kicker: "09",
    title: "Avionics, Sensors & Flight Computer",
    bullets: [
      "Flight computer + IMU + barometer + power + telemetry",
      "Deployment logic needs a backup timer — never a single point of failure",
      "Onboard logging complements telemetry, it doesn't replace it",
    ],
    notes: "Reinforce the redundancy principle — it recurs in the Failure Lab and FMEA slides too.",
  },
  {
    id: "recovery",
    kicker: "10",
    title: "Recovery & Mission Safety",
    bullets: [
      "Parachute/streamer sized to the recovered mass and target descent rate",
      "Shock cord and harness must survive deployment shock",
      "Ground-test the full separation and deployment before first flight",
    ],
    notes: "Tie back to the Failure Lab: most recovery failures trace to packing procedure or undersized hardware, not exotic causes.",
  },
  {
    id: "workflow",
    kicker: "11",
    title: "From Mission Requirement to Launch",
    bullets: [
      "Mission → Requirements → Concept → Mass Budget → Aerodynamics → Propulsion",
      "→ Stability → Structures → Avionics → Recovery → Simulation → Design Review",
      "→ Build → Integration → Ground Testing → Launch Readiness → Flight → Recovery → Analysis",
    ],
    notes: "This is a systems-engineering workflow, not a step-by-step build recipe — say this explicitly.",
  },
  {
    id: "simulation",
    kicker: "12",
    title: "Simulation, Testing & Verification",
    bullets: [
      "OpenRocket first: geometry, mass, motor, CG/CP, predicted trajectory",
      "CAD, Python analysis, electronics — learn first, use advanced tools when complexity requires it",
      "Verification checks the build; validation checks it meets the mission need",
    ],
    notes: "If time allows, show a live OpenRocket simulation rather than describing it.",
  },
  {
    id: "failure-fmea",
    kicker: "13",
    title: "Failure Lab + FMEA",
    bullets: [
      "A successful aerospace engineer studies failure before flight",
      "FMEA: Failure Mode → Effect → Cause → Detection → Mitigation",
      "Think about failure before failure happens",
    ],
    notes: "Pick 2-3 concrete failure modes from the webpage's Failure Lab to discuss live rather than reading the whole list.",
  },
  {
    id: "competitions",
    kicker: "14",
    title: "Model Rocketry vs CanSat + Competitions",
    bullets: [
      "Model Rocketry competitions focus on the launch vehicle",
      "CanSat competitions focus on a miniature satellite/payload mission",
      "Both teach requirements, integration, testing, and mission operations",
    ],
    notes: "Point to the Competitions Explorer on the webpage for current dates and official links — don't quote specific dates from memory here.",
  },
  {
    id: "careers-enterprise",
    kicker: "15",
    title: "Careers, Research, Startups & Enterprise",
    bullets: [
      "Every subsystem maps to a real aerospace career",
      "Learn → Build → Validate → Research → Develop IP → Pilot → Product/Service → Startup",
      "Aerospace commercialisation needs validation, safety and genuine customer need",
    ],
    notes: "Useful moment to mention the internship/research pathway if this is a recruiting-adjacent talk.",
  },
  {
    id: "roadmap",
    kicker: "16",
    title: "Your Learning Roadmap",
    bullets: [
      "Understand → Simulate → Design → Instrument → Verify → Fly & Analyse → Research → Career/Venture",
      "Start building mission-ready thinking today",
      "Explore the full interactive guide at aerospace.ev.engineer/space/model-rocketry",
    ],
    notes: "Close by pointing the audience back to the webpage — Presentation Mode is a summary, the webpage is where they go deeper.",
  },
];
