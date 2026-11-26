// Programme content: the 32-week research workshop, the Physics Laboratory
// lessons, the physical proof-of-concept roadmap, engineering review gates,
// the standards registry, research themes, risks and frequently asked
// questions. Text only; nothing here claims results the engine has not run.

export const PRODUCT = {
  brand: "EV.ENGINEER™",
  name: "Next-Generation Wireless EV Charging Digital Twin",
  tagline: "Park. Drive. Charge. Automatically.",
  attribution: "Designed and developed by and for the EV.ENGINEER™ team.",
  route: "/internships/wireless-ev-charging-digital-twin",
  programme: "8-Month Advanced Engineering Research & Practical Workshop",
  descriptors: ["Physics-based", "Mathematics-driven", "IoT-enabled", "Data-driven"],
  description: "Explore, design and develop intelligent wireless electric vehicle charging systems through interactive 3D engineering, physics, mathematical modelling, IoT, artificial intelligence and experimental research.",
  question: "How can electric vehicles receive electrical energy wirelessly, safely, efficiently and intelligently, whether parked or moving?",
  closing: "Explore the Physics. Engineer the Technology. Electrify the Future.",
} as const;

export const ENVIRONMENTS = [
  { id: "station", number: "02", name: "Smart Wireless EV Charging Station", short: "Station", text: "Stationary wireless charging while the vehicle is parked: home, apartment, office, commercial and public parking, bus terminals, fleet depots and opportunity charging.", settings: ["Residential", "Apartment parking", "Office parking", "Commercial parking", "Public parking", "Electric bus terminal", "Fleet depot", "Opportunity charging"] },
  { id: "dynamic", number: "03", name: "Dynamic Wireless EV Charging", short: "Dynamic", text: "Charging while driving over an electrified road: segmented transmitter pads, moving receivers, position-dependent coupling, intelligent coil activation and the vehicle's energy balance.", settings: ["Electrified highway", "Urban street", "Bus corridor"] },
  { id: "autonomous", number: "04", name: "Autonomous Wireless EV Charging", short: "Autonomous", text: "Self-operating vehicles that find a compatible station, reserve it, park precisely over the pad, authenticate, charge and return to their mission — in simulation.", settings: ["Precision parking", "Station selection", "Fleet coordination"] },
  { id: "infrastructure", number: "05", name: "Smart Charging Infrastructure & Energy Intelligence", short: "Infrastructure", text: "A connected district: grid limits, solar PV, battery storage, parking bays, a fleet depot and an electrified road, under competing allocation policies and tariffs.", settings: ["District day", "Grid outage", "Peak tariff"] },
] as const;

export type EnvironmentId = (typeof ENVIRONMENTS)[number]["id"];

/**
 * Research environments specified but not yet simulated. Shown as planned,
 * never as working experiments (docs/wireless-ev-charging-digital-twin/SMART_PARKING_REQUIREMENTS.md).
 */
export const PLANNED_ENVIRONMENTS = [
  { id: "parking", number: "01", name: "IoT & AI-Based Smart Parking Shelter", short: "Smart Parking", text: "Vehicle identification, entry and exit, slot allocation, environmental monitoring, reservation and billing, with charging-capable bays handing over to the wireless charging station.", status: "Specified · planned for Phase 4" },
] as const;

export const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "twin", label: "Digital Twin" },
  { id: "physics", label: "Physics & Mathematics" },
  { id: "simulation", label: "Simulation Lab" },
  { id: "circuit", label: "Circuit Lab" },
  { id: "iot", label: "IoT & Data" },
  { id: "research", label: "Research Lab" },
  { id: "workshop", label: "Practical Workshop" },
  { id: "assurance", label: "Engineering Assurance" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const MODES = [
  { id: "explore", label: "Explore", text: "A cinematic view with a few meaningful controls." },
  { id: "learn", label: "Learn", text: "Guided explanations, equations and experiments." },
  { id: "engineer", label: "Engineer", text: "Every operating parameter, the circuit and the telemetry." },
  { id: "research", label: "Research", text: "Model settings, solver steps, sweeps and validation." },
] as const;

export type ModeId = (typeof MODES)[number]["id"];

export const VIEW_MODES = [
  { id: "cinematic", label: "Exterior", group: "Assembly" },
  { id: "xray", label: "X-Ray", group: "Assembly" },
  { id: "chassis", label: "Chassis", group: "Assembly" },
  { id: "underbody", label: "Underbody", group: "Assembly" },
  { id: "battery", label: "Battery", group: "Assembly" },
  { id: "receiver", label: "Receiver", group: "Assembly" },
  { id: "assembly", label: "Vehicle exploded", group: "Assembly" },
  { id: "power", label: "Power electronics", group: "Assembly" },
  { id: "cutaway", label: "Cutaway", group: "Assembly" },
  { id: "exploded", label: "Pads exploded", group: "Assembly" },
  { id: "engineering", label: "Alignment", group: "Science" },
  { id: "field", label: "Magnetic Field", group: "Science" },
  { id: "energy", label: "Energy Flow", group: "Science" },
  { id: "thermal", label: "Thermal", group: "Science" },
  { id: "iot", label: "IoT Communication", group: "Science" },
  { id: "segments", label: "Segment control", group: "Science" },
  { id: "coupling", label: "Coupling profile", group: "Science" },
  { id: "roadside", label: "Roadside camera", group: "Camera" },
  { id: "top", label: "Top-down", group: "Camera" },
] as const;

export type ViewModeId = (typeof VIEW_MODES)[number]["id"];

// ── Physics Laboratory lessons ──

export const LEARNING_SEQUENCE = ["Wonder", "Discover", "Play", "Understand", "Derive", "Calculate", "Experiment", "Validate", "Research"] as const;

export interface Lesson {
  id: string;
  domain: string;
  title: string;
  topics: string[];
  stages: Record<(typeof LEARNING_SEQUENCE)[number], string>;
  /** Equation Explorer entries this lesson uses. */
  equations: string[];
  /** Verification checks it points to. */
  checks: string[];
}

export const LESSONS: readonly Lesson[] = [
  {
    id: "electricity",
    domain: "Electricity",
    title: "Charge, current and where the power goes",
    topics: ["Electric charge", "Voltage", "Current", "Resistance", "Conductivity", "Electrical power", "Electrical energy", "Electric fields", "Capacitance", "Dielectric materials"],
    stages: {
      Wonder: "An 11 kW charger draws about 11.8 kW from the grid. Where do the other 800 watts go?",
      Discover: "Every conductor resists current; every converter switches imperfectly. Each stage of the chain turns a little power into heat.",
      Play: "Change the current and resistance in Ohm's law and watch the loss grow with the square of the current.",
      Understand: "P = V·I at every stage; losses are I²R in conductors and switching energy in semiconductors.",
      Derive: "From V = I·R and P = V·I, P = I²R: doubling current quadruples copper loss.",
      Calculate: "The loss breakdown of the station, computed stage by stage from the grid to the battery.",
      Experiment: "In the Station twin, raise the charging power and read the loss of each stage in the energy ledger.",
      Validate: "Check A05: grid power equals battery power plus every loss, to 1 part in 10⁹.",
      Research: "Which stage dominates losses at partial load, and how would you redesign it?",
    },
    equations: ["ohm", "copper-loss"],
    checks: ["A05", "B04"],
  },
  {
    id: "magnetism",
    domain: "Magnetism",
    title: "Fields, flux and ferrite",
    topics: ["Magnetic fields", "Magnetic flux", "Flux density", "Permeability", "Magnetic circuits", "Reluctance", "Saturation", "Ferrite materials", "Hysteresis"],
    stages: {
      Wonder: "Why do charging pads carry heavy ferrite tiles behind the copper?",
      Discover: "A high-permeability surface pulls field lines in, roughly doubling the field on the coil side and shielding the side behind.",
      Play: "Turn the field view on and change the air gap: watch the flux density between the pads.",
      Understand: "At a high-permeability boundary the field behaves as if a mirror-image current sat behind it.",
      Derive: "The image coefficient of a half-space of relative permeability μr is (μr − 1)/(μr + 1) → 1 for ferrite.",
      Calculate: "Inductance and coupling with and without ferrite, from the filament model.",
      Experiment: "Compare the air-core and ferrite-backed coupling coefficients reported by the coupler model.",
      Validate: "Check A10: the loop field on its axis matches the textbook formula.",
      Research: "How much ferrite can be removed before coupling and leakage become unacceptable?",
    },
    equations: ["coupling"],
    checks: ["A10", "A01"],
  },
  {
    id: "induction",
    domain: "Electromagnetic induction",
    title: "Faraday, Lenz and mutual inductance",
    topics: ["Faraday's law", "Lenz's law", "Ampère's law", "Biot–Savart law", "Self-inductance", "Mutual inductance", "Magnetic coupling", "Flux linkage", "Transformer principles"],
    stages: {
      Wonder: "How can a coil in the road push current through a coil in a moving car, with no wire between them?",
      Discover: "A changing current in one coil makes changing flux through the other; changing flux linkage induces an EMF.",
      Play: "Vary frequency and mutual inductance: the induced voltage ωMI rises with both.",
      Understand: "λ2 = L2·i2 + M·i1, and ε = −dλ/dt. A loosely coupled transformer with an air gap.",
      Derive: "dλ2/dt = L2·di2/dt + M·di1/dt + i1·dM/dt; the last term is the motional EMF of a moving receiver.",
      Calculate: "Mutual inductance from the Neumann formula, by two independent numerical methods.",
      Experiment: "In the Dynamic twin, read the motional-to-transformer EMF ratio: why the quasi-static model holds.",
      Validate: "Checks A02 and A03 compare the fast formula with a brute-force double integral.",
      Research: "Reduced-order models of M(x, y, z) for real-time segment control.",
    },
    equations: ["faraday", "coupling"],
    checks: ["A02", "A03", "A09"],
  },
  {
    id: "advanced-em",
    domain: "Advanced electromagnetics",
    title: "Maxwell's equations, skin depth and leakage",
    topics: ["Maxwell's equations", "Boundary conditions", "Poynting vector", "Energy density", "Near-field coupling", "Eddy currents", "Leakage fields", "EMI", "Shielding", "Skin effect", "Proximity effect"],
    stages: {
      Wonder: "Why is the pad wound with Litz wire of a thousand hair-thin strands?",
      Discover: "At 85 kHz current crowds to a conductor's surface: the skin depth in copper is about 0.22 mm.",
      Play: "Sweep frequency and watch the skin depth shrink.",
      Understand: "Maxwell's equations at these frequencies are quasi-static: the pads are tiny compared with the 3.5 km wavelength, so this is near-field magnetic coupling, not radiation.",
      Derive: "From the diffusion equation for current density, δ = √(2ρ/(ωμ)).",
      Calculate: "Winding AC resistance from strand size, copper length and temperature.",
      Experiment: "Field view: compare the flux density at the gap centre with the probe beyond the pad edge.",
      Validate: "Field and coupling checks A09 and A10; the leakage field is model-derived and is not an exposure assessment.",
      Research: "Shield and ferrite shaping to cut leakage without losing efficiency (needs FEM and measurement).",
    },
    equations: ["skin-depth", "maxwell"],
    checks: ["A09", "A10"],
  },
  {
    id: "resonance",
    domain: "Resonance",
    title: "Resonant circuits and the art of tuning",
    topics: ["LC oscillations", "RLC circuits", "Natural frequency", "Forced oscillations", "Quality factor", "Damping", "Impedance matching", "Frequency splitting", "Coupled resonators", "Adaptive resonance"],
    stages: {
      Wonder: "With coupling as low as 0.2, how can more than 95 % of the power still arrive?",
      Discover: "Resonant capacitors cancel the coils' reactance, so large currents flow with modest voltages; high Q makes weak coupling sufficient.",
      Play: "Detune the capacitors in the Circuit Lab and watch the input phase and efficiency.",
      Understand: "η depends on the product k·Q; the best load is R_L,opt = √(R2² + (ωM)²R2/R1).",
      Derive: "From the two mesh equations, the reflected impedance (ωM)²/(Z2 + R_L) and the efficiency expression follow.",
      Calculate: "Efficiency against load and against frequency for six compensation topologies.",
      Experiment: "Raise the coupling past the critical value and see the input power split into two peaks.",
      Validate: "Checks A04, A06 and A07 tie the closed form, the optimum and the nodal solver together.",
      Research: "Adaptive resonance for moving receivers: tracking the optimum as M(t) changes.",
    },
    equations: ["resonance", "q-factor", "reflected", "ss-efficiency"],
    checks: ["A04", "A06", "A07"],
  },
  {
    id: "thermal",
    domain: "Thermal physics",
    title: "Heat: the limit on every component",
    topics: ["Joule heating", "Semiconductor losses", "Conduction", "Convection", "Radiation", "Thermal resistance", "Thermal capacitance", "Temperature-dependent properties"],
    stages: {
      Wonder: "Why does charging slow down on a hot afternoon?",
      Discover: "Losses heat the coil, the electronics and the battery; each has a limit, and resistance rises with temperature.",
      Play: "Change power, thermal resistance and capacity: watch the temperature approach its steady value.",
      Understand: "A first-order node: C·dT/dt = P − (T − T_amb)/R. Time constant τ = RC.",
      Derive: "Solving the linear ODE with constant P gives the exponential approach to T_amb + P·R.",
      Calculate: "Winding temperature rise at rated power; copper resistance rises 0.39 % per kelvin.",
      Experiment: "Inject a foreign object with detection disabled and watch its (illustrative) temperature rise.",
      Validate: "Check A08: the exact update matches the analytic solution for any step size.",
      Research: "Pad cooling and derating strategies for high-power stations.",
    },
    equations: ["thermal-rc", "copper-loss"],
    checks: ["A08"],
  },
  {
    id: "vehicle",
    domain: "Vehicle physics",
    title: "What the road asks of the battery",
    topics: ["Newton's laws", "Velocity", "Acceleration", "Kinetic energy", "Rolling resistance", "Aerodynamic drag", "Road gradient", "Traction power", "Regenerative braking"],
    stages: {
      Wonder: "Can a car charge while driving at 120 km/h — or does it still lose energy?",
      Discover: "Drag grows with the square of speed and power with its cube; a road pad's energy per metre falls as speed rises.",
      Play: "Change speed and gradient in the traction equation and see the battery-side power.",
      Understand: "F = ½ρC_dAv² + C_rr·mg·cosθ + mg·sinθ + m·a; P = F·v / η.",
      Derive: "Energy per kilometre received = mean received power / speed; compare with traction energy per kilometre.",
      Calculate: "The speed at which a given road coverage becomes energy-neutral.",
      Experiment: "In the Dynamic twin, find charging, energy-neutral and discharging regimes.",
      Validate: "Check B11 finds all three regimes on the same road.",
      Research: "Co-optimising coverage, speed limits and receiver rating for a corridor.",
    },
    equations: ["traction", "energy-balance"],
    checks: ["B11", "B06"],
  },
  {
    id: "battery",
    domain: "Battery physics",
    title: "Inside the pack",
    topics: ["Electrochemical storage", "Cell voltage", "Internal resistance", "SOC", "SOH", "Charge acceptance", "Degradation", "Thermal behaviour"],
    stages: {
      Wonder: "Why does charging slow near 80 %, and why is a cold battery charged gently?",
      Discover: "Terminal voltage rises with SOC and current; at the cell limit the charger must taper (CV). Cold cells have high resistance and plating risk.",
      Play: "Change SOC and current and see the terminal voltage of the equivalent circuit.",
      Understand: "V_t = OCV(SOC) + I·R0 + V1, with the RC branch relaxing with time constant τ1.",
      Derive: "Requiring V_t ≤ V_max at the end of a step gives the CV current limit used by the BMS model.",
      Calculate: "Charging time from 30 % to 80 % with the CC–CV taper, by running the session.",
      Experiment: "Charge a −15 °C pack and see the BMS refuse; warm it and watch acceptance return.",
      Validate: "Checks B03, B05 and A11 cover zero-power rest, limits and coulomb counting.",
      Research: "Battery behaviour under frequent short dynamic charging pulses (needs cell test data before any lifetime claim).",
    },
    equations: ["battery-ecm", "charging-time"],
    checks: ["B03", "B05", "A11"],
  },
];

// ── 32-week programme ──

export interface Unit {
  code: string;
  kind: "Learning" | "Experiment";
  title: string;
  hours: number;
}

export interface Week {
  week: number;
  month: number;
  theme: string;
  units: [Unit, Unit];
}

export interface Month {
  month: number;
  title: string;
  deliverable: string;
  weeks: Week[];
}

const W = (week: number, theme: string, learn: string, experiment: string): Week => ({
  week,
  month: Math.ceil(week / 4),
  theme,
  units: [
    { code: `U${String(week * 2 - 1).padStart(2, "0")}`, kind: "Learning", title: learn, hours: 5 },
    { code: `U${String(week * 2).padStart(2, "0")}`, kind: "Experiment", title: experiment, hours: 6 },
  ],
});

const WEEKS: Week[] = [
  W(1, "Electricity and magnetism", "Charge, current, voltage, power; Ohm's and Kirchhoff's laws", "Measure I–V and power on a low-voltage bench supply; loss ledger in the twin"),
  W(2, "Electromagnetic induction", "Faraday, Lenz, Ampère, Biot–Savart; self and mutual inductance", "Two-coil induction with a signal generator and oscilloscope; compare with the filament model"),
  W(3, "AC circuits and complex numbers", "Phasors, impedance, complex power; calculus refresher", "Series RLC resonance sweep on the bench and in the Circuit Lab"),
  W(4, "Differential equations and numerical modelling", "First- and second-order ODEs; Euler, RK4, exact exponential updates", "Code an RC thermal node and an RLC transient; verify against analytic solutions (A08)"),
  W(5, "Transmitter and receiver coil design", "Planar spirals, turn spacing, Litz wire, skin and proximity effect", "Wind a small spiral coil; measure L and R_ac with an LCR meter"),
  W(6, "Magnetic materials and shielding", "Ferrite, permeability, saturation, images; aluminium shields", "Measure L and k with and without a ferrite plate; calibrate the coverage factor"),
  W(7, "Coupling, air gap and misalignment", "Coupling coefficient, null points, tolerance", "Map k against gap and lateral offset on a positioning jig"),
  W(8, "Field simulation", "Analytical fields, FEM concepts, field probes, exposure awareness", "Field map with a search coil; compare with the analytical section and note where it differs"),
  W(9, "Rectifiers and inverters", "Full-bridge inverter, phase-shift control, diode rectifier, FHA", "Low-voltage full-bridge inverter driving a resonant tank (current-limited supply)"),
  W(10, "Resonant compensation", "SS, SP, PS, PP, LCC; tuning and detuning", "Tune an SS link; measure efficiency against load and frequency"),
  W(11, "DC–DC conversion and power regulation", "Buck/boost control, optimum load tracking", "Close a power loop on the low-voltage link; record efficiency map"),
  W(12, "Switching losses and charging efficiency", "Conduction and switching loss, ZVS, thermal design", "Supervised low-voltage stationary proof of concept charging a small battery pack"),
  W(13, "Embedded systems", "Microcontrollers, timers, ADCs, real-time loops", "ESP32/STM32-class controller reading current, voltage and temperature sensors"),
  W(14, "Sensors and data acquisition", "Calibration, quantisation, uncertainty, sampling", "Calibrate sensors; publish readings with units, timestamps and quality flags"),
  W(15, "Communication protocols", "CAN, UART, SPI, I²C, Wi-Fi, BLE, MQTT, OCPP concepts", "Vehicle–station heartbeat over a wireless link; inject loss and latency"),
  W(16, "Charging state machine and safety monitoring", "States, interlocks, safety precedence, fault handling", "Connected parking prototype: state machine, FOD stand-in, telemetry to the twin"),
  W(17, "Moving receivers", "Position-dependent coupling, motional EMF, quasi-static limits", "Receiver on a linear track over two transmitter coils; record M(x)"),
  W(18, "Segmented roads", "Segment layout, coverage, interlocks, controller latency", "Segment switching from a position sensor; measure activation timing"),
  W(19, "Dynamic resonance and handover", "Handover strategies, power ripple, adaptive tuning", "Compare reactive, predictive and make-before-break handover on the track"),
  W(20, "Vehicle dynamics and energy balance", "Road load, traction power, energy-neutral speed", "Moving-receiver test-track prototype with energy accounting"),
  W(21, "Vehicle localisation", "Coordinate frames, odometry, UWB, uncertainty", "Log odometry and UWB fixes on a miniature vehicle"),
  W(22, "Sensor fusion", "Kalman and extended Kalman filters, delays", "EKF on recorded data; study measurement delay and compensation"),
  W(23, "Autonomous parking and alignment control", "Kinematic bicycle model, pure pursuit, docking", "Simulated precision parking; alignment error versus sensor quality"),
  W(24, "Secure authorisation and mission planning", "Identity, challenge–response, station selection", "Simulated autonomous vehicle: station discovery, reservation and precision alignment"),
  W(25, "Smart grid and solar", "Grid limits, tariffs, PV generation, forecasting basics", "District day in the twin: grid, PV and base load"),
  W(26, "Battery energy storage and fleets", "BESS dispatch, depot charging, laxity", "Compare BESS sizes for peak shaving"),
  W(27, "Optimisation and AI-assisted control", "Baselines first; scheduling heuristics; ML with honest evaluation", "Policy comparison: uncoordinated, equal share, least laxity, tariff-aware, solar-following"),
  W(28, "Cybersecurity", "Threats to charging systems, segmentation, secure update, audit", "Simulated authentication failure, replay and stale-data experiments"),
  W(29, "Prototype integration", "System integration, interfaces, configuration control", "Integrate the parking pad, track and vehicle with the twin's data model"),
  W(30, "Instrumentation and calibration", "Measurement uncertainty, calibration records", "Calibrate the integrated prototype; record uncertainty budgets"),
  W(31, "Verification and experimental validation", "Residuals, model calibration, validity ranges", "Compare measured and simulated coupling, power and efficiency; report residuals"),
  W(32, "Research documentation and demonstration", "Writing, figures, reproducibility, presentation", "Technical demonstration and research presentation"),
];

const MONTH_TITLES = [
  ["Physics and mathematical foundations", "Validated fundamental electromagnetic coupling model."],
  ["Wireless power transfer and magnetic engineering", "Coil design and experimentally measurable coupling map."],
  ["Power electronics and stationary charging", "Stationary wireless charging simulation and supervised low-voltage proof of concept."],
  ["IoT-enabled Smart Wireless EV Charging Station", "Connected wireless parking charging prototype with telemetry."],
  ["Dynamic Wireless EV Charging", "Moving-receiver wireless charging test-track prototype."],
  ["Autonomous Wireless EV Charging", "Simulated autonomous vehicle with automatic charging station discovery and precision alignment."],
  ["Smart infrastructure, AI and energy intelligence", "Intelligent charging infrastructure simulation and optimisation study."],
  ["Integration, validation and research", "Complete integrated Wireless EV Charging Digital Twin, experimental evidence, engineering report and research presentation."],
] as const;

export const CURRICULUM: readonly Month[] = MONTH_TITLES.map(([title, deliverable], i) => ({
  month: i + 1,
  title,
  deliverable,
  weeks: WEEKS.filter((w) => w.month === i + 1),
}));

export const CURRICULUM_TOTALS = {
  weeks: WEEKS.length,
  units: WEEKS.length * 2,
  hours: WEEKS.reduce((s, w) => s + w.units[0].hours + w.units[1].hours, 0),
};

export const CURRICULUM_NOTE = "Completing the workshop does not guarantee a research publication or confer formal academic accreditation.";

// ── Physical proof of concept ──

export interface PocStage {
  id: string;
  title: string;
  goal: string;
  architecture: string;
  interfaces: string[];
  bom: string[];
  instrumentation: string[];
  tests: string[];
  safety: string[];
}

const LV_SAFETY = ["Isolated, current-limited low-voltage supply (≤ 48 V DC)", "Qualified supervision at all times", "Thermal cut-off on every coil", "No exposed live conductors; insulated test leads"];

export const POC_STAGES: readonly PocStage[] = [
  { id: "POC 01", title: "Fundamental wireless energy transfer", goal: "A stationary transmitter and receiver; measure induced voltage against frequency, gap and offset.", architecture: "Function generator → small power amplifier → transmitter coil ⇢ receiver coil → resistive load.", interfaces: ["BNC to oscilloscope", "USB to logging PC"], bom: ["Signal generator", "Linear amplifier", "Hand-wound spiral coils", "Load resistors", "Positioning jig"], instrumentation: ["Oscilloscope", "LCR meter", "Current probe"], tests: ["L, R and M against the filament model", "Induced EMF ∝ ωMI"], safety: LV_SAFETY },
  { id: "POC 02", title: "Resonant wireless power transfer", goal: "Resonance, coupling and efficiency of an SS link at low voltage.", architecture: "Low-voltage full bridge → C1 → TX ⇢ RX → C2 → rectifier → load.", interfaces: ["Gate-drive PWM from MCU", "Isolated measurement"], bom: ["Half/full-bridge evaluation board", "Film capacitors", "Litz coils", "Schottky rectifier"], instrumentation: ["Power analyser or calibrated DMMs", "Thermocouples"], tests: ["Efficiency against load and frequency", "Frequency splitting at high coupling", "ZVS observation"], safety: LV_SAFETY },
  { id: "POC 03", title: "Smart Wireless EV Charging Station (miniature)", goal: "Automatic vehicle detection, alignment check, telemetry and the charging state machine.", architecture: "POC 02 link + station MCU + presence and alignment sensors + IoT gateway + twin.", interfaces: ["MQTT telemetry", "Wireless heartbeat to the vehicle", "Twin data model"], bom: ["STM32/ESP32-class controllers", "Hall/current sensors", "NTC sensors", "UWB or magnetic positioning", "Small battery pack with BMS"], instrumentation: ["Data logger", "Network capture"], tests: ["State machine walk-through", "Fault injection: object, link loss, overtemperature"], safety: LV_SAFETY },
  { id: "POC 04", title: "Dynamic Wireless EV Charging track", goal: "A moving receiver over a line of segmented transmitters.", architecture: "Linear track, cart with receiver, segment drivers switched from a position sensor.", interfaces: ["Segment bus", "Encoder", "Twin data model"], bom: ["Linear rail and motorised cart", "4–8 transmitter coils", "Segment switches", "Encoder"], instrumentation: ["High-rate logger", "Oscilloscope"], tests: ["M(x) map", "Handover timing and ripple", "Interlock: no activation without the cart"], safety: [...LV_SAFETY, "Mechanical guards on the moving cart"] },
  { id: "POC 05", title: "Autonomous charging vehicle (miniature)", goal: "Simulated or supervised automatic parking and wireless charging.", architecture: "Small-scale vehicle with odometry and UWB, docking controller, receiver pad.", interfaces: ["ROS-style topics or MQTT", "Twin data model"], bom: ["Miniature chassis", "Wheel encoders, IMU", "UWB tags and anchors", "Receiver pad"], instrumentation: ["Motion capture or ruler grid", "Logger"], tests: ["Final alignment error distribution", "Effect of delay and noise"], safety: [...LV_SAFETY, "Speed-limited, supervised operation in a fenced area"] },
  { id: "POC 06", title: "Integrated intelligent mobility ecosystem", goal: "Parking station, dynamic track, miniature vehicle, controllers, battery monitoring, gateway, twin and experiment management together.", architecture: "POC 03 + POC 04 + POC 05 on one data model, with recorded experiments compared against the twin.", interfaces: ["Hardware adapter layer (planned)", "Experiment records with seeds and model versions"], bom: ["Integration of earlier stages"], instrumentation: ["Synchronised logging", "Calibration records"], tests: ["Residuals between measurement and model", "Reproducibility of repeated experiments"], safety: LV_SAFETY },
];

export const HIGH_POWER_NOTE = "High-power EV charging hardware is a separate advanced engineering undertaking that needs suitable laboratory infrastructure, electrical protection and safety assessment. The web application never operates hardware.";

// ── Engineering review gates ──

export type GateStatus = "Not started" | "Evidence in preparation" | "Ready for review" | "Approved";

export interface Gate {
  id: string;
  name: string;
  purpose: string;
  criteria: string[];
  evidence: string[];
  open: string[];
  status: GateStatus;
}

export const GATES: readonly Gate[] = [
  { id: "MCR", name: "Mission Concept Review", purpose: "Is the research question worth pursuing, and is the concept sound?", criteria: ["Research question stated", "Five research environments scoped (Smart Parking Shelter specified, not yet simulated)", "Branding and content rules agreed"], evidence: ["Product vision and requirements (docs)", "This application's Overview"], open: ["Review by the EV.ENGINEER™ team"], status: "Ready for review" },
  { id: "SRR", name: "System Requirements Review", purpose: "Are the requirements complete, testable and traceable?", criteria: ["Requirements trace to models and checks", "Safety requirements listed"], evidence: ["Traceability matrix (below)", "Verification checks with quantitative expectations"], open: ["Standards applicability not yet verified", "Safety requirements need a hazard analysis"], status: "Evidence in preparation" },
  { id: "PDR", name: "Preliminary Design Review", purpose: "Does the architecture meet the requirements?", criteria: ["Engine independent of rendering", "Model registry with fidelity", "Data modes defined"], evidence: ["Architecture document", "Model registry"], open: ["Hardware adapter layer designed but not implemented"], status: "Evidence in preparation" },
  { id: "CDR", name: "Critical Design Review", purpose: "Is the detailed design ready to build and test hardware?", criteria: ["POC designs, BOM and test plans", "Safety review of the low-voltage set-up"], evidence: ["Proof-of-concept roadmap"], open: ["Detailed hardware design not started"], status: "Not started" },
  { id: "TRR", name: "Test Readiness Review", purpose: "Are test articles, procedures and instruments ready?", criteria: ["Calibrated instruments", "Procedures approved"], evidence: [], open: ["No hardware yet"], status: "Not started" },
  { id: "VRR", name: "Validation Readiness Review", purpose: "Can models be compared with experiments over a defined range?", criteria: ["Recorded datasets with uncertainty", "Calibration of empirical coefficients"], evidence: [], open: ["No recorded experimental dataset yet"], status: "Not started" },
  { id: "FRR", name: "Final Research Review", purpose: "Are the results, limitations and conclusions supported by evidence?", criteria: ["Validated models within stated ranges", "Reproducible experiments", "Report and presentation"], evidence: [], open: ["Depends on all earlier gates"], status: "Not started" },
];

// ── Standards registry ──

export interface Standard {
  id: string;
  title: string;
  area: string;
  relevance: string;
  status: string;
}

const UNVERIFIED = "Applicability and current edition to be verified before any requirement is quoted. No compliance is claimed.";

export const STANDARDS: readonly Standard[] = [
  { id: "SAE J2954", title: "Wireless power transfer for light-duty plug-in and electric vehicles and alignment methodology", area: "Wireless charging", relevance: "Power classes, air-gap classes, interoperability and alignment for stationary WPT.", status: UNVERIFIED },
  { id: "IEC 61980 series", title: "Electric vehicle wireless power transfer (WPT) systems", area: "Wireless charging", relevance: "General requirements, communication and specific requirements for magnetic-field WPT.", status: UNVERIFIED },
  { id: "ISO 19363", title: "Electrically propelled road vehicles — magnetic field wireless power transfer — safety and interoperability requirements", area: "Vehicle side", relevance: "Vehicle-side safety and interoperability of magnetic WPT.", status: UNVERIFIED },
  { id: "ISO 15118-20", title: "Road vehicles — vehicle to grid communication interface (second generation)", area: "Communication", relevance: "Vehicle–charger communication, including WPT services.", status: UNVERIFIED },
  { id: "OCPP 2.0.1", title: "Open Charge Point Protocol (Open Charge Alliance)", area: "Backend", relevance: "Charging station to backend communication. Not a power-transfer or safety control protocol.", status: UNVERIFIED },
  { id: "IEC 61851 series", title: "Electric vehicle conductive charging system", area: "Electrical safety", relevance: "Reference for charging-system safety concepts; conductive, so only partly relevant.", status: UNVERIFIED },
  { id: "ISO 26262", title: "Road vehicles — functional safety", area: "Functional safety", relevance: "Safety lifecycle for vehicle-side electronics.", status: UNVERIFIED },
  { id: "IEC 61508", title: "Functional safety of electrical/electronic/programmable electronic safety-related systems", area: "Functional safety", relevance: "Generic functional safety for infrastructure-side safety functions.", status: UNVERIFIED },
  { id: "ISO/SAE 21434", title: "Road vehicles — cybersecurity engineering", area: "Cybersecurity", relevance: "Cybersecurity risk management for vehicle-side systems.", status: UNVERIFIED },
  { id: "IEC 62443 series", title: "Security for industrial automation and control systems", area: "Cybersecurity", relevance: "Security of networked infrastructure controllers.", status: UNVERIFIED },
  { id: "IEC 61000 series", title: "Electromagnetic compatibility (EMC)", area: "EMC", relevance: "Emission and immunity of power electronics and charging infrastructure.", status: UNVERIFIED },
  { id: "ICNIRP 2010", title: "Guidelines for limiting exposure to time-varying electric and magnetic fields (1 Hz – 100 kHz)", area: "Exposure", relevance: "Reference levels for magnetic fields at WPT frequencies; assessment needs measured or FEM fields.", status: UNVERIFIED },
  { id: "IEEE C95.1", title: "Safety levels with respect to human exposure to electric, magnetic and electromagnetic fields, 0 Hz to 300 GHz", area: "Exposure", relevance: "Alternative exposure framework.", status: UNVERIFIED },
];

// ── Research ──

export const RESEARCH_THEMES: readonly { title: string; question: string; baseline: string }[] = [
  { title: "Adaptive resonance during vehicle motion", question: "Can frequency or capacitance tracking hold efficiency as M(t) changes?", baseline: "Fixed-frequency SS link" },
  { title: "Magnetic coupler design optimisation", question: "Which turns, radii and ferrite give the best k·Q per kilogram?", baseline: "Default 600/460 mm pads" },
  { title: "Misalignment tolerance", question: "How large an offset can each topology tolerate at rated power?", baseline: "SS with optimum-load tracking" },
  { title: "Dynamic segment handover", question: "Which handover keeps ripple low without energising uncovered pads?", baseline: "Reactive handover" },
  { title: "Power ripple reduction", question: "Can pad spacing and overlap cut received-power ripple?", baseline: "0.2 m spacing" },
  { title: "Semiconductor loss minimisation", question: "How wide a ZVS range can phase-shift control keep?", baseline: "Inverter loss model" },
  { title: "Thermal management", question: "What pad cooling sustains rated power on a hot day?", baseline: "Passive pad node" },
  { title: "Magnetic shielding optimisation", question: "Leakage versus efficiency for shield geometries (needs FEM).", baseline: "Analytical field section" },
  { title: "Battery behaviour under intermittent charging", question: "How do short charging pulses affect energy balance and stress?", baseline: "Thevenin model and stress indicator" },
  { title: "Energy-aware autonomous parking", question: "How much alignment accuracy is worth how much sensor cost?", baseline: "UWB-only EKF" },
  { title: "AI-assisted coil activation", question: "Does a learned predictor beat the kinematic predictor, honestly evaluated?", baseline: "Predictive handover (kinematic)" },
  { title: "IoT telemetry reliability", question: "Which buffering and freshness rules keep the twin trustworthy?", baseline: "Simulated bus with loss and latency" },
  { title: "Multi-vehicle charging coordination", question: "Which allocation policy minimises unmet demand under a limit?", baseline: "Equal share" },
  { title: "Renewable energy integration", question: "How much PV can a car park absorb without storage?", baseline: "Solar-following policy" },
  { title: "Grid demand optimisation", question: "Peak reduction from storage and tariff-aware charging.", baseline: "Uncoordinated charging" },
  { title: "Electrified road coverage optimisation", question: "Coverage needed for energy-neutral driving at each speed.", baseline: "Coverage sweep" },
  { title: "Reduced-order electromagnetic modelling", question: "Fast surrogates of M(x, y, z) for control.", baseline: "Filament model lookup table" },
  { title: "Physics-informed machine learning", question: "Can physics constraints make small datasets useful?", baseline: "Analytical model with calibration" },
];

export const NOVELTY_NOTE = "These are established research areas. Claims of novelty need a literature review first; the twin provides baselines and experiments, not novelty.";

export const AI_STUDIES: readonly { problem: string; inputs: string; outputs: string; baseline: string; status: string }[] = [
  { problem: "Predictive coil activation", inputs: "Delayed position, speed", outputs: "Segment on/off", baseline: "Kinematic predictor x + v·τ (implemented)", status: "Baseline implemented; learned model not yet trained — no dataset" },
  { problem: "Coupling estimation", inputs: "V_oc, I1, frequency", outputs: "k", baseline: "Model-based estimate M = V_oc/(ωI1)", status: "Baseline implemented" },
  { problem: "Fleet charging scheduling", inputs: "Arrivals, needs, departures, tariff, limit", outputs: "Power per bay", baseline: "Least-laxity and tariff-aware heuristics (implemented)", status: "Heuristic baselines implemented; optimisation and learning planned" },
  { problem: "Thermal anomaly detection", inputs: "Temperatures, losses", outputs: "Anomaly flag", baseline: "Threshold with hysteresis (implemented)", status: "Baseline only" },
  { problem: "Demand forecasting", inputs: "Time, calendar, history", outputs: "Arrivals per hour", baseline: "Known arrival-rate shape", status: "Planned; needs recorded data" },
];

export const AI_NOTE = "AI never replaces the independently enforced safety limits. Each study starts from a deterministic engineering baseline, and no AI result is shown until a model has been trained and evaluated on stated data.";

// ── Risks ──

export const RISKS: readonly { risk: string; effect: string; mitigation: string }[] = [
  { risk: "Analytical coupler over- or under-estimates real pads", effect: "Wrong power and efficiency figures", mitigation: "Coverage factor flagged for calibration; FEM or measured maps can replace it (Month 2)" },
  { risk: "Users read simulated values as measurements", effect: "False confidence", mitigation: "Every value carries a data mode; nothing is LIVE without a connected prototype" },
  { risk: "Field visualisation mistaken for an exposure assessment", effect: "Unsafe conclusions", mitigation: "Field views state source, fidelity and limits; exposure needs measured/FEM fields" },
  { risk: "High-power hardware attempted from the curriculum", effect: "Injury", mitigation: "All POC stages are isolated, current-limited low voltage under supervision" },
  { risk: "Standards quoted without verification", effect: "Misleading compliance claims", mitigation: "Registry marks every entry as to be verified; no compliance claimed" },
  { risk: "Browser performance on low-end devices", effect: "Unusable 3D", mitigation: "Adaptive quality, 2D fallback, labs work without WebGL" },
  { risk: "AI added for its own sake", effect: "Unsupported claims", mitigation: "Baselines first; no AI result shown without data and evaluation" },
];

// ── FAQ ──

export const FAQ: readonly { q: string; a: string }[] = [
  { q: "Is this a simulation or connected to real hardware?", a: "A simulation. Every value is computed by the models in this application and labelled SIMULATED or ESTIMATED. No physical prototype is connected, so nothing is shown as LIVE." },
  { q: "How accurate is the magnetic model?", a: "It is an analytical filament model with ferrite represented by images (fidelity F1). It agrees with independent numerical integration to better than one part in a million, but real pads with finite ferrite, shields and vehicle floors need FEM or measurement to calibrate it." },
  { q: "Does wireless charging while driving always increase the battery's charge?", a: "No. The battery gains energy only when received power exceeds traction demand. At highway speeds with partial coverage the battery can still discharge; the Dynamic twin shows all three regimes." },
  { q: "Why does the station stop when the vehicle moves sideways?", a: "In a series–series link, a sudden fall in coupling at the same inverter voltage drives the primary current up. The protection trips before the controller can respond, exactly as the twin shows." },
  { q: "Can the field view tell me whether exposure is safe?", a: "No. It shows the analytical field between the pads. Exposure assessment needs measured or finite-element fields compared with the applicable guideline." },
  { q: "Does it comply with wireless charging standards?", a: "No compliance is claimed. The standards registry lists relevant publications whose applicability and current editions still need to be verified." },
  { q: "What hardware does the programme build?", a: "Low-voltage, current-limited laboratory prototypes under qualified supervision, from a two-coil experiment to an integrated miniature ecosystem. High-power EV hardware is outside its scope." },
];

// ── Research & Project Leadership ──

export interface ResearcherLink {
  label: string;
  /** Visible text of the link. */
  text: string;
  href: string;
}

export interface Researcher {
  role: string;
  name: string;
  affiliation: string;
  body: string;
  /** The highlighted lead. */
  lead?: boolean;
  links: ResearcherLink[];
}

export const LEADERSHIP = {
  heading: "Research & Project Leadership",
  subtitle: "Researchers guiding the Next-Generation Wireless EV Charging Digital Twin engineering and research initiative through EV.ENGINEER™",
  researchers: [
    {
      role: "Lead Researcher · EV.ENGINEER™",
      name: "Ms. Tanuja Jadhav",
      affiliation: "EV.ENGINEER™",
      lead: true,
      body: "Leads research direction for the Next-Generation Wireless EV Charging Digital Twin, coordinating student research across stationary, dynamic and autonomous wireless charging and guiding the 8-Month Advanced Engineering Research & Practical Workshop. Also leads the AegisCAN initiative.",
      links: [
        { label: "AegisCAN — CAN & BMS Cybersecurity, led by Tanuja Jadhav", text: "AegisCAN", href: "/internships/AegisCAN" },
        { label: "Tanuja Jadhav — EV Society Research Profile", text: "Research Profile", href: "https://www.evsociety.org/projects/battery-safety-systems/candidates/tanujajadhav" },
        { label: "Tanuja Jadhav on LinkedIn", text: "LinkedIn", href: "https://www.linkedin.com/in/tanuja-jadhav-049431398/" },
      ],
    },
    {
      role: "Co-Researcher · EV.ENGINEER™",
      name: "Mr. Sudarshana Karkala",
      affiliation: "EV.ENGINEER™",
      body: "Contributes to the digital twin’s engineering architecture, simulation and model verification, and the physical proof-of-concept roadmap, within the broader EV.ENGINEER™ engineering research framework.",
      links: [
        { label: "Sudarshana Karkala — EV.ENGINEER Profile", text: "Research Profile", href: "/about/sudarshana-karkala" },
        { label: "Sudarshana Karkala on LinkedIn", text: "LinkedIn", href: "https://www.linkedin.com/in/sudarshanakarkala/" },
      ],
    },
  ] as Researcher[],
};

export const DISCLAIMER = "Educational and research simulation. Values are computed by stated models with stated assumptions; they are not measurements, certified results or design approvals. The application never controls hardware.";
