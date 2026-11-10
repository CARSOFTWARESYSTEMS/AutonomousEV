// Space Academy curriculum: seven tracks, each written for two age levels.
//
// Content rules (the same as the rest of /space):
//  - Physics and mathematics are standard textbook relations. Where a lesson
//    uses a simplified model or an illustrative number, it says so.
//  - Nothing planned is described as running. Classes and workshops are
//    Planned; the interactive missions and existing tutorials are available.
//  - No claim of affiliation with, or eligibility for, any agency programme
//    or competition.

export type Level = "foundation" | "advanced";

export const LEVELS: Record<Level, { label: string; ages: string; name: string; summary: string }> = {
  foundation: {
    label: "Ages 14–16",
    ages: "14–16",
    name: "Foundation",
    summary: "Concepts first: what each part does, why it matters, and the arithmetic that proves it. No calculus.",
  },
  advanced: {
    label: "Ages 17–18",
    ages: "17–18",
    name: "Advanced",
    summary: "The same ideas with the physics behind them: derivations, trade studies, margins and engineering judgement.",
  },
};

export const LEVEL_ORDER: Level[] = ["foundation", "advanced"];

export interface Equation {
  /** What the relation is called. */
  name: string;
  /** Plain-text expression, read aloud as written. */
  expression: string;
  /** Each symbol with its unit. */
  units: string;
  /** What it means, in words for the level. */
  explain: string;
}

export interface LevelPlan {
  prerequisites: string[];
  objectives: string[];
  modules: { title: string; topics: string[] }[];
  /** 3D models the lessons need: existing ones are named, new ones are marked planned. */
  models3d: string[];
  physics: Equation[];
  activities: string[];
  challenge: { title: string; design: string; pass: string[] };
  outcomes: string[];
}

export interface TutorialRef {
  label: string;
  href: string;
  note: string;
}

export type TrackIcon = "rocket" | "satellite" | "orbit" | "cpu" | "radio" | "shield" | "package";

export interface Track {
  slug: string;
  title: string;
  /** One line under the title. */
  tagline: string;
  summary: string;
  icon: TrackIcon;
  /** Accent from the /space palette. */
  color: string;
  /** Interactive missions in this track, by slug (./missions.ts). */
  missions: string[];
  /** Existing tutorials and pages on this site. */
  tutorials: TutorialRef[];
  /** How the track is delivered. Online self-paced work exists; classes and workshops are planned. */
  formats: { online: string; offline: string | null };
  levels: Record<Level, LevelPlan>;
}

const T = {
  everyday: { label: "Space Applications", href: "/space/everyday-applications", note: "How satellites reach everyday life." },
  station: { label: "Space Station", href: "/space/space-station", note: "Orbital stations: power, life support, docking, research." },
  satEng: { label: "Satellite Engineering", href: "/space/satellite-engineering", note: "Advanced programme: from first principles to systems architecture." },
  explorer: { label: "Satellite Explorer 3D", href: "/space/satellite-engineering/interactive-3d", note: "A 6U Earth-observation satellite in interactive 3D." },
  cubetwin: { label: "CubeTwin", href: "/space/cubesat", note: "CubeSat energy digital twin: sunlight, battery, faults, safe mode." },
  rocketry: { label: "Model Rocketry", href: "/space/model-rocketry", note: "Aerodynamics, stability, propulsion, recovery and flight analysis." },
  stability: { label: "Model Rocketry: flight physics and stability lab", href: "/space/model-rocketry#flight-physics", note: "Move the CG and CP and watch the static margin." },
  cansatCompare: { label: "Model Rocketry: rocketry and CanSat compared", href: "/space/model-rocketry#rocketry-vs-cansat", note: "What each discipline teaches, and where they meet." },
  guide: { label: "7-Day Model Rocketry Learning Guide", href: "/space/2026-INSPACe-ROCKETRY-059", note: "An independent day-by-day study companion; not an official IN-SPACe publication." },
  engineTwin: { label: "Rocket Engine Digital Twin", href: "/space/rocket-engine-digital-twin", note: "A reusable liquid rocket engine reference architecture." },
  engineTwinAdv: { label: "Advanced Rocket Propulsion Digital Twin", href: "/space/rocket-engine-digital-twin-advanced", note: "Pressure monitoring, fault detection, diagnosis and prognostics." },
  uflight: { label: "UFlight 3D", href: "/aerospace/uflight-3d", note: "An electric aircraft's sensor networks and health monitoring." },
  mission: { label: "Autonomous Spacecraft Health Mission", href: "/space#mission", note: "Why spacecraft must observe, diagnose and recover." },
} satisfies Record<string, TutorialRef>;

export const TRACKS: Track[] = [
  {
    slug: "space-technology",
    title: "Space Technology",
    tagline: "Orbits, launch and the services satellites provide",
    summary: "Start here. Why things stay in orbit, how rockets get them there, and how satellites shape weather forecasts, navigation, communication and disaster response.",
    icon: "orbit",
    color: "#7C3AED",
    missions: [],
    tutorials: [T.everyday, T.station, T.mission],
    formats: { online: "Self-paced reading and tutorials now; live online classes planned.", offline: null },
    levels: {
      foundation: {
        prerequisites: ["School arithmetic: ratios, percentages and unit conversion", "Reading a simple graph", "No coding or physics background needed"],
        objectives: [
          "Explain an orbit as falling around the Earth while moving sideways fast enough to keep missing it",
          "Compare low, medium and geostationary orbits by height and by what they are used for",
          "Name four services satellites provide and trace one of them to something you used today",
          "Describe why rockets use stages",
        ],
        modules: [
          { title: "Where space begins", topics: ["The 100 km Kármán line as a convention", "Air, vacuum and why satellites fly above the atmosphere"] },
          { title: "Orbits as falling", topics: ["Newton's cannonball thought experiment", "Orbital speed and period", "Low, medium and geostationary orbits"] },
          { title: "Satellites in daily life", topics: ["Navigation and timing", "Weather and Earth observation", "Communication and broadcasting", "Disaster response"] },
          { title: "Getting to orbit", topics: ["Thrust and weight", "Why rockets drop stages", "Launch, separation and deployment"] },
          { title: "People in orbit", topics: ["Space stations", "Life support basics", "Why microgravity research matters"] },
        ],
        models3d: ["Earth with low, medium and geostationary orbit rings (planned for Academy)", "Space station overview (existing: Space Station tutorial)"],
        physics: [
          { name: "Speed from distance and time", expression: "v = d ÷ t", units: "v in km/s, d in km, t in s", explain: "One trip around a 6,771 km-radius orbit is about 42,500 km. Dividing by the time the trip takes gives the orbital speed." },
          { name: "Circumference of an orbit", expression: "d = 2 × π × r", units: "r in km (Earth radius 6,371 km + altitude)", explain: "The orbit's radius is measured from Earth's centre, not from the ground." },
          { name: "Orbital period (worked for you)", expression: "T = 2π × √(r³ ÷ μ)", units: "T in s, r in km, μ = 398,600 km³/s² for Earth", explain: "At 400 km altitude this gives about 92 minutes: roughly 15–16 orbits a day." },
        ],
        activities: [
          "Map one day of your life: list each moment a satellite service helped you (maps, weather, a live broadcast)",
          "Swing a ball on a string to feel why a faster sideways speed is needed for a tighter orbit",
          "Use a public satellite pass-prediction website to find when the International Space Station passes over your town",
        ],
        challenge: {
          title: "Orbit Match",
          design: "Six satellite services are shown. Match each one to the orbit that suits it best and give a one-line reason.",
          pass: ["At least 5 of 6 matches correct", "Every match has a reason that mentions height, coverage or how often the satellite passes"],
        },
        outcomes: ["Can explain what keeps a satellite in orbit without the word 'gravity-free'", "Can choose a sensible orbit for a familiar service and say why"],
      },
      advanced: {
        prerequisites: ["Newton's laws and circular motion", "Algebra with powers, roots and logarithms", "Spreadsheet basics"],
        objectives: [
          "Derive circular orbital speed by setting gravitational force equal to the centripetal force needed",
          "Calculate orbital period at any altitude and find the altitude of a 24-hour orbit",
          "Use the rocket equation to explain why staging improves achievable Δv",
          "Reason about coverage, revisit time and signal latency when choosing an orbit",
        ],
        modules: [
          { title: "Gravity and circular orbits", topics: ["Newton's law of gravitation", "Deriving v = √(μ/r)", "Kepler's third law"] },
          { title: "Orbit families", topics: ["LEO, MEO, GEO and sun-synchronous orbits", "Ground tracks and revisit", "Coverage versus resolution"] },
          { title: "Launch and Δv", topics: ["Tsiolkovsky rocket equation", "Mass ratio and specific impulse", "Why staging helps"] },
          { title: "The space environment", topics: ["Vacuum and outgassing", "Thermal extremes in sunlight and shadow", "Radiation and debris"] },
        ],
        models3d: ["Orbit visualiser with an altitude slider (planned for Academy)", "Two-stage launcher in exploded view (planned for Academy)"],
        physics: [
          { name: "Circular orbital speed", expression: "v = √(μ ÷ r)", units: "v in km/s, μ = 398,600 km³/s², r in km", explain: "From G·M·m/r² = m·v²/r. Higher orbits are slower." },
          { name: "Orbital period", expression: "T = 2π × √(r³ ÷ μ)", units: "T in s", explain: "Kepler's third law for a circular orbit: period grows with r to the power 1.5." },
          { name: "Rocket equation", expression: "Δv = Isp × g₀ × ln(m₀ ÷ m_f)", units: "Δv in m/s, Isp in s, g₀ = 9.81 m/s², masses in kg", explain: "Δv depends on the logarithm of the mass ratio, which is why dropping empty tanks (staging) pays off." },
          { name: "Signal latency", expression: "t = 2h ÷ c", units: "t in s, h in km, c ≈ 300,000 km/s", explain: "Up and back down for a satellite directly overhead: milliseconds from low orbit, about a quarter of a second via geostationary orbit." },
        ],
        activities: [
          "Build a spreadsheet of period against altitude from 200 km to 40,000 km and find where the period equals one sidereal day",
          "Compare round-trip signal delay for a low-orbit and a geostationary link and relate it to a video call",
          "Estimate Δv for a single-stage and a two-stage vehicle with the same total mass and propellant",
        ],
        challenge: {
          title: "Orbit Brief",
          design: "Given two missions (low-latency internet and full-disc weather imaging), recommend an orbit for each and support it with calculations.",
          pass: ["Periods calculated within 2% of the reference values", "Each recommendation addresses coverage, revisit and latency", "Assumptions are stated"],
        },
        outcomes: ["Can derive and apply the circular-orbit relations", "Can defend an orbit choice with numbers rather than adjectives"],
      },
    },
  },
  {
    slug: "spacecraft-systems",
    title: "Spacecraft Systems",
    tagline: "The subsystems that keep a spacecraft alive",
    summary: "Structure, power, thermal control, attitude control, computing, communications and payload, and how they share a limited budget of mass, power and volume.",
    icon: "satellite",
    color: "#3B82F6",
    missions: ["build-your-first-cubesat"],
    tutorials: [T.explorer, T.satEng, T.station, T.cubetwin],
    formats: { online: "Interactive 3D mission available now; live online classes planned.", offline: null },
    levels: {
      foundation: {
        prerequisites: ["School arithmetic", "Watts and grams as units", "Space Technology track recommended"],
        objectives: [
          "Name the main subsystems of a small satellite and say what each one does",
          "Explain why every subsystem must work together for the mission to succeed",
          "Add up a simple mass budget and power budget and say whether a design fits",
        ],
        modules: [
          { title: "Anatomy of a CubeSat", topics: ["The 10 cm unit (1U)", "Frame and rails", "Stacked electronics boards"] },
          { title: "Power", topics: ["Solar cells", "Batteries for eclipse", "The power board"] },
          { title: "Brains and voice", topics: ["Flight computer", "Radio and antenna", "Ground stations"] },
          { title: "Pointing and payload", topics: ["Attitude control with magnetorquers", "Cameras and sensors as payloads"] },
          { title: "Budgets", topics: ["Mass budget", "Power budget", "Why designers keep a margin"] },
        ],
        models3d: ["1U CubeSat with exploded and labelled views (available: Build Your First CubeSat)", "6U Earth-observation satellite (existing: Satellite Explorer 3D)"],
        physics: [
          { name: "Mass budget", expression: "m_total = m₁ + m₂ + … + m_n", units: "grams", explain: "Every part has a mass. The total must stay under the limit the launch allows." },
          { name: "Electrical power", expression: "P = V × I", units: "P in W, V in volts, I in amps", explain: "Power is how fast energy is used. A 5 V board drawing 0.2 A uses 1 W." },
          { name: "Energy", expression: "E = P × t", units: "E in Wh, P in W, t in h", explain: "A 2 W radio switched on for half an hour uses 1 Wh." },
        ],
        activities: [
          "Build a 1U CubeSat in the 3D mission and explain each part to someone else",
          "Make a 10 cm cardboard cube and decide where each board, the battery and the camera would go",
          "Write the mass budget for your cardboard model with kitchen-scale measurements",
        ],
        challenge: {
          title: "Build Your First CubeSat",
          design: "Install the subsystems in a workable order, identify parts by their job, then balance the mass and power budgets.",
          pass: ["All parts installed with internal parts before the side panels", "Three of three part-identification questions correct", "Mass within the lesson limit and power margin of zero or more"],
        },
        outcomes: ["Can point to each subsystem on a model and explain its job", "Can tell from a budget whether a design closes"],
      },
      advanced: {
        prerequisites: ["Foundation level of this track, or equivalent", "Physics of electricity and heat", "Comfort with percentages and margins"],
        objectives: [
          "Run a trade study between design options using mass, power and mission value",
          "Apply design margins and explain why they shrink as a design matures",
          "Estimate an equilibrium temperature with a radiative heat balance",
          "Relate attitude-control needs to payload pointing requirements",
        ],
        modules: [
          { title: "Systems engineering", topics: ["Requirements and verification", "Interfaces", "Trade studies"] },
          { title: "Budgets with margins", topics: ["Mass and power margins", "Orbit-average power", "Worst-case analysis"] },
          { title: "Thermal control", topics: ["Absorptivity and emissivity", "Radiative balance", "Heaters and radiators"] },
          { title: "Attitude determination and control", topics: ["Sensors: sun sensors, magnetometers, gyros", "Actuators: magnetorquers and reaction wheels", "Pointing accuracy"] },
        ],
        models3d: ["1U CubeSat with budget overlays (available: Build Your First CubeSat)", "6U satellite subsystems and flows (existing: Satellite Explorer 3D)"],
        physics: [
          { name: "Design margin", expression: "margin = (allowed − estimate) ÷ estimate × 100%", units: "percent", explain: "Early estimates are uncertain, so the margin protects the design from growth." },
          { name: "Solar power", expression: "P = S × A × η × cos θ", units: "S ≈ 1,361 W/m² near Earth, A in m², η as a fraction, θ = Sun angle", explain: "Generation falls with the cosine of the angle between the panel's normal and the Sun." },
          { name: "Radiative heat balance", expression: "α × S × A_sun = ε × σ × A_rad × T⁴", units: "σ = 5.67 × 10⁻⁸ W/(m²·K⁴), T in kelvin", explain: "In equilibrium the heat absorbed equals the heat radiated, which fixes the temperature." },
        ],
        activities: [
          "Complete Build Your First CubeSat at the Advanced level, where the mass margin and the off-Sun check are stricter",
          "Compare body-mounted and deployable solar panels in a short written trade study",
          "Estimate the equilibrium temperature of a black and a white 10 cm cube in sunlight",
        ],
        challenge: {
          title: "Close the Design",
          design: "Choose payload, solar configuration and radio time so the CubeSat meets its data requirement with margins.",
          pass: ["Mass margin of at least 10% against the lesson limit", "Power margin of at least 10% with the Sun 45° off the panel normal", "Trade-off explained in three sentences"],
        },
        outcomes: ["Can lead a simple trade study", "Can explain why a design with zero margin is not finished"],
      },
    },
  },
  {
    slug: "satellite-engineering",
    title: "Satellite Engineering",
    tagline: "From mission idea to operations",
    summary: "How a satellite mission is defined, designed, built, tested and flown: requirements, payloads, links to the ground and the life cycle of a project.",
    icon: "radio",
    color: "#06B6D4",
    missions: ["build-your-first-cubesat"],
    tutorials: [T.satEng, T.explorer, T.cubetwin],
    formats: { online: "Self-paced tutorials now; live online classes planned.", offline: null },
    levels: {
      foundation: {
        prerequisites: ["Spacecraft Systems foundation recommended", "Basic geometry"],
        objectives: [
          "Describe the life of a mission from idea to end of life",
          "Explain what a ground station does and why contact time is limited",
          "Write a simple mission requirement that can be tested",
        ],
        modules: [
          { title: "Mission idea to requirements", topics: ["Who needs the data?", "Writing testable requirements"] },
          { title: "Payloads", topics: ["Cameras and image detail", "Other sensors"] },
          { title: "Talking to the ground", topics: ["Ground stations", "Passes and contact windows", "Data volume"] },
          { title: "Build, test, fly", topics: ["Integration", "Testing as you fly", "Operations and end of life"] },
        ],
        models3d: ["6U Earth-observation satellite (existing: Satellite Explorer 3D)", "Ground-station pass visualisation (planned for Academy)"],
        physics: [
          { name: "Data per pass", expression: "data = rate × time", units: "data in megabits, rate in Mbit/s, time in s", explain: "A 1 Mbit/s link during an 8-minute pass moves 480 megabits, which is 60 megabytes." },
          { name: "Bits and bytes", expression: "1 byte = 8 bits", units: "—", explain: "Links are quoted in bits per second; files in bytes." },
        ],
        activities: [
          "Write three requirements for a school weather-imaging satellite and say how each would be tested",
          "Plan how many ground-station passes are needed to download a day of images",
        ],
        challenge: {
          title: "Mission One-Pager",
          design: "Produce a one-page mission concept: user, payload, orbit, data per day and how the data reaches the user.",
          pass: ["Every requirement is testable", "Daily data volume is calculated and fits the passes available", "The end-of-life plan is stated"],
        },
        outcomes: ["Can turn an idea into requirements", "Can check whether the data a mission makes can reach the ground"],
      },
      advanced: {
        prerequisites: ["Logarithms and decibels", "Spacecraft Systems advanced recommended"],
        objectives: [
          "Calculate ground sampling distance for a camera payload",
          "Use free-space path loss in a first-cut link budget",
          "Size data storage and downlink time for a mission",
          "Explain the verification approach: analysis, inspection, demonstration, test",
        ],
        modules: [
          { title: "Payload performance", topics: ["Ground sampling distance", "Swath and revisit"] },
          { title: "Link budgets", topics: ["Decibels", "Free-space path loss", "Antenna gain and margin"] },
          { title: "Data systems", topics: ["Onboard storage", "Compression", "Downlink scheduling"] },
          { title: "Verification and life cycle", topics: ["Verification methods", "Environmental testing", "Operations and disposal"] },
        ],
        models3d: ["6U satellite payload footprint and ground link (existing: Satellite Explorer 3D)"],
        physics: [
          { name: "Ground sampling distance", expression: "GSD = H × p ÷ f", units: "H altitude in m, p pixel pitch in m, f focal length in m", explain: "A smaller GSD means finer detail; it grows with altitude." },
          { name: "Free-space path loss", expression: "FSPL(dB) = 20 log₁₀(d) + 20 log₁₀(f) + 92.45", units: "d in km, f in GHz", explain: "Signal strength falls with the square of distance; decibels turn that into addition." },
          { name: "Link margin", expression: "margin = received power − required power", units: "dB", explain: "Positive margin means the link closes with room for losses you did not model." },
        ],
        activities: [
          "Compute GSD for a small camera at 500 km and at 600 km and discuss the trade",
          "Build a link budget spreadsheet for a UHF beacon and an S-band downlink",
        ],
        challenge: {
          title: "Link Closes",
          design: "Given transmitter power, antenna gains and receiver sensitivity, decide whether a downlink closes at the edge of a pass.",
          pass: ["Path loss within 0.5 dB of the reference", "Correct closes / does-not-close verdict with the margin stated", "One design change proposed that would add 3 dB"],
        },
        outcomes: ["Can size a payload and a link with standard relations", "Can explain how a mission is verified before launch"],
      },
    },
  },
  {
    slug: "model-rocketry",
    title: "Model Rocketry",
    tagline: "Stability, propulsion and recovery",
    summary: "How a rocket flies straight, what its motor does, and how it comes home safely. Builds on the site's Model Rocketry tutorial and a 3D stability mission.",
    icon: "rocket",
    color: "#F59E0B",
    missions: ["stable-model-rocket"],
    tutorials: [T.rocketry, T.stability, T.guide, T.engineTwin],
    formats: {
      online: "Interactive 3D mission and tutorials now; live online classes planned.",
      offline: "Model Rocketry workshop planned. Dates, venue, fees, eligibility and safety arrangements will be published for each workshop.",
    },
    levels: {
      foundation: {
        prerequisites: ["School arithmetic", "Newton's three laws in words"],
        objectives: [
          "Name the parts of a model rocket and the four forces in flight",
          "Explain why the centre of gravity must be ahead of the centre of pressure",
          "Describe the phases of a flight from lift-off to recovery",
          "State the safety rules that apply whenever a rocket is launched",
        ],
        modules: [
          { title: "Parts and forces", topics: ["Nose cone, body, fins, motor, recovery", "Thrust, weight, drag and lift"] },
          { title: "Stability", topics: ["Centre of gravity", "Centre of pressure", "Static margin in calibres"] },
          { title: "Flight phases", topics: ["Boost, coast, apogee", "Ejection and recovery"] },
          { title: "Safety", topics: ["Supervised launches only", "Safe distances and range rules", "Why students never make motors"] },
        ],
        models3d: ["Model rocket with CG and CP markers and exploded view (available: Design a Stable Model Rocket)", "Rocket explorer (existing: Model Rocketry tutorial)"],
        physics: [
          { name: "Weight", expression: "W = m × g", units: "W in N, m in kg, g = 9.81 m/s²", explain: "A 100 g rocket weighs about 1 newton." },
          { name: "Thrust-to-weight", expression: "T ÷ W > 1", units: "no unit", explain: "Above 1 the rocket can lift off. Designers want much more, so it is moving fast enough for the fins to work when it leaves the launch rod." },
          { name: "Static margin", expression: "SM = (X_cp − X_cg) ÷ d", units: "calibres (body diameters)", explain: "Positive means stable. This lesson aims for 1 to 2 calibres." },
        ],
        activities: [
          "Find the balance point (CG) of a model or a pencil with an eraser on one end",
          "Cut a cardboard side profile of a rocket and find where it balances: a rough, conservative way to estimate the CP",
          "Play Design a Stable Model Rocket and explain your fin choice",
        ],
        challenge: {
          title: "Design a Stable Model Rocket",
          design: "Adjust nose, fins and ballast in the 3D mission until the rocket is stable but not overstable.",
          pass: ["Static margin between 1.0 and 2.0 calibres", "Correct explanation of why the CG must lead the CP"],
        },
        outcomes: ["Can predict whether a rocket will fly straight from its CG and CP", "Knows the safety boundary: launches are supervised and motors are never made by students"],
      },
      advanced: {
        prerequisites: ["Foundation level of this track", "Algebra and square roots", "Impulse and momentum"],
        objectives: [
          "Estimate the CP with the Barrowman method",
          "Calculate the CG from component masses and positions",
          "Relate total impulse to motor classes and to apogee",
          "Check that stability survives a heavier motor or a damaged fin",
        ],
        modules: [
          { title: "Barrowman method", topics: ["Nose and fin normal-force coefficients", "Fin geometry: root, tip, span, sweep", "Limits: subsonic flight, small angles"] },
          { title: "Mass properties", topics: ["Component CG", "Ballast", "CG shift as propellant burns"] },
          { title: "Propulsion", topics: ["Thrust curves", "Total impulse and motor classes", "Thrust-to-weight"] },
          { title: "Flight simulation", topics: ["Drag and apogee", "Open-source simulators such as OpenRocket", "Comparing simulation with flight data"] },
        ],
        models3d: ["Parametric model rocket: fin count, span, sweep (available: Design a Stable Model Rocket)", "Liquid engine reference architecture (existing: Rocket Engine Digital Twin)"],
        physics: [
          { name: "Centre of gravity", expression: "X_cg = Σ(mᵢ × xᵢ) ÷ Σmᵢ", units: "x in mm from the nose tip, m in g", explain: "The mass-weighted average position of every component." },
          { name: "Barrowman fin coefficient", expression: "C_Nf = [1 + R ÷ (S + R)] × 4N(S ÷ d)² ÷ [1 + √(1 + (2L_F ÷ (C_R + C_T))²)]", units: "R body radius, S span, N fin count, L_F mid-chord length, C_R and C_T root and tip chords", explain: "How strongly the fins push back when the rocket tilts. More span or more fins moves the CP aft." },
          { name: "Total impulse", expression: "I = ∫F dt ≈ F_avg × t_burn", units: "I in N·s", explain: "Each motor class letter allows up to twice the total impulse of the one before it." },
        ],
        activities: [
          "Calculate CP by hand for one design with the Barrowman equations and compare with the mission's value",
          "Model the same rocket in an open-source flight simulator and compare apogee for two motor classes",
          "Write a one-page stability report with liftoff and burnout margins",
        ],
        challenge: {
          title: "Robust Stability",
          design: "Design a rocket that stays stable with the standard motor and with a heavier motor.",
          pass: ["Static margin between 1.0 and 2.0 calibres with the standard motor", "Static margin of at least 1.0 calibre with the heavier motor", "Thrust-to-weight of at least 5 with the standard motor (this lesson's guideline)"],
        },
        outcomes: ["Can apply the Barrowman method and a CG calculation", "Can design for robustness rather than for one condition"],
      },
    },
  },
  {
    slug: "cansat",
    title: "CanSat",
    tagline: "A satellite mission the size of a drink can",
    summary: "Design a can-sized payload that measures, transmits and descends safely: sensors, power, radio, parachute and mission operations in miniature.",
    icon: "package",
    color: "#06B6D4",
    missions: [],
    tutorials: [T.cansatCompare, T.cubetwin, T.rocketry],
    formats: {
      online: "Self-paced tutorials now; live online classes planned.",
      offline: "CanSat workshop planned. Dates, venue, fees, eligibility and safety arrangements will be published for each workshop.",
    },
    levels: {
      foundation: {
        prerequisites: ["School arithmetic", "Curiosity about electronics; no prior coding needed"],
        objectives: [
          "Explain what a CanSat is and how it differs from a rocket",
          "Plan a primary mission (measure and transmit) and a secondary mission of your own",
          "Explain how air pressure tells you altitude",
          "Explain how a parachute sets the descent speed",
        ],
        modules: [
          { title: "What is a CanSat?", topics: ["A satellite mission in a can-sized volume", "Primary and secondary missions"] },
          { title: "Sensors", topics: ["Temperature", "Pressure and altitude", "Logging data"] },
          { title: "Talking to the ground", topics: ["Simple radio links", "Packets of data"] },
          { title: "Coming down safely", topics: ["Drag", "Parachute size", "Landing speed"] },
        ],
        models3d: ["CanSat stack: battery, microcontroller, sensors, radio, parachute (planned for Academy)"],
        physics: [
          { name: "Pressure and height (near sea level)", expression: "Δp ≈ 12 Pa per metre", units: "Pa", explain: "Air pressure drops by roughly 12 pascals for every metre you climb near the ground, about 1.2 kPa per 100 m." },
          { name: "Descent speed", expression: "v = d ÷ t", units: "m/s", explain: "Time the fall from a known height to find the average descent speed." },
        ],
        activities: [
          "Log temperature and pressure while carrying a sensor up and down a staircase",
          "Drop paper parachutes of three sizes from the same height and time them",
        ],
        challenge: {
          title: "Parachute Lab",
          design: "Choose a parachute size so a 300 g model lands at a gentle speed (the target is set in class).",
          pass: ["Measured descent speed within the target range in two of three drops", "A table of results with units"],
        },
        outcomes: ["Can explain every part of a CanSat", "Can turn a pressure reading into a height estimate"],
      },
      advanced: {
        prerequisites: ["Foundation level of this track", "Square roots and exponents", "Some programming helps"],
        objectives: [
          "Use the standard-atmosphere relation to convert pressure to altitude",
          "Size a parachute from a target descent rate",
          "Write a power budget for a full mission with margin",
          "Design a telemetry packet and a ground-station display",
        ],
        modules: [
          { title: "Atmosphere and altitude", topics: ["International Standard Atmosphere", "Calibrating to the launch-site pressure"] },
          { title: "Descent design", topics: ["Terminal velocity", "Drag coefficient", "Parachute sizing"] },
          { title: "Power and electronics", topics: ["Battery capacity", "Current draw", "Mission duration"] },
          { title: "Telemetry and operations", topics: ["Packet design", "Ground-station software", "Post-flight analysis"] },
        ],
        models3d: ["CanSat stack with parachute deployment (planned for Academy)"],
        physics: [
          { name: "Barometric altitude", expression: "h = 44,330 × [1 − (p ÷ p₀)^(1/5.255)]", units: "h in m, p and p₀ in Pa", explain: "A standard-atmosphere approximation; set p₀ to the pressure at the launch site." },
          { name: "Terminal velocity", expression: "v = √(2mg ÷ (ρ × C_d × A))", units: "v in m/s, ρ ≈ 1.225 kg/m³ at sea level, A in m²", explain: "Descent speed falls as the canopy area grows." },
          { name: "Battery energy", expression: "E = V × Q", units: "E in Wh, V in volts, Q in Ah", explain: "Compare with the energy the mission needs, plus margin." },
        ],
        activities: [
          "Calibrate a pressure sensor against a known height and measure its error",
          "Size a parachute for 300 g at 8 m/s, build it, and test it",
        ],
        challenge: {
          title: "Descent and Data",
          design: "Size the parachute and the power budget for a CanSat that must transmit once per second for its whole descent.",
          pass: ["Parachute area within 10% of the reference calculation", "Power budget positive with at least 20% margin", "Packet format documented field by field"],
        },
        outcomes: ["Can design a CanSat's descent and power systems from equations", "Can document a mission so another team could fly it"],
      },
    },
  },
  {
    slug: "sensors-telemetry",
    title: "Sensors & Telemetry",
    tagline: "Turning measurements into understanding",
    summary: "How sensors measure the world, how numbers become packets, and how engineers read telemetry to see what a spacecraft is doing.",
    icon: "cpu",
    color: "#3B82F6",
    missions: ["survive-the-eclipse"],
    tutorials: [T.cubetwin, T.explorer, T.engineTwinAdv, T.uflight],
    formats: { online: "Interactive mission and tutorials now; live online classes planned.", offline: null },
    levels: {
      foundation: {
        prerequisites: ["Reading graphs", "Averages"],
        objectives: [
          "Explain how a sensor turns something physical into a number",
          "Read a telemetry chart and spot when a value leaves its normal range",
          "Tell the difference between noise and a real change",
        ],
        modules: [
          { title: "Sensors", topics: ["Temperature, pressure, light, motion", "Units and ranges"] },
          { title: "From voltage to number", topics: ["Analogue and digital", "Resolution"] },
          { title: "Telemetry", topics: ["What a packet contains", "Time stamps"] },
          { title: "Reading the chart", topics: ["Normal ranges and limits", "Noise and averages", "Trends"] },
        ],
        models3d: ["CubeSat telemetry overlay (available: Survive the Eclipse)"],
        physics: [
          { name: "Average", expression: "x̄ = (x₁ + x₂ + … + x_n) ÷ n", units: "same as the measurement", explain: "Averaging several readings smooths out noise." },
          { name: "Resolution", expression: "step = range ÷ 2ⁿ", units: "same as the range, n = number of bits", explain: "A 12-bit reading of 0–3.3 V changes in steps of about 0.8 mV." },
        ],
        activities: [
          "Record a light sensor or phone light meter through a day and plot it",
          "In Survive the Eclipse, read the battery chart and find the exact moment the satellite enters shadow",
        ],
        challenge: {
          title: "Read the Telemetry",
          design: "A simulated telemetry log contains one abnormal period. Find it and explain what probably happened.",
          pass: ["Correct time window identified", "Explanation names the measurement and the limit it crossed"],
        },
        outcomes: ["Can read a telemetry chart with confidence", "Knows that every number has a unit and an uncertainty"],
      },
      advanced: {
        prerequisites: ["Foundation level of this track", "Straight-line graphs", "Basic programming"],
        objectives: [
          "Apply the sampling theorem when choosing a sample rate",
          "Calibrate a sensor with a straight-line fit",
          "Design a telemetry frame and calculate the data rate it needs",
          "Use limits with persistence to avoid false alarms",
        ],
        modules: [
          { title: "Sampling", topics: ["Nyquist rate", "Aliasing"] },
          { title: "Calibration", topics: ["Offset and gain", "Least-squares line"] },
          { title: "Frames and links", topics: ["Headers, payload, checksum", "Bit rate"] },
          { title: "Monitoring", topics: ["Limits and persistence", "False alarms versus missed detections"] },
        ],
        models3d: ["CubeSat with live simulated telemetry (available: Survive the Eclipse)", "Propulsion pressure monitoring (existing: Advanced Rocket Propulsion Digital Twin)"],
        physics: [
          { name: "Sampling theorem", expression: "f_s > 2 × f_max", units: "Hz", explain: "Sample faster than twice the highest frequency in the signal, or it will be misrepresented." },
          { name: "Linear calibration", expression: "y = a × x + b", units: "a gain, b offset", explain: "Fit a and b from known reference points." },
          { name: "Data rate", expression: "R = channels × samples per second × bits per sample", units: "bit/s", explain: "Add the frame overhead before comparing with the link." },
        ],
        activities: [
          "Calibrate a temperature sensor against two reference points and report its error",
          "Write a frame format for six channels and calculate the downlink time per orbit",
        ],
        challenge: {
          title: "Frame and Flag",
          design: "Design a telemetry frame, then write a limit check with persistence that catches a real fault but ignores single noisy samples.",
          pass: ["Frame decodes correctly field by field", "The check flags the injected fault", "No false alarms on the noisy but healthy log"],
        },
        outcomes: ["Can design telemetry that answers engineering questions", "Can explain the false-alarm trade-off"],
      },
    },
  },
  {
    slug: "faults-safe-mode",
    title: "Faults & Safe Mode",
    tagline: "How spacecraft notice problems and protect themselves",
    summary: "The heart of this site's mission: detecting faults, isolating them and recovering safely, with redundancy, safe mode and bounded, supervised autonomy.",
    icon: "shield",
    color: "#7C3AED",
    missions: ["survive-the-eclipse"],
    tutorials: [T.mission, T.cubetwin, T.engineTwinAdv],
    formats: { online: "Interactive mission and tutorials now; live online classes planned.", offline: null },
    levels: {
      foundation: {
        prerequisites: ["Spacecraft Systems foundation recommended"],
        objectives: [
          "Give examples of spacecraft faults and their effects",
          "Explain what safe mode is and why it exists",
          "Explain why distant spacecraft cannot wait for instructions from Earth",
          "Describe redundancy with an everyday example",
        ],
        modules: [
          { title: "What can go wrong", topics: ["Power, thermal, sensor and communication faults"] },
          { title: "Safe mode", topics: ["Switch off what is not essential", "Point to the Sun", "Wait for the ground"] },
          { title: "Distance and delay", topics: ["Light-time to the Moon and Mars", "Why autonomy matters"] },
          { title: "Redundancy", topics: ["Spare units", "Voting between sensors"] },
        ],
        models3d: ["CubeSat in orbit with eclipse and safe-mode states (available: Survive the Eclipse)"],
        physics: [
          { name: "Light-time delay", expression: "t = d ÷ c", units: "t in s, d in km, c ≈ 300,000 km/s", explain: "The Moon is about 384,400 km away: about 1.3 seconds each way. Mars is between about 3 and 22 light-minutes away." },
          { name: "Battery energy used in shadow", expression: "E = P × t", units: "Wh", explain: "Safe mode lowers P so the battery lasts through the eclipse." },
        ],
        activities: [
          "Play Survive the Eclipse, inject a fault and watch safe mode protect the battery",
          "Design a 'safe mode' for your phone: what would you switch off first, and why?",
        ],
        challenge: {
          title: "Survive the Eclipse",
          design: "Size the battery and set safe mode so the CubeSat survives three orbits, then repeat with a fault switched on.",
          pass: ["A sustainable power plan: more energy in than out over each orbit", "Battery never falls below the 20% floor", "The design survives with at least one fault injected"],
        },
        outcomes: ["Can explain safe mode and redundancy", "Understands why spacecraft must sometimes act before the ground can reply"],
      },
      advanced: {
        prerequisites: ["Foundation level of this track", "Probability basics", "Sensors & Telemetry advanced recommended"],
        objectives: [
          "Describe the Fault Detection, Isolation and Recovery (FDIR) loop",
          "Use hysteresis and dwell time to avoid mode chattering",
          "Calculate the reliability benefit of redundancy",
          "Explain why autonomy is introduced in bounded, supervised steps",
        ],
        modules: [
          { title: "FDIR", topics: ["Detection", "Isolation", "Recovery", "Verification"] },
          { title: "Mode logic", topics: ["Thresholds", "Hysteresis", "Dwell time"] },
          { title: "Reliability", topics: ["Independent failures", "Parallel redundancy", "2-out-of-3 voting"] },
          { title: "Bounded autonomy", topics: ["Advisory, supervised, bounded", "Why generative AI must not close a safety-critical loop"] },
        ],
        models3d: ["CubeSat EPS with fault injection and safe-mode thresholds (available: Survive the Eclipse)"],
        physics: [
          { name: "Parallel redundancy", expression: "R_sys = 1 − (1 − R)²", units: "probabilities from 0 to 1", explain: "Two independent units each 90% reliable give 99%, if failures really are independent." },
          { name: "Hysteresis", expression: "enter safe mode below L; leave only above H, with H > L", units: "percent state of charge", explain: "The gap stops the spacecraft switching back and forth around one threshold." },
        ],
        activities: [
          "Play Survive the Eclipse at the Advanced level: set the safe-mode entry and exit thresholds yourself",
          "Write the FDIR table for one subsystem: symptom, check, isolation, response, verification",
        ],
        challenge: {
          title: "Survive the Eclipse (Advanced)",
          design: "Choose battery size and safe-mode thresholds so the mission survives three orbits with battery ageing and a solar string failure injected together, while still delivering most of the planned imaging.",
          pass: ["Battery never falls below the 30% floor", "At least 80% of the planned imaging time delivered", "No more than two battery packs", "Safe mode on, with the exit threshold above the entry threshold"],
        },
        outcomes: ["Can explain FDIR in engineering terms", "Can design mode logic that is stable and safe"],
      },
    },
  },
];

export function trackBySlug(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}
