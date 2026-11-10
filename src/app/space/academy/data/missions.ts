// The Academy's interactive 3D missions. Each is a page under
// /space/academy/missions/<slug>. All three are playable; their physics is
// simplified and their numbers illustrative, as each mission states.

export interface MissionMeta {
  slug: string;
  number: number;
  title: string;
  /** Track this mission belongs to first (./curriculum.ts). */
  track: string;
  summary: string;
  /** What the learner does, in a few words each. */
  youWill: string[];
  concepts: string[];
  steps: number;
  color: string;
}

export const MISSIONS: MissionMeta[] = [
  {
    slug: "build-your-first-cubesat",
    number: 1,
    title: "Build Your First CubeSat",
    track: "spacecraft-systems",
    summary: "Assemble a 1U CubeSat part by part in 3D, learn what each subsystem does, then balance its mass and power budgets.",
    youWill: ["Install eight subsystems in a workable order", "Identify parts by their job", "Trade payload, solar panels and radio time"],
    concepts: ["1U form factor", "Mass budget", "Solar power P = S·A·η·cos θ", "Power margin"],
    steps: 5,
    color: "#3B82F6",
  },
  {
    slug: "survive-the-eclipse",
    number: 2,
    title: "Survive the Eclipse",
    track: "faults-safe-mode",
    summary: "Keep a CubeSat's battery alive through Earth's shadow: size the power system, read live simulated telemetry, inject faults and use safe mode.",
    youWill: ["Find the orbit period and eclipse length", "Size the battery and watch three orbits", "Inject a fault and recover with safe mode"],
    concepts: ["Orbital period", "Eclipse fraction", "State of charge", "Safe mode and hysteresis"],
    steps: 5,
    color: "#7C3AED",
  },
  {
    slug: "stable-model-rocket",
    number: 3,
    title: "Design a Stable Model Rocket",
    track: "model-rocketry",
    summary: "Shape the nose and fins, add ballast and choose a motor until the centre of gravity leads the centre of pressure by one to two calibres.",
    youWill: ["Find the centre of gravity", "Find the centre of pressure", "Make the design stable, and robust to a heavier motor"],
    concepts: ["Centre of gravity", "Barrowman centre of pressure", "Static margin", "Thrust-to-weight"],
    steps: 5,
    color: "#F59E0B",
  },
];

export const missionBySlug = (slug: string) => MISSIONS.find((m) => m.slug === slug);

export const missionHref = (slug: string) => `/space/academy/missions/${slug}`;
