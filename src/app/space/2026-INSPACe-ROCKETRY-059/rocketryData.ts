// Content for the Model Rocketry learning-guide page. Kept data-driven and
// separate from the rendering component so copy changes don't require
// touching markup.
//
// Source of truth: this page is an independent educational companion built
// from the publicly described IN-SPACe Model Rocketry workshop brochure
// (public/workbook/inspace-model-rocketry-workshop-brochure.pdf) and this
// site's own seven-day learning workbook
// (public/workbook/model-rocketry-7-day-learning-workbook-2026.pdf). It does
// not claim official status, endorsement or certification, and it never
// substitutes for the official rulebook, range instructions or manufacturer
// datasheets — see the Safety and Quality Gate and Source sections below.
//
// Safety boundary: no propellant formulations, igniter/motor-manufacturing
// instructions, or specific numeric flight/regulatory limits are stated here.
// Anywhere a real limit matters, the copy points the reader to the official
// rulebook, range authority or manufacturer datasheet instead of inventing a
// number.

export interface DayPlan {
  date: string;
  dayLabel: string;
  title: string;
  codes: string[];
  goal: string;
  topics: string[];
  understand: string[];
  activity: string;
}

export const days: DayPlan[] = [
  {
    date: "24 August 2026",
    dayLabel: "Day 0 · Orientation",
    title: "Mission briefing",
    codes: ["Inaugural Keynote"],
    goal: "Understand why a workshop exists before any hardware is built, and where India's rocket-development story fits into that.",
    topics: [
      "Inaugural keynote: \"Journey of Indian Rockets Development\"",
      "Team roles, safety expectations and one authoritative source of truth for requirements",
    ],
    understand: [
      "Rocket programmes progress through proven steps rather than single leaps.",
      "Every team needs one shared, authoritative document for requirements and configuration — not several conflicting ones.",
    ],
    activity:
      "Write the mission objective in one sentence, and list three things that must work correctly for a safe mission.",
  },
  {
    date: "25 August 2026",
    dayLabel: "Day 1",
    title: "Flight foundations",
    codes: ["L1", "L2", "L3", "L4", "L5", "P1"],
    goal: "Build the shared vocabulary — forces, rocket anatomy, aerodynamics, structure and avionics basics — that every later day depends on.",
    topics: [
      "L1: Introduction to Model Rocketry — forces, rocket types, anatomy",
      "L2: Aerodynamics & structural analysis (RASAero, FEAST)",
      "L3-L4: Avionics system basics and validation",
      "L5: Rockets for the middle/upper atmosphere and rocket aerodynamics",
      "P1: First design-and-fly practical loop",
    ],
    understand: [
      "The four forces on a rocket, and which two dominate most of the flight.",
      "That stability (CG ahead of CP) and structural strength are two separate checks.",
      "The four building blocks of a simple avionics system: sensors, computer, power, outputs.",
    ],
    activity:
      "Sketch your rocket and label every subsystem: nose cone, payload section, airframe, avionics bay, recovery compartment, fins and motor mount.",
  },
  {
    date: "26 August 2026",
    dayLabel: "Day 2",
    title: "Mission architecture",
    codes: ["L6", "L7", "L8", "P2", "P3"],
    goal: "Connect the mission's event sequence, sensors and launch-rail interface into one coherent architecture.",
    topics: [
      "L6: Separation systems and deployment mechanisms",
      "L7: Mission design and sensor systems for model rockets",
      "L8: Design of launch rails",
      "P2-P3: Iterate the design-and-fly practical",
    ],
    understand: [
      "Every separation event needs a trigger, a restraint, an energy source and a clear path.",
      "Sensor choice should follow from the question you need answered, not the other way round.",
      "Usable rail length and total rail length are not the same number.",
    ],
    activity:
      "Draw your rocket's separation and deployment event sequence, and list which sensor would tell you each event has happened.",
  },
  {
    date: "27 August 2026",
    dayLabel: "Day 3",
    title: "Recovery and validation",
    codes: ["L9", "L10", "L11", "L12", "P4", "P5"],
    goal: "Size the recovery system, understand power budgeting, and see how a motor's real performance is validated on a static stand.",
    topics: [
      "L9: Types of separation systems and mechanisms",
      "L10: Power systems for model rocketry",
      "L11: Descent control and recovery systems (parachutes, streamers, winglets)",
      "L12: Validation of motors on a static stand",
      "P4-P5: Launch preparation and rocketry simulation practicals",
    ],
    understand: [
      "Recovery devices are sized from verified descent mass, not liftoff mass.",
      "Power systems must be sized for peak load, not average load.",
      "A static motor test proves what a motor actually does — not just what its datasheet claims.",
    ],
    activity:
      "List the descent phases your recovery system will pass through and note one ground test you would run for each.",
  },
  {
    date: "28 August 2026",
    dayLabel: "Day 4",
    title: "Propulsion and communication",
    codes: ["L13", "L14", "L15", "L16", "P6", "P7"],
    goal: "Understand solid motors conceptually, inertial sensing, motor quality assurance and RF communication — without touching propellant or manufacturing.",
    topics: [
      "L13: Rocket motors and propulsion systems (solid)",
      "L14: Development of inertial systems",
      "L15: Manufacturing and quality assurance of rocket motors",
      "L16: RF and communication systems for model rockets",
      "P6-P7: Preparation and integration practicals",
    ],
    understand: [
      "Only certified commercial motors and manufacturer datasheets are used — never estimated propellant data.",
      "Bias, noise and drift affect every raw inertial-sensor reading.",
      "A rocket's safety-critical behaviour should never depend on the telemetry link staying connected.",
    ],
    activity:
      "Write a motor decision record using only a manufacturer datasheet: total impulse, burn time and motor mass — no estimated values.",
  },
  {
    date: "29 August 2026",
    dayLabel: "Day 5",
    title: "Integrate and qualify",
    codes: ["L17", "L18", "P8", "P9"],
    goal: "Run a full launch checkout, see how professional simulation tools are used responsibly, and self-check understanding before flight week.",
    topics: [
      "L17: Checkout system for a launch mission",
      "L18: Mechanical configuration, assembly, integration and testing",
      "P8: ANSYS demonstration — mission analysis and trajectory simulation",
      "Quiz and P9: final design-and-fly practical",
    ],
    understand: [
      "A failed checkout item stops the whole sequence — it is never noted and skipped past.",
      "The vehicle that flies must match the configuration drawing that was actually tested.",
      "An impressive simulation plot is not evidence by itself — checked inputs and test correlation are.",
    ],
    activity:
      "Complete a launch-readiness checklist for your design, and note two quiz questions you got wrong as study actions.",
  },
  {
    date: "30 August 2026",
    dayLabel: "Day 6",
    title: "Fly, recover and learn",
    codes: ["Competition", "Presentation & Flight", "Post-Launch Analysis"],
    goal: "Present the mission, fly under the official range process, and turn predicted-versus-observed differences into concrete improvement actions.",
    topics: [
      "Team presentation and authorised flight",
      "Recovery and vehicle safing under range authority",
      "Post-launch analysis: predicted vs. observed performance",
      "Valedictory session",
    ],
    understand: [
      "The official range process and range officials always take precedence over a team's own plan.",
      "Raw telemetry and photographs are preserved unedited before any analysis begins.",
      "A flight is a test — the post-flight comparison is where the learning actually happens.",
    ],
    activity:
      "Fill in one row of a predicted-vs-observed table and write one corrective action for the biggest difference.",
  },
];

export type CalloutType =
  | "beginner"
  | "why"
  | "remember"
  | "safety"
  | "verify";

export interface TutorialModule {
  id: string;
  code: string;
  title: string;
  whatIsIt: string;
  whyMatters: string;
  keyIdeas: string[];
  example?: string;
  safety?: string;
  verify?: string;
  remember: string;
  check: string;
  workshopConnection: string;
}

export const tutorialModules: TutorialModule[] = [
  {
    id: "inaugural",
    code: "Inaugural · Day 0",
    title: "The journey of Indian rocket development",
    whatIsIt:
      "India's rocket development, from early sounding rockets to today's launch vehicles, grew step by step, with each generation building on lessons proven by the one before it.",
    whyMatters:
      "Seeing this pattern helps a student see their own competition rocket as one small, honest link in the same kind of design-test-improve chain — not a one-shot leap to a finished product.",
    keyIdeas: [
      "Every generation of rocket answers a specific mission need, not just \"build it bigger.\"",
      "Complexity is added only once earlier, simpler steps are proven reliable.",
      "Reliability and safety records earned on smaller vehicles justify moving on to more capable ones.",
      "Lessons from every test and flight — including failures — are documented and fed back into the next design.",
    ],
    remember: "A rocket programme is a chain of proven steps, not a single leap.",
    check:
      "Why might a team deliberately fly a smaller, simpler rocket before attempting a more ambitious one?",
    workshopConnection: "Inaugural keynote, 24 August 2026: Journey of Indian Rockets Development.",
  },
  {
    id: "l1",
    code: "L1",
    title: "Introduction to model rocketry",
    whatIsIt:
      "A model rocket is a small, purpose-built vehicle designed to fly straight up, coast, and return safely under a recovery device such as a parachute. Model rockets sit at the beginner end of a spectrum that also includes larger amateur (often high-power) and professional rockets used for research or orbital missions — the physics is shared, but scale, regulation and risk differ enormously.",
    whyMatters:
      "Every later lecture in the workshop builds on the vocabulary introduced here: the four forces, Newton's laws in plain language, and the names of the main rocket parts.",
    keyIdeas: [
      "Thrust pushes the rocket, weight pulls it down, drag resists its motion through the air.",
      "For most of the flight, thrust and weight dominate the vertical picture; aerodynamic forces mainly keep the vehicle pointed the right way.",
      "Newton's third law explains thrust: the motor accelerates exhaust gas backward, and the rocket is pushed forward by the equal, opposite reaction.",
      "Main parts: fuselage (body tube), nose cone, fins, motor, and a recovery/deployment system.",
      "Flight has distinct phases — a rocket does not fly the same way from liftoff to landing.",
    ],
    example:
      "A model rocket is not a small aeroplane. An aeroplane's wings generate the lift that holds it up in level flight. A model rocket's fins do not hold it up — its motor does. Fins mainly keep the vehicle stable and pointed the right way as it flies.",
    remember: "Thrust and weight drive the mission; fins keep the vehicle pointed straight.",
    check:
      "Which two forces dominate a model rocket's flight, and which force mainly keeps it stable rather than lifting it?",
    workshopConnection: "L1, Day 1 (25 August), 08:30–09:30.",
  },
  {
    id: "l2",
    code: "L2",
    title: "Aerodynamics, stability and structural analysis",
    whatIsIt:
      "Aerodynamics studies how air pushes and pulls on a moving object — nose shape, body diameter, surface smoothness and fin size all change a rocket's drag and stability. Structural analysis is the separate question of whether the airframe can survive flight loads without bending, cracking or coming apart.",
    whyMatters:
      "A rocket that is aerodynamically efficient but structurally weak can fail in flight; one that is strong but aerodynamically poor may tumble or fly far off course. Both must be checked together.",
    keyIdeas: [
      "Centre of Gravity (CG) is where the vehicle's mass balances; Centre of Pressure (CP) is where aerodynamic force effectively acts.",
      "The general stability idea is that CG should sit ahead of CP by a workable margin — the exact acceptable margin comes from the official rulebook or a validated analysis, never a rule of thumb.",
      "A loaded (unfired-motor) rocket and a burnout rocket have different mass and CG, so both configurations need checking.",
      "Structural load paths — axial, bending, handling and recovery-shock loads — are traced from where a force is applied to where the structure resists it.",
      "A safety factor compares a material's allowable strength to the predicted load, giving a margin against uncertainty.",
      "Tools such as RASAero and FEAST predict aerodynamic and structural behaviour before a real test — they support engineering judgement, they do not replace it.",
    ],
    verify:
      "The exact acceptable static-margin range and structural safety-factor requirements always come from the official competition rulebook or a validated analysis — never from a general rule of thumb.",
    remember:
      "Stability and strength are two separate checks — a rocket needs both, in every configuration it will actually fly in.",
    check:
      "Why does a rocket's stability need to be checked separately before motor burnout and after motor burnout?",
    workshopConnection: "L2, Day 1, 09:30–10:30.",
  },
  {
    id: "l3",
    code: "L3",
    title: "Basics of avionics systems",
    whatIsIt:
      "\"Avionics\" (aviation electronics) is the set of onboard electronic systems that sense, decide, store and communicate. On a model rocket this usually means a flight computer, sensors, electrical power, data storage, a telemetry link, and outputs that trigger events such as parachute deployment.",
    whyMatters:
      "Avionics turns a physical flight into measured, decision-driven behaviour instead of a \"hope it works\" flight.",
    keyIdeas: [
      "Sensors feed the flight computer with measurements (for example, altitude or acceleration).",
      "The flight computer runs basic flight-state logic — deciding, for instance, whether the vehicle has reached apogee.",
      "Power must reach the flight computer reliably throughout the flight, including through vibration and shock.",
      "Data storage keeps a record onboard even if the radio link is briefly lost.",
      "Deployment outputs are the signals the flight computer sends to trigger recovery events at the right moment.",
    ],
    remember: "Avionics is a chain — sensing, deciding, storing and acting — and every link has to work.",
    check: "Name the four basic building blocks of a simple avionics system described in this lecture.",
    workshopConnection: "L3, Day 1, 11:00–12:00.",
  },
  {
    id: "l4",
    code: "L4",
    title: "Validation of avionics systems",
    whatIsIt:
      "Validation is the structured process of proving an avionics system works before it flies: from checking individual components, to bench testing, to sensor calibration, to subsystem testing, to full integrated testing, and finally to an end-to-end mission rehearsal.",
    whyMatters:
      "A successful code build only proves the software compiled — it does not prove the integrated hardware-and-software system behaves safely under real flight conditions.",
    keyIdeas: [
      "Each test stage needs a defined expected input and output, and a clear pass/fail criterion.",
      "Calibration compares a sensor's output against a known reference input.",
      "Logging every test result creates an evidence trail that can be checked later.",
      "Power interruption and reset behaviour must be tested deliberately, not assumed.",
      "Fault handling — what the system does when something goes wrong — is tested, not just the \"everything works\" path.",
    ],
    remember:
      "A working build is not the same as a validated system — validation is proven with tests, not assumed from a successful compile.",
    check:
      "Why is \"the code compiled without errors\" not sufficient evidence that an avionics system is flight-ready?",
    workshopConnection: "L4, Day 1, 12:00–13:00.",
  },
  {
    id: "l5",
    code: "L5",
    title: "Rockets for the middle and upper atmosphere",
    whatIsIt:
      "Sounding rockets carry instruments through the middle and upper atmosphere to measure conditions such as temperature, pressure, wind or radiation at altitudes aircraft and balloons cannot reach. The lecture introduces this context alongside a broader look at rocket aerodynamics.",
    whyMatters:
      "Seeing how a real research mission's payload, target altitude, telemetry needs and recovery requirements shape its design helps a student understand systems engineering — every subsystem decision traces back to a mission need.",
    keyIdeas: [
      "Sounding rockets are chosen because they can reach altitudes cheaper and faster than satellites for many short-duration measurements.",
      "A mission's target altitude, instrument requirements and recovery plan are decided together, not separately.",
      "Telemetry and recovery requirements both depend on how important it is to get the payload's data, or the payload itself, back.",
    ],
    example:
      "A student's competition rocket for this workshop does not have the altitude or payload capability of a sounding rocket — the value of this lecture is the systems-engineering pattern, not a size comparison.",
    remember: "The mission need always comes first; the vehicle design follows from it.",
    check: "What three mission needs typically shape the design of a sounding rocket?",
    workshopConnection: "L5, Day 1, 14:00–15:00.",
  },
  {
    id: "practical-loop",
    code: "P1, P2–P3, P4–P5, P6–P7, P9",
    title: "Design and fly your own rocket: the practical loop",
    whatIsIt:
      "Across the week, students repeatedly sketch, refine and reason about their own rocket design in a guided hands-on practical block that runs on most afternoons.",
    whyMatters:
      "Repeating the same design-and-fly loop as new lectures are learned lets a student see how each new topic — separation, sensors, launch rails, power, motors, simulation, checkout — changes their design decisions in practice.",
    keyIdeas: [
      "Start by identifying the mission objective and sketching a simple rocket with every subsystem labelled.",
      "List the assumptions behind the sketch explicitly, so they can be checked or corrected later.",
      "After each new lecture, return to the sketch and update it, noting what changed and why.",
      "Predict what could affect stability or recovery before those effects are actually tested.",
      "Record what was learned after each practical session — a design decision without a reason is hard to defend later.",
    ],
    remember: "A design that is never revisited is a design that never improves.",
    check:
      "Why does the workshop return to the same rocket sketch across several practical sessions instead of doing one design activity?",
    workshopConnection:
      "P1 (Day 1), P2–P3 (Day 2), P4–P5 (Day 3), P6–P7 (Day 4), P9 (Day 5) — Design and Fly Your Own Rocket.",
  },
  {
    id: "l6",
    code: "L6",
    title: "Separation systems and deployment mechanisms",
    whatIsIt:
      "Separation systems are the mechanisms that deliberately split a rocket into sections, or release a recovery device, at a planned point in the flight — most commonly to release a parachute near apogee.",
    whyMatters:
      "An unplanned or failed separation is one of the most common causes of recovery failure, so this system deserves careful, deliberate design.",
    keyIdeas: [
      "Every separation event needs a clear trigger, a mechanical restraint holding sections together until that trigger, an energy source that does the separating, and a clear path for the released section to move.",
      "Single-point failures — one part whose failure alone causes the whole event to fail — should be identified and, where practical, reduced with redundancy.",
      "Ground testing a separation system before flight is the only reliable way to know it works.",
    ],
    remember:
      "A separation event needs a trigger, a restraint, an energy source and a clear path — and it must be ground-tested before it is trusted in flight.",
    check: "What four elements does a reliable separation event need?",
    workshopConnection: "L6, Day 2 (26 August), 08:30–09:30.",
  },
  {
    id: "l7",
    code: "L7",
    title: "Mission design and sensor systems",
    whatIsIt:
      "Mission design starts from the mission objective and Concept of Operations (ConOps) — what the rocket will do, in what sequence — and works backward to decide what needs to be measured and which sensors can measure it.",
    whyMatters:
      "Choosing sensors before defining what question they need to answer is a common beginner mistake; it usually produces data nobody actually needs.",
    keyIdeas: [
      "Barometric pressure sensors estimate altitude from air-pressure changes.",
      "Accelerometers measure acceleration; gyroscopes measure rotation rate — together they form the core of an Inertial Measurement Unit (IMU).",
      "GNSS/NavIC (India's regional satellite navigation system) can provide position at a beginner level, with its own accuracy and update-rate limits.",
      "Temperature and voltage sensing protect the electronics and confirm the power system is healthy.",
      "Every sensor reading needs a sampling rate, a timestamp, a calibration and a defined unit to be useful.",
      "Sensing a value is not the same as making a flight decision from it — that step needs defined logic and a tested threshold.",
    ],
    remember: "Decide what question you need answered before choosing which sensor answers it.",
    check: "Name one sensor that could help answer \"how high did the rocket go?\" and explain what it actually measures.",
    workshopConnection: "L7, Day 2, 09:30–10:30.",
  },
  {
    id: "l8",
    code: "L8",
    title: "Design of launch rails",
    whatIsIt:
      "A launch rail is the mechanical guide that constrains a rocket's direction for the first part of its flight, before the fins can generate enough aerodynamic force to keep it stable on their own.",
    whyMatters:
      "Without a rail, a slow-moving rocket in the first instants after ignition could tip and fly in an unsafe or unpredictable direction.",
    keyIdeas: [
      "Launch guides or rail buttons on the rocket slide along the rail, so their alignment and clearance must match precisely.",
      "\"Usable rail length\" is the travel available to the vehicle, not the rail's total physical length — these are not the same number.",
      "The rocket must leave the rail moving fast enough for its fins to take over stabilising duty; checking this needs verified mass and motor thrust data, not a guess.",
      "Pad angle, wind, and range-safety rules all influence a safe launch direction.",
    ],
    verify:
      "There is no single universal minimum rail-exit velocity or rail length — these depend on the specific vehicle, motor and environment, and must be checked against official requirements and verified data.",
    remember: "Usable rail length and total rail length are not the same thing — check which one you are working with.",
    check: "Why can't a \"minimum rail-exit speed\" be quoted as one fixed number for every rocket?",
    workshopConnection: "L8, Day 2, 11:00–12:00.",
  },
  {
    id: "l9",
    code: "L9",
    title: "Types of separation systems and mechanisms",
    whatIsIt:
      "This lecture extends L6 by looking at the different mechanical approaches used to achieve separation and the practical differences between them.",
    whyMatters:
      "Choosing an appropriate separation approach for a given vehicle interface — rather than defaulting to whatever was used last time — reduces the chance of an interface-specific failure.",
    keyIdeas: [
      "Every separation event still needs precise timing, so it happens neither too early nor too late.",
      "Mechanical interfaces must be positively engaged before flight and reliably release on command.",
      "Design should actively prevent accidental separation from vibration, handling or aerodynamic loads.",
      "Clearance — the physical space the separating section needs to move freely — must be checked, not assumed.",
      "Verification always comes from a safe, controlled ground test, never from a first attempt in flight.",
    ],
    remember: "The right separation mechanism depends on the interface it is separating — there is no one-size-fits-all answer.",
    check: "What is the difference between what L6 and L9 each cover?",
    workshopConnection: "L9, Day 3 (27 August), 08:30–09:30.",
  },
  {
    id: "l10",
    code: "L10",
    title: "Power systems for model rocketry",
    whatIsIt:
      "The power system supplies electrical energy to every avionics component — the flight computer, sensors and any radio — from a battery source, through wiring and connectors, sometimes via voltage regulators.",
    whyMatters:
      "An avionics system that is perfectly designed but loses power at the wrong moment cannot do its job — power reliability is a safety property, not just a convenience.",
    keyIdeas: [
      "Electrical power equals voltage multiplied by current (P = V × I, with P in watts, V in volts and I in amps) — this sets how much energy a component draws.",
      "Average load and peak load are different — a system must be sized for its peak demand, not just its typical demand.",
      "An energy and runtime budget checks whether the battery can supply the mission for as long as it needs to.",
      "Sensitive electronics should be isolated, where practical, from the higher-current loads of deployment devices to avoid interference or brownouts.",
      "Brownouts (a temporary voltage dip) and unwanted resets are real risks that need to be tested for, not assumed away.",
      "Batteries and wiring need secure mounting and visual inspection before every flight.",
    ],
    remember: "Size the power system for its peak demand, not its average demand.",
    check: "What is the difference between average load and peak load, and why does it matter for battery sizing?",
    workshopConnection: "L10, Day 3, 09:30–10:30.",
  },
  {
    id: "l11",
    code: "L11",
    title: "Descent control and recovery systems",
    whatIsIt:
      "Recovery systems bring the rocket, or its separated sections, back to the ground under control instead of free-falling. Common approaches include parachutes (main, and sometimes a smaller drogue for an initial descent), streamers and other descent-control devices.",
    whyMatters:
      "An uncontrolled descent risks damaging the vehicle, losing data or creating a safety hazard on the ground — recovery is treated with the same seriousness as any other flight-critical system.",
    keyIdeas: [
      "A drogue parachute, where used, provides a faster, more stable initial descent; a main parachute slows the final descent to landing.",
      "Streamers and winglet-style descent-control devices are alternative approaches described in the brochure — whether any specific device suits a given rocket depends on that rocket's own verified design.",
      "Descent mass and the recovery device's drag area together determine how fast the vehicle comes down.",
      "Harness and attachment points must be checked for the shock loads recovery events apply.",
      "Packing method and entanglement checks are verified on the ground before flight.",
      "Wind drift during descent affects where the vehicle lands, which matters for the recovery area and range safety.",
    ],
    verify:
      "No single \"correct\" descent rate is stated here — the official competition or range requirement must always be checked, and the actual descent rate verified against it.",
    remember: "Recovery is not automatic — it is sized, packed and ground-tested like every other system.",
    check: "Why might a rocket use both a drogue and a main parachute instead of just one?",
    workshopConnection: "L11, Day 3, 11:00–12:00.",
  },
  {
    id: "l12",
    code: "L12",
    title: "Validation of motors on a static stand",
    whatIsIt:
      "A static motor test fires a motor while it is securely mounted to an instrumented test stand rather than attached to a flying rocket, so its performance can be measured directly and safely.",
    whyMatters:
      "Static testing lets engineers confirm a motor's real behaviour against its manufacturer's documented data before that motor is trusted on a flight vehicle.",
    keyIdeas: [
      "A thrust-time curve records how much force the motor produces at every moment of its burn.",
      "Peak thrust is the highest instantaneous force recorded; average thrust is the burn's overall force averaged over its duration.",
      "Burn time is how long the motor produces thrust; total impulse is the thrust integrated over the whole burn — a measure of the motor's total \"push.\"",
      "Calibrated measurement equipment, remote operation and controlled access around the test stand are what make a static test safe and its results trustworthy.",
      "Test conditions and the motor's manufacturer documentation are both recorded so results can be compared meaningfully.",
    ],
    safety:
      "This page describes only what a static test measures and why it is done safely. It provides no instructions for building a motor, an igniter, or a test stand — motor testing is performed only with certified commercial motors, at authorised facilities, by competent, supervised personnel.",
    remember:
      "A static test proves what a motor actually does — not what its datasheet claims — and it is only ever done under authorised, controlled conditions.",
    check: "What is the difference between peak thrust and average thrust, and why would an engineer want to know both?",
    workshopConnection: "L12, Day 3, 12:00–13:00.",
  },
  {
    id: "p5-simulation",
    code: "P5",
    title: "Rocketry simulation",
    whatIsIt:
      "Rocketry simulation software predicts how a rocket will fly before it is actually launched, using inputs such as geometry, mass, CG, the motor's thrust curve, drag, atmosphere and the planned recovery configuration.",
    whyMatters:
      "Simulating a design first lets a team catch stability or performance problems on a computer, where a mistake costs nothing, instead of in the air.",
    keyIdeas: [
      "Typical outputs include predicted velocity, acceleration, altitude, stability margin and descent behaviour.",
      "A single \"nominal\" run is not enough — engineers also run worst-case and sensitivity cases to see how the prediction changes if an input is uncertain.",
      "Every simulation has limitations: it is only as accurate as its inputs and the physics it models.",
      "The model file, its exact input values, and its output plots should all be saved and version-labelled, so a result can be reproduced or checked later.",
    ],
    remember: "A simulation result is only trustworthy if its inputs, version and assumptions are recorded alongside it.",
    check: "Why does an engineering team run a \"worst-case\" simulation in addition to the expected, nominal one?",
    workshopConnection: "P5, Day 3, 15:00–18:00.",
  },
  {
    id: "launch-prep",
    code: "P4, P6–P7",
    title: "Launch preparation practicals",
    whatIsIt:
      "These hands-on sessions walk through the practical steps of getting a rocket ready to fly: selecting an authorised launch site, checking weather conditions, assembling the rocket, packing recovery devices, and reviewing subsystem interfaces before integration.",
    whyMatters:
      "Launch preparation is where design decisions meet physical reality — a well-designed rocket can still fail if it is prepared carelessly.",
    keyIdeas: [
      "Site selection and weather review happen before any hardware is armed.",
      "Assembly follows a defined order and is checked against controlled drawings, not memory.",
      "Recovery devices are packed to a repeatable, tested procedure.",
      "Any late change to hardware or configuration must be re-checked, not assumed to still be fine.",
    ],
    remember: "Preparation follows a checklist, not a memory.",
    check: "Why should assembly be checked against a drawing rather than \"how we did it last time\"?",
    workshopConnection: "P4 (Day 3), P6–P7 (Day 4) — Preparing for Launch / integration practicals.",
  },
  {
    id: "l13",
    code: "L13",
    title: "Solid rocket motors and propulsion systems",
    whatIsIt:
      "A solid rocket motor stores chemical energy in a solid propellant inside a casing. When ignited, the propellant burns in a combustion chamber, producing hot, high-pressure gas that accelerates out through a nozzle — the accelerating exhaust creates a reaction force (thrust) that pushes the rocket forward.",
    whyMatters:
      "Understanding the motor conceptually — without needing to build one — lets a student make sensible, safe decisions about motor selection and its effect on the whole vehicle.",
    keyIdeas: [
      "The motor casing contains the propellant and combustion chamber and must withstand the pressure of burning.",
      "The nozzle shapes and accelerates the exhaust gas; its design affects how efficiently chemical energy becomes thrust.",
      "A thrust curve, burn time and total impulse describe a motor's performance over its whole burn (see L12 for how these are measured).",
      "Motors are grouped into classes at a high level based on total impulse — always sourced from certified, published data, never estimated.",
      "Motor retention — how the motor is mechanically held in the vehicle — is a structural interface, and motor mass materially shifts the vehicle's CG and performance.",
    ],
    safety:
      "Only certified commercial motors and their manufacturer documentation are used. This page does not describe propellant formulation or motor manufacturing.",
    remember: "Use certified commercial motors and their manufacturer datasheets — never estimated or informal propellant/performance data.",
    check: "How does the mass of the motor itself affect where the rocket's centre of gravity sits?",
    workshopConnection: "L13, Day 4 (28 August), 08:30–09:30.",
  },
  {
    id: "l14",
    code: "L14",
    title: "Inertial systems",
    whatIsIt:
      "Inertial systems measure motion directly, without needing an external reference like GPS satellites. The two core measurements are acceleration (from an accelerometer) and rotation rate (from a gyroscope); together they typically form an Inertial Measurement Unit (IMU).",
    whyMatters:
      "Inertial data can help estimate what the vehicle is doing — such as detecting burnout or apogee — even during moments when radio or GNSS signals are weak or unavailable.",
    keyIdeas: [
      "A reference frame is the fixed set of directions (e.g., up/down, forward/back) a measurement is described relative to.",
      "Bias is a small, steady offset error; noise is random fluctuation; drift is how an error grows over time — all three affect how trustworthy a raw sensor reading is.",
      "Sensor fusion means combining several imperfect measurements (e.g., accelerometer plus gyroscope) to get a better combined estimate — treated here conceptually, without advanced mathematics.",
      "How and where a sensor is mounted, and how carefully it is calibrated, directly affects the quality of its data.",
    ],
    remember:
      "Every raw sensor reading has some bias, noise or drift — trustworthy data comes from understanding and managing those errors, not ignoring them.",
    check: "What is the difference between what an accelerometer measures and what a gyroscope measures?",
    workshopConnection: "L14, Day 4, 09:30–10:30.",
  },
  {
    id: "l15",
    code: "L15",
    title: "Manufacturing and quality assurance of rocket motors",
    whatIsIt:
      "Quality assurance for rocket motors is the set of checks and records that confirm a motor meets its specification before it is trusted for use — this lecture covers the quality concepts, not manufacturing steps.",
    whyMatters:
      "A motor with an unverified or unrecorded history is a safety risk, however good its published specification looks.",
    keyIdeas: [
      "Motors are sourced only from an approved supplier as a certified component.",
      "Traceability means being able to identify a motor's lot or batch, connecting it back to its manufacturing and test records.",
      "Visual inspection and dimensional/interface checks confirm a motor physically matches its specification before use.",
      "Storage and handling instructions from the manufacturer must be followed to keep a motor within its certified condition.",
      "Any deviation from specification is recorded as a non-conformance, and unresolved non-conformances are reviewed independently, not waved through by one person.",
    ],
    remember: "Traceability and independent review, not appearance alone, are what make a motor trustworthy.",
    check: "What does \"traceability\" mean for a rocket motor, and why does it matter?",
    workshopConnection: "L15, Day 4, 11:00–12:00.",
  },
  {
    id: "l16",
    code: "L16",
    title: "RF and communication systems",
    whatIsIt:
      "This covers how a rocket sends measured flight data (telemetry) from an onboard transmitter through the air to a ground receiver, so a team can monitor the flight in real time and keep a record for later analysis.",
    whyMatters:
      "Telemetry gives situational awareness during the flight and creates the evidence record used for post-flight analysis — but the vehicle's safety should never depend on the radio link alone.",
    keyIdeas: [
      "Antenna choice and placement affect how well a signal actually radiates and is received.",
      "Radio-frequency use is subject to regulatory permission — no frequency should be assumed to be automatically allowed.",
      "Data packets typically carry a timestamp, a sequence number, units for each value, and some form of integrity check so corrupted data can be detected.",
      "Range and orientation testing on the ground, and understanding line-of-sight limits, show what performance to expect in the field.",
      "Link loss (losing the radio connection) must have a defined, safe vehicle behaviour — the flight should not depend on the link staying up.",
      "Raw data is logged exactly as received, before any dashboard processing changes or interprets it.",
    ],
    verify:
      "No radio frequency is presented here as automatically permitted — always confirm current Indian regulatory and event-specific permissions before transmitting.",
    remember: "Telemetry is for situational awareness and evidence — never the only path to a safe vehicle.",
    check: "Why should a rocket's safety-critical behaviour not depend on its telemetry link staying connected?",
    workshopConnection: "L16, Day 4, 12:00–13:00.",
  },
  {
    id: "l17",
    code: "L17",
    title: "Checkout system for a launch mission",
    whatIsIt:
      "A launch checkout is a structured, ordered sequence of checks performed before a rocket is cleared to fly: configuration identity, mechanical inspection, recovery check, avionics power, sensor health, storage, telemetry, safe/arm confirmation, weather/site review, and a final go/no-go decision.",
    whyMatters:
      "A checklist, followed in order and signed off by more than one person, catches problems a rushed, memory-based check would miss.",
    keyIdeas: [
      "Checklist discipline means following the written sequence exactly, not skipping ahead or reordering from memory.",
      "Critical items get two-person, independent verification, not a single person's word.",
      "Every check records who did it, when, and what the result was — this creates the evidence trail behind a go/no-go decision.",
      "If a check fails, the sequence stops there — later checks are not \"worth doing anyway.\"",
      "Any hardware or configuration change after a check must trigger repeating the checks it could have affected.",
    ],
    remember: "The checklist controls the process — never the other way around.",
    check: "Why does a failed check stop the whole checkout sequence instead of just being noted and continuing?",
    workshopConnection: "L17, Day 5 (29 August), 08:30–09:30.",
  },
  {
    id: "l18",
    code: "L18",
    title: "Mechanical configuration, assembly, integration and testing",
    whatIsIt:
      "This lecture covers how a rocket's physical configuration is controlled and verified end to end: the configuration drawing, how parts interface and fit, the order of assembly, fastener and cable-routing choices, mass distribution, tolerances, the Bill of Materials (BOM), inspection, and subsystem/integrated testing.",
    whyMatters:
      "A rocket is only as reliable as its weakest documented — or undocumented — interface. Mechanical integration discipline is what turns a pile of parts into a trustworthy vehicle.",
    keyIdeas: [
      "A configuration drawing is the authoritative description of how the vehicle should be built — the physical vehicle should always match it.",
      "Assembly order and accessibility are planned in advance, not discovered mid-build.",
      "Cable routing and fastener choices must avoid interfering with other subsystems, including recovery deployment paths.",
      "A Bill of Materials (BOM) lists every part, so nothing is assembled from memory.",
      "\"Configuration freeze\" means stopping changes at an agreed point, so testing evidence still applies to the version that will actually fly; any needed change afterward goes through change control.",
    ],
    remember: "The vehicle that flies must match the configuration drawing that was tested — not a quietly modified version of it.",
    check: "What is a \"configuration freeze,\" and why does a late, unrecorded change undermine it?",
    workshopConnection: "L18, Day 5, 09:30–10:30.",
  },
  {
    id: "p8-ansys",
    code: "P8",
    title: "ANSYS mission analysis and trajectory simulation",
    whatIsIt:
      "ANSYS is a professional engineering analysis environment used here to demonstrate structural analysis (does the vehicle survive its loads?) and trajectory/mission analysis (how will it fly?) at a beginner-observer level — this is not a software tutorial.",
    whyMatters:
      "Seeing how inputs, assumptions and boundary conditions shape a professional simulation's outputs helps a student judge simulation results critically instead of accepting them at face value.",
    keyIdeas: [
      "Every analysis needs defined inputs, assumptions and boundary conditions before it produces any output.",
      "A colourful, detailed-looking result plot is not, by itself, proof that the underlying model or inputs were correct.",
      "Mesh quality, for structural analysis, and other input checks are part of judging whether a result can be trusted.",
      "Reasonableness checks — does this output make physical sense? — and correlation against real test data are what actually build confidence in a simulation result.",
    ],
    remember: "An impressive-looking plot is not evidence — checked inputs and test correlation are.",
    check: "Why can't a simulation result be trusted just because its output plot looks detailed and professional?",
    workshopConnection: "P8, Day 5, 11:00–13:00 — ANSYS team demonstration.",
  },
  {
    id: "ignition",
    code: "Supporting topic",
    title: "Ignition systems",
    whatIsIt:
      "An ignition system is what starts a motor's burn on command, at the intended moment, under controlled conditions.",
    whyMatters:
      "Because ignition involves energetic devices, this is one of the most safety-critical interfaces in the whole vehicle, and it is treated with correspondingly strict controls.",
    keyIdeas: [
      "Ignition is only ever performed with certified commercial igniters, used exactly per the motor manufacturer's instructions.",
      "A safe/arm separation keeps the ignition circuit disconnected from its power source until the last authorised moment before launch.",
      "Continuity checking — confirming the ignition circuit is electrically complete — is performed without energising the circuit, so the check itself cannot cause an accidental ignition.",
      "Controlled access around the pad, and authorised range supervision, govern every step from arming to firing.",
    ],
    safety:
      "This page explains only the general safety principles behind ignition. It provides no igniter-construction instructions, no propellant or pyrotechnic-device instructions, and no procedure that could bypass authorised range control — ignition is performed only by certified equipment, competent supervision, and applicable legal and range approvals.",
    remember: "Arming, continuity-checking and firing are three separate, deliberate steps — never combined or rushed.",
    check: "Why is continuity checked without energising the ignition circuit?",
    workshopConnection:
      "Threaded through L1, L12 and L13, and through the Safety and Quality Gate section of this page.",
  },
  {
    id: "project-management",
    code: "Supporting topic",
    title: "Technical project management",
    whatIsIt:
      "Technical project management is the discipline of organising a team's work so that a complex engineering effort — like building and flying a rocket — actually converges on a safe, working result on time.",
    whyMatters:
      "Even a technically excellent design can fail as a project if roles are unclear, risks are not tracked, or changes are not controlled.",
    keyIdeas: [
      "Team roles clarify who owns which subsystem and who makes which decisions.",
      "A work breakdown structure splits the project into manageable pieces; dependencies show which pieces must finish before others can start.",
      "A schedule turns the work breakdown into a timeline the team can actually track progress against.",
      "A risk register lists what could go wrong, how likely and severe each risk is, and what is being done about it.",
      "Action tracking, design reviews and configuration management keep decisions, changes and their justification recorded rather than lost in conversation.",
      "Evidence ownership means someone is responsible for each piece of verification evidence being complete and retrievable.",
    ],
    remember: "A rocket project is managed with the same discipline as it is engineered — decisions, risks and evidence all need an owner.",
    check: "What is the difference between a risk register and an action tracker?",
    workshopConnection: "Threaded through L15 (quality), L17–L18 (checkout and integration), and Day 6 competition preparation.",
  },
  {
    id: "day6-flight",
    code: "Day 6",
    title: "Competition, flight and post-launch analysis",
    whatIsIt:
      "The final day covers preparing and delivering a technical presentation, following the official flight and range process to fly the rocket, and then comparing what was predicted against what was actually observed.",
    whyMatters:
      "A competition flight is not the end of the engineering process — the post-flight analysis is where a team turns one data point into lessons for the next design.",
    keyIdeas: [
      "A good technical presentation explains the mission objective, the system architecture and clear requirement-to-evidence traceability — not just a description of the finished hardware.",
      "Safety controls are presented honestly, including what was checked, what could not be fully verified, and why.",
      "The official flight and range process, and the authorised range officials' instructions, always take precedence over the team's own plan.",
      "After the flight, the vehicle is only approached and safed under authorised direction — never on the team's own initiative.",
      "Raw telemetry and photographs are preserved unedited, before any analysis or presentation touches them.",
      "Predicted and observed performance are compared explicitly; any difference is investigated, explained and turned into a corrective action, not dismissed.",
    ],
    remember: "The flight is the test — the post-flight comparison is where the actual learning happens.",
    check: "Why should raw telemetry be preserved before any analysis work begins on it?",
    workshopConnection:
      "Day 6 (30 August): Competition Preparation, Presentation & Flight, Post-Launch Analysis, Valedictory Session.",
  },
];

export interface WorkbookCard {
  title: string;
  fields: string[];
}

export const workbookCards: WorkbookCard[] = [
  {
    title: "Mission objective",
    fields: ["Mission objective (one sentence)", "Primary success criteria", "Key constraints", "Prepared by / date"],
  },
  {
    title: "Requirements & assumptions",
    fields: ["Requirement ID", "Requirement text (source)", "Assumption made", "Verification method planned"],
  },
  {
    title: "Rocket subsystem map",
    fields: ["Subsystem", "What it does", "Interfaces with", "Owner"],
  },
  {
    title: "Mass-budget categories",
    fields: ["Item / station", "Estimated mass", "Tolerance", "Axial station", "Configuration (loaded / burnout)"],
  },
  {
    title: "CG / CP observation record",
    fields: ["Configuration", "Measured or estimated CG", "CP method used", "Static-margin note", "Reviewer / date"],
  },
  {
    title: "Motor selection inputs",
    fields: [
      "Candidate motor",
      "Data source (manufacturer datasheet)",
      "Total impulse / burn time",
      "Thrust-to-weight check",
      "Interfaces / retention",
      "Decision & reviewer",
    ],
  },
  {
    title: "Avionics sensor plan",
    fields: ["Function / sensor", "Range / rate needed", "Calibration input", "Acceptance criterion", "Result"],
  },
  {
    title: "Power-budget categories",
    fields: ["Load / mode", "Voltage", "Average current", "Peak current", "Duration", "Energy", "Margin"],
  },
  {
    title: "Recovery-system decision record",
    fields: ["Flight state", "Descent device", "Predicted rate (pending verification)", "Test criterion", "Result / evidence"],
  },
  {
    title: "Simulation input checklist",
    fields: ["Model file / version", "Geometry source", "Mass / CG state", "Motor-curve source", "Atmosphere / wind", "Result / plot reference"],
  },
  {
    title: "Test plan & acceptance criteria",
    fields: ["Test name", "Objective", "Pass / fail criterion", "Procedure reference", "Result"],
  },
  {
    title: "Risk / hazard register",
    fields: ["Hazard / failure mode", "Cause", "Effect", "Controls", "Verification", "Owner / status"],
  },
  {
    title: "Launch-readiness checklist",
    fields: ["Gate (mechanical / recovery / avionics / comms / mission-range)", "Criterion", "Evidence", "Checker", "Status / time"],
  },
  {
    title: "Post-flight prediction vs. observation",
    fields: ["Metric / event", "Predicted", "Observed", "Difference", "Interpretation", "Action"],
  },
  {
    title: "Lessons learned / improvement actions",
    fields: ["What happened", "What worked", "What to change", "Owner", "Target date"],
  },
];

export interface GlossaryTerm {
  term: string;
  def: string;
}

export const glossary: GlossaryTerm[] = [
  { term: "Apogee", def: "The highest point of the flight trajectory." },
  { term: "Airframe / fuselage", def: "The rocket's main body tube, which carries and protects internal subsystems." },
  { term: "Avionics", def: "Onboard electronic systems that sense, decide, store and communicate during flight." },
  { term: "Burnout", def: "The moment the motor completes its powered burn." },
  { term: "CG (Centre of Gravity)", def: "The balance point of the current mass configuration." },
  { term: "CP (Centre of Pressure)", def: "The effective location of aerodynamic force on the vehicle." },
  { term: "Cd (Drag coefficient)", def: "A dimensionless value used with reference area and dynamic pressure to calculate drag." },
  { term: "ConOps", def: "Concept of Operations — the intended mission sequence and team roles." },
  { term: "DAQ", def: "Data Acquisition system, used to measure and record signals." },
  { term: "Drogue", def: "A smaller parachute or device used for an initial, faster, stabilising descent before the main parachute deploys." },
  { term: "FMEA", def: "Failure Modes and Effects Analysis — a structured review of failure modes, their effects and their controls." },
  { term: "HIL", def: "Hardware-in-the-loop testing — connecting real hardware to simulated flight conditions." },
  { term: "Impulse", def: "The integral of thrust over the motor's burn time — a measure of total \"push\" delivered." },
  { term: "IMU", def: "Inertial Measurement Unit, typically combining accelerometers and gyroscopes." },
  { term: "Nose cone", def: "The forward, shaped section of the rocket that reduces aerodynamic drag." },
  { term: "Payload", def: "The instruments, experiment or cargo the rocket is designed to carry." },
  { term: "Recovery system", def: "The parachute, streamer or other device that returns the rocket to the ground under control." },
  { term: "Static margin", def: "The distance from CG to CP, divided by the body diameter — a standard way to express stability margin." },
  { term: "Telemetry", def: "Remote measurement data transmitted from the rocket to a ground receiver." },
  { term: "Thrust", def: "The forward-pushing force produced by the motor's accelerating exhaust." },
  { term: "Validation", def: "Evidence that the system fulfils the intended mission need." },
  { term: "Verification", def: "Evidence that a specified requirement has been met." },
];

export interface QuizItem {
  q: string;
  a: string;
}

export const quiz: QuizItem[] = [
  {
    q: "Name the four main forces acting on a model rocket in flight.",
    a: "Thrust, weight, drag, and aerodynamic side force (the stabilising force produced by the fins and body as air flows past them).",
  },
  {
    q: "What are the main parts of a model rocket's anatomy?",
    a: "Nose cone, fuselage/airframe, fins, motor and motor mount, and a recovery/deployment system — plus an avionics bay and couplers on more instrumented vehicles.",
  },
  {
    q: "What is the general relationship between CG and CP needed for a stable rocket?",
    a: "The centre of gravity (CG) should sit ahead of the centre of pressure (CP) by an adequate margin — the acceptable margin itself must come from the official rulebook or a validated analysis, not a rule of thumb.",
  },
  {
    q: "What are the four basic building blocks of a simple avionics system?",
    a: "Sensors, a flight computer, power, and outputs such as storage, telemetry and deployment.",
  },
  {
    q: "What four elements does a reliable separation event need?",
    a: "A trigger, a mechanical restraint, an energy source, and a clear path for the separating section to move.",
  },
  {
    q: "Why is a drogue parachute sometimes used before the main parachute deploys?",
    a: "It gives a faster, more stable initial descent from apogee, reducing drift and stabilising the vehicle before the main chute slows the final descent.",
  },
  {
    q: "Why must a power system be sized for peak load rather than average load?",
    a: "Because the system has to reliably supply its highest simultaneous demand — for example, during a deployment event — not just its typical, lower running demand.",
  },
  {
    q: "Why should raw telemetry data always be logged before it is processed into a dashboard display?",
    a: "Processing can change or hide information; the raw log preserves the original evidence for later, trustworthy analysis.",
  },
  {
    q: "Why do engineers run more than one simulation case — not just the expected \"nominal\" one — before trusting a design?",
    a: "To understand how sensitive the prediction is to uncertain inputs, and to check worst-case behaviour, not just the best-case expectation.",
  },
  {
    q: "Why does a failed item on a launch checkout stop the whole sequence rather than being noted and continued past?",
    a: "Because later checks may depend on the failed item being resolved first, and continuing past an unresolved failure risks flying with an unverified condition.",
  },
];

export const learningOutcomes: string[] = [
  "Identify the main parts of a model rocket and what each one does.",
  "Explain the forces and flight phases involved in a model rocket's mission.",
  "Explain why mass, stability, structure, propulsion, recovery, avionics and telemetry must be designed together as one system, not in isolation.",
  "Understand what simulation and testing are for, and why a result needs to be verified before it is trusted.",
  "Follow the safety, quality and launch-readiness processes used to prepare a rocket for flight.",
  "Read and interpret flight data, and turn it into concrete improvement actions.",
  "Use a shared, beginner-friendly vocabulary to participate meaningfully in every practical session of the workshop.",
];

export const missionSequence: string[] = [
  "Mission definition",
  "Design",
  "Simulation",
  "Build",
  "Ground checks",
  "Launch",
  "Recovery",
  "Post-flight analysis",
];

export const flightPhases: string[] = [
  "Safe setup",
  "Ignition",
  "Rail exit",
  "Powered ascent",
  "Burnout",
  "Coast",
  "Apogee",
  "Drogue deployment",
  "Main deployment",
  "Landing",
  "Safing",
];

export const separationRecoverySequence: string[] = [
  "Apogee detected",
  "Deployment trigger",
  "Drogue release",
  "Stabilised descent",
  "Main deployment",
  "Landing",
  "Vehicle safing",
];

export const telemetryPath: string[] = [
  "Onboard sensors",
  "Flight computer",
  "Transmitter",
  "Antenna",
  "Air link",
  "Ground receiver",
  "Ground station log",
];

export const evidenceLoop: string[] = [
  "Prediction",
  "Observation",
  "Difference",
  "Explanation",
  "Corrective action",
  "Re-verification",
];

export const safetyPrinciples: {
  title: string;
  body: string;
}[] = [
  {
    title: "The workshop brochure and official rulebook are authoritative",
    body: "This page is an independent educational companion. Wherever this page and the official competition rulebook, range instructions or a manufacturer datasheet appear to differ, the official source always governs.",
  },
  {
    title: "No propellant, igniter or motor-manufacturing instructions",
    body: "This page explains what motors and igniters do and how they are validated and quality-checked. It provides no propellant formulations, no manufacturing steps, and no instructions for building energetic devices.",
  },
  {
    title: "Certified components and authorised facilities only",
    body: "Motors, igniters and pyrotechnic recovery devices, where used, are certified commercial products, used and tested only at authorised facilities under competent supervision.",
  },
  {
    title: "Range authority has final control",
    body: "No launch, ignition or energetic test proceeds without the range authority's go/no-go decision. Team plans and schedules are always subordinate to range and safety control.",
  },
  {
    title: "Verify every numeric limit officially",
    body: "This page deliberately avoids stating specific numeric limits — static-margin ranges, rail-exit speeds, descent rates, or permitted radio frequencies. These must always be confirmed from the official rulebook, range instructions or applicable regulations before use.",
  },
];
