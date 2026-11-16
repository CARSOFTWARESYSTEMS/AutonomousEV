import type { SolarInputs } from "./solar";

export interface LessonDefinition {
  id: string;
  version: number;
  topic: string;
  world: string;
  difficulty: "Beginner";
  prerequisites: string[];
  objectives: string[];
  question: string;
  explanation: string[];
  assumptions: string[];
  mathematics: { equation: string; definitions: { symbol: string; meaning: string; unit: string }[]; example: string };
  experiment: { kind: "solar-incidence"; initial: SolarInputs; controls: { key: keyof SolarInputs; label: string; unit: string; min: number; max: number; step: number; help: string }[] };
  observations: string[];
  guidedQuestions: string[];
  hints: string[];
  challenge: { targetW: number; title: string; advanced: { targetW: number; maxAreaM2: number; maxEfficiencyPercent: number; maxIrradianceWm2: number } };
  verificationRules: string[];
  misconceptions: string[];
  completionCriteria: string[];
  reflection: { question: string; choices: { text: string; correct: boolean; feedback: string }[] };
  scientificReview: { status: "Independent review pending"; checklist: string; sources: { label: string; url: string }[] };
}

export const CAPTURE_THE_SUN: LessonDefinition = {
  id: "capture-the-sun", version: 1, topic: "Capture the Sun", world: "discover-energy", difficulty: "Beginner",
  prerequisites: ["Count and compare numbers. No aerospace or trigonometry knowledge needed."],
  objectives: ["Predict how turning a panel changes its power.", "Distinguish incoming sunlight from electrical output.", "Read watts, square metres and percentages.", "Find more than one way to power a satellite."],
  question: "Why does a satellite generate more electricity when its solar panels face the Sun?",
  explanation: [
    "Imagine catching rain in a tray. Held flat under falling rain, it catches more. Tilt it and it presents less area to the rain. A solar panel catches a beam of sunlight in a similar way.",
    "Sunlight carries energy. Solar cells convert some of that energy into electricity. Power tells us how quickly energy is transferred: one watt means one joule each second.",
    "The panel normal is an imaginary arrow sticking straight out of its front face. We measure the angle between this arrow and the direction toward the Sun. At 0° the panel faces the Sun; at 90° the light runs along its edge.",
  ],
  assumptions: ["One flat, one-sided panel under uniform, parallel direct sunlight.", "Sunlight intensity is measured perpendicular to the incoming rays, before the panel tilt is applied.", "Fixed conversion efficiency. No atmosphere, reflected light, partial shading, temperature effects, ageing or wiring losses.", "Steady power at the panel terminals; no battery, orbital motion or power-distribution model. At 90° and on the back face, direct power is zero."],
  mathematics: {
    equation: "P = G × A × η × max(0, cos θ)",
    definitions: [
      { symbol: "P", meaning: "Generated electrical power", unit: "W (watts)" },
      { symbol: "G", meaning: "Direct sunlight intensity", unit: "W/m² (watts per square metre)" },
      { symbol: "A", meaning: "Active panel area", unit: "m² (square metres)" },
      { symbol: "η", meaning: "Conversion efficiency as a fraction: 20% = 0.20", unit: "no unit" },
      { symbol: "θ", meaning: "Angle from the panel normal to the Sun", unit: "degrees in the controls; radians inside cosine" },
    ],
    example: "With 1,000 W/m², 0.50 m², 20% efficiency and a 60° angle: 1,000 × 0.50 × 0.20 × 0.50 = 50 W. Hold that power for 60 seconds: 50 × 60 = 3,000 J = 0.833 Wh.",
  },
  experiment: { kind: "solar-incidence", initial: { angleDeg: 60, irradianceWm2: 1000, areaM2: 0.5, efficiencyPercent: 20 }, controls: [
    { key: "angleDeg", label: "Solar-panel angle", unit: "°", min: 0, max: 90, step: 1, help: "0° faces the Sun. 90° is edge-on." },
    { key: "irradianceWm2", label: "Sunlight intensity", unit: "W/m²", min: 0, max: 1400, step: 10, help: "Incoming power per square metre, perpendicular to the rays." },
    { key: "areaM2", label: "Solar-panel area", unit: "m²", min: 0.05, max: 1, step: 0.05, help: "Active cell area. Twice the area catches twice the light." },
    { key: "efficiencyPercent", label: "Conversion efficiency", unit: "%", min: 0, max: 40, step: 1, help: "The share of intercepted sunlight converted to electricity." },
  ] },
  observations: ["With other inputs fixed, power is greatest at 0° and zero at 90°.", "Doubling area or sunlight doubles power when efficiency and angle stay fixed.", "Turning to 60° gives half the face-on power. Half the angle does not mean half the power."],
  guidedQuestions: ["Keep three controls still. What happens when you change only the angle?", "Can a larger panel meet the target even when it is tilted?", "What happens to every angle on the graph when sunlight is zero?"],
  hints: ["Try pointing the panel more directly toward the Sun: move the angle toward 0°.", "More active area or stronger sunlight also increases power. You can change more than one input.", "At 1,000 W/m² and 20% efficiency, a 0.50 m² panel produces 100 W when it faces the Sun."],
  challenge: { targetW: 80, title: "Generate enough power to operate your satellite.", advanced: { targetW: 80, maxAreaM2: 0.4, maxEfficiencyPercent: 25, maxIrradianceWm2: 1000 } },
  verificationRules: ["Reject non-finite and out-of-contract model inputs.", "Electrical power is nonnegative and never exceeds intercepted sunlight.", "Electrical plus unconverted power equals intercepted power.", "Check the unrounded result against the mission target."],
  misconceptions: ["90° is not face-on: this angle is measured from the normal, not the surface.", "Power (W) is a rate; energy (J or Wh) accumulates over time.", "Unconverted sunlight is not destroyed: it can be reflected, transmitted or become heat.", "A consistent equation and passing tests do not establish physical validation."],
  completionCriteria: ["Meet the 80 W target in mission mode.", "Explain why facing the Sun helps, using the reflection question.", "Select Complete the mission. Free experiments never earn scores."],
  reflection: { question: "With the same sunlight, area and efficiency, why does facing the Sun produce more power?", choices: [
    { text: "The panel intercepts a wider cross-section of the incoming light.", correct: true, feedback: "Exactly. More light reaches the active surface each second. The panel has not grown; its projected area has changed." },
    { text: "Turning the panel creates extra energy.", correct: false, feedback: "Try comparing incoming and electrical power. Turning changes how much light is intercepted; it does not create energy." },
    { text: "The Sun becomes brighter when the panel turns.", correct: false, feedback: "Hold the sunlight slider still and rotate the panel. The source stays the same, but the area presented to its rays changes." },
  ] },
  scientificReview: { status: "Independent review pending", checklist: "docs/satellite-energy-academy/review.md", sources: [
    { label: "NASA POWER: solar geometry and tilted surfaces", url: "https://power.larc.nasa.gov/docs/methodology/data/derived/tilted-surfaces/" },
    { label: "U.S. Department of Energy: photovoltaic performance and efficiency", url: "https://www.energy.gov/cmei/systems/solar-photovoltaic-performance-and-efficiency-basics" },
  ] },
};

export const WORLDS = [
  { id: "discover-energy", title: "Discover Energy", description: "From a glowing bulb to a sun-powered spacecraft.", topics: "Observation · units · speed · work · power · circuits · voltage and current · solar energy · efficiency", mission: "Capture the Sun", playable: true },
  { id: "meet-the-battery", title: "Meet the Battery", description: "Store sunlight now. Keep exploring after dark.", topics: "Cells and packs · chemical energy · charging · percentages · state of charge · Wh and Ah · resistance · reserves · temperature and safety", mission: "Keep the Satellite Alive", playable: false },
  { id: "journey-around-earth", title: "Journey Around Earth", description: "Follow a satellite from sunshine into Earth’s shadow.", topics: "Gravity · Newton’s laws · circular motion · altitude · orbital period · eclipse · angles · geometry · trigonometry", mission: "Survive the Eclipse", playable: false },
  { id: "mathematics", title: "Mathematics Comes Alive", description: "Discover what a slope and an area can tell you.", topics: "Variables · algebra · equations · inequalities · ratios · functions · graphs · limits · differentiation · integration · differential equations · time steps", mission: "Discover Calculus by Saving a Satellite", playable: false },
  { id: "engineering", title: "Become a Satellite Engineer", description: "Balance sunlight, storage and the needs of a mission.", topics: "Subsystems · power distribution · conservation · operating modes · scheduling · battery and array sizing · faults · safe mode · trade-offs", mission: "Design Your First Energy-Safe Satellite", playable: false },
  { id: "scientist", title: "Think Like a Scientist", description: "Ask what your model can—and cannot—prove.", topics: "Assumptions · uncertainty · numerical error · verification vs validation · logic · predicates · constraints · invariants · state machines · faults · parameter estimation · digital twins", mission: "Prove Your Satellite Model Is Consistent", playable: false },
] as const;
