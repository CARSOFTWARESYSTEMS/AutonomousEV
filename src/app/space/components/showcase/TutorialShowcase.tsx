// "Learn by building mission-ready thinking": every published tutorial as one
// full-width row: a scientifically meaningful visual on the left (the right
// on phones' first line), the text on the right. Each row keeps its label,
// title, subtitle, complete original description, button, link, analytics
// attributes and status note; the description sits behind "About this
// tutorial" under a one-line summary, so the first read is short.
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import PropulsionTwinCardVisual from "../PropulsionTwinCardVisual";
import { APEX_ENTRY_HREF } from "../PartnersEcosystem";
import { APEX_OFFICIAL_SITE_URL } from "@/data/apex/site";
import { apexImage, imageFile, imageSrcSet } from "@/data/apex/images";
import ShowcaseVisual from "./ShowcaseVisual";
import type { ShowcaseTopic } from "./spin";
import { CubeSatPoster, EarthPoster, EnginePoster, RocketPoster, StationPoster } from "./posters";
import styles from "./showcase.module.css";

/** Pathway hues and the light tints used for text in them (AA on navy). */
const TINT: Record<string, string> = { "#06B6D4": "#67E8F9", "#B39DDB": "#DDD3F3", "#7C3AED": "#C4B5FD", "#3B82F6": "#93C5FD", "#F59E0B": "#FCD34D" };

interface Item {
  key: string;
  label: string;
  color: string;
  title: string;
  subtitle?: string;
  /** "Understand the Engine → Engineer the Digital Twin" on the advanced twin. */
  progression?: [string, string];
  /** The first-layer line: one sentence, drawn from the description. */
  lead: string;
  /** The complete original description, behind "About this tutorial". */
  description: string[];
  cta: { label: string; href: string; track?: Record<string, string> };
  note: React.ReactNode;
  visual: { topic: ShowcaseTopic; name: string; label: string; caption: string; poster: React.ReactNode; animated?: boolean } | "apex";
  flagship?: boolean;
}

const project = (id: string) => ({ "data-track-event": "space_project_card_click", "data-track-project": id, "data-track-placement": "simulation_projects" });

const ITEMS: Item[] = [
  {
    key: "space-applications",
    label: "Interactive Learning Experience",
    color: "#06B6D4",
    title: "Space Applications",
    lead: "How satellites and space data reach everyday life on the ground.",
    description: ["Discover how satellites and space data improve everyday life—from weather and mobility to agriculture, connectivity, disaster response and infrastructure."],
    cta: { label: "Explore Space Applications", href: "/space/everyday-applications" },
    note: "Educational reference · No aerospace background needed.",
    visual: {
      topic: "earth",
      name: "Earth and orbits",
      label: "Earth with two satellite orbits drawn to scale: a low, near-polar Earth-observation orbit and a higher navigation-satellite orbit, with the cone of Earth one navigation satellite can see.",
      caption: "Orbit sizes to scale with Earth; satellites enlarged. Gold: Earth observation, 700 km. Cyan: navigation, 20,200 km.",
      poster: <EarthPoster />,
    },
  },
  {
    key: "satellite-engineering",
    label: "Flagship Advanced Program",
    color: "#B39DDB",
    title: "Satellite Engineering",
    subtitle: "From First Principles to Spacecraft Systems Architect",
    lead: "Systems architecture and engineering leadership for spacecraft.",
    description: ["A systems-level architecture and engineering leadership program covering mission design, spacecraft subsystems, digital twins, verification, operations, risk, cost and technical decision-making."],
    cta: { label: "Explore Satellite Engineering", href: "/space/satellite-engineering" },
    note: "Architecture & Leadership Track · Systems Leads · CTO · Chief Architect",
    visual: {
      topic: "cubesat",
      name: "CubeSat",
      label: "A 1U CubeSat opened up into its stacked subsystems: camera, battery, power board, flight computer, radio and attitude control inside the frame, with the antenna above.",
      caption: "A 1U CubeSat, exploded into its subsystems: the Space Academy's own teaching model.",
      poster: <CubeSatPoster />,
    },
    flagship: true,
  },
  {
    key: "model-rocketry",
    label: "Interactive Learning Experience",
    color: "#7C3AED",
    title: "Model Rocketry",
    lead: "Aerospace engineering from first principles, one model rocket at a time.",
    description: ["Learn aerospace engineering from first principles—mission design, aerodynamics, stability, structures, propulsion, avionics, recovery and flight analysis."],
    cta: { label: "Explore Model Rocketry", href: "/space/model-rocketry" },
    note: "Educational aerospace learning · Beginner to advanced.",
    visual: {
      topic: "rocket",
      name: "model rocket",
      label: "A model rocket with an ogive nose and three fins on the pad, and behind it the shape of a flight: boost and coast up to apogee, then descent under a parachute.",
      caption: "A three-fin model rocket and a schematic flight: boost, coast to apogee, parachute descent. Not to scale.",
      poster: <RocketPoster />,
      animated: false,
    },
  },
  {
    key: "cubetwin",
    label: "Educational Prototype · 12-Week Student R&D Project",
    color: "#06B6D4",
    title: "CubeTwin",
    subtitle: "A Digital-Twin Simulation Platform for CubeSat Energy, Mission and Reliability Analysis",
    lead: "Sunlight in, loads out: a CubeSat's energy balance, simulated.",
    description: ["Model orbit sunlight, solar generation, battery state of charge, mission loads, faults and safe-mode decisions through an interactive beginner-friendly laboratory."],
    cta: { label: "Explore CubeTwin", href: "/space/cubesat" },
    note: "Educational R&D prototype · Simulated data · Not flight software.",
    visual: {
      topic: "eps",
      name: "CubeSat power",
      label: "A CubeSat with deployable solar wings, seen from above, with the Sun 30 degrees off the panels' facing direction: the angle that sets how much power the cells make.",
      caption: "Solar power falls with the Sun's angle: P = S × A × η × cos θ. Here θ = 30°, about 87% of full power.",
      poster: <CubeSatPoster wings sun />,
      animated: false,
    },
  },
  {
    key: "space-station",
    label: "Interactive Research Platform",
    color: "#3B82F6",
    title: "Space Station",
    lead: "How orbital research stations are designed, powered and operated.",
    description: ["Explore how orbital research stations are designed, powered, controlled and operated—from life support and microgravity laboratories to docking, robotics and future lunar stations."],
    cta: { label: "Explore Space Station", href: "/space/space-station" },
    note: "Educational models · Sourced programme facts · Not mission design data.",
    visual: {
      topic: "station",
      name: "space station",
      label: "A generic modular space station: pressurised modules and a node along one axis, a long truss carrying four solar array wings, radiators, and a docked crew vehicle.",
      caption: "A generic modular station: modules, truss, solar arrays, radiators and a docked vehicle. Not a model of any real station.",
      poster: <StationPoster />,
    },
  },
  {
    key: "apex",
    label: "Partner Engineering Ecosystem",
    color: "#06B6D4",
    title: "APEX Rocket Systems",
    subtitle: "Rocket Propulsion · Integrated Launch Systems",
    lead: "Propulsion hardware APEX has built, and the path to a validated rocket system.",
    description: ["See the 5 kN-class liquid-engine demonstrator APEX has built, and the engineering path from propulsion hardware to a validated rocket system."],
    cta: { label: "Explore APEX Collaboration Concept", href: APEX_ENTRY_HREF, track: { "data-track-event": "space_project_card_click", "data-track-project": "apex_rocket_systems", "data-track-placement": "simulation_projects" } },
    note: (
      <>
        Engineering collaboration with Gamyaa AeroSystems ·{" "}
        <a
          href={APEX_OFFICIAL_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.noteLink}
          data-track-event="space_partner_official_site_click"
          data-track-partner="apex_rocket_systems"
          data-track-placement="simulation_projects"
        >
          Official website<span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      </>
    ),
    visual: "apex",
  },
  {
    key: "rocket-engine-digital-twin",
    label: "Interactive Digital Twin",
    color: "#F59E0B",
    title: "Next-Generation Rocket Engine Digital Twin",
    lead: "Inside a reusable liquid rocket engine, system by system.",
    description: ["Explore a reusable liquid rocket engine reference architecture—propellant feed, turbomachinery, combustion, regenerative cooling, control, simulated testing and engine health monitoring."],
    cta: { label: "Explore Rocket Engine Digital Twin", href: "/space/rocket-engine-digital-twin", track: project("rocket_engine_digital_twin") },
    note: "Educational demonstrator · Reference and simulated data · Not a real engine.",
    visual: {
      topic: "engine",
      name: "rocket engine",
      label: "The tutorial's reference liquid rocket engine, cut away to show the injector, the combustion chamber, the cooling channels in its walls, the nozzle, and the turbopumps beside it.",
      caption: "The tutorial's own reference engine, cut away. An educational reference architecture, not a real engine.",
      poster: <EnginePoster />,
    },
  },
  {
    key: "rocket-engine-digital-twin-advanced",
    label: "Physics · Pressure Monitoring · AI/ML · FDIR · Prognostics",
    color: "#F59E0B",
    title: "Advanced Rocket Propulsion Digital Twin",
    progression: ["Understand the Engine", "Engineer the Digital Twin"],
    lead: "Pressure monitoring, fault detection and prognostics for a propulsion system.",
    description: ["Build a physics-based, data-driven and AI/ML-assisted Digital Twin for an end-to-end rocket propulsion system, with a focus on pressure monitoring, fault detection, diagnosis and prognostics."],
    cta: { label: "Explore Advanced Digital Twin", href: "/space/rocket-engine-digital-twin-advanced", track: project("rocket_propulsion_digital_twin_advanced") },
    note: "Advanced educational and research-oriented reference architecture · Simulated data · Not a proprietary or flight engine.",
    visual: {
      topic: "propulsion",
      name: "instrumented engine",
      label: "The same reference engine, cut away, with its chamber and pump-discharge pressure sensors marked and their signal harness running to the engine controller.",
      caption: "Pressure sensors (gold) and their harness to the controller (cyan): the measurements a propulsion Digital Twin is built on.",
      poster: <PropulsionTwinCardVisual className={styles.posterSvg} flowClassName={styles.posterFlow} />,
    },
  },
];

function ApexVisual() {
  const image = apexImage("01");
  return (
    <figure className={styles.visual}>
      <div className={`${styles.frame} ${styles.photoFrame}`}>
        <picture>
          <source type="image/avif" srcSet={imageSrcSet(image, "avif")} sizes="(min-width: 1000px) 640px, 100vw" />
          <source type="image/webp" srcSet={imageSrcSet(image, "webp")} sizes="(min-width: 1000px) 640px, 100vw" />
          {/* APEX's approved photographs ship as pre-sized AVIF, WebP and JPEG sets. */}
          <img src={imageFile(image, 768, "jpg")} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" style={{ objectPosition: image.focus }} />
        </picture>
      </div>
      <div className={styles.visualBar}>
        <figcaption className={styles.caption}>{image.publicCaption} Photograph supplied by APEX.</figcaption>
      </div>
    </figure>
  );
}

export default function TutorialShowcase() {
  return (
    <ol className={styles.showcase}>
      {ITEMS.map((item) => {
        const tint = TINT[item.color] ?? item.color;
        return (
          <li key={item.key} className={styles.row} data-flagship={item.flagship || undefined} style={{ ["--accent" as string]: item.color, ["--accent-text" as string]: tint }}>
            <article className={styles.card} aria-labelledby={`tutorial-${item.key}`}>
              {item.visual === "apex" ? <ApexVisual /> : <ShowcaseVisual {...item.visual} />}
              <div className={styles.content}>
                <span className={styles.label}>{item.label}</span>
                <h3 id={`tutorial-${item.key}`} className={styles.title}>
                  {item.title}
                </h3>
                {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
                {item.progression && (
                  <p className={styles.progression}>
                    <span>{item.progression[0]}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                    <span className={styles.srOnly}>, then </span>
                    <span>{item.progression[1]}</span>
                  </p>
                )}
                <p className={styles.lead}>{item.lead}</p>
                <details className={styles.about}>
                  <summary data-track-event="space_tutorial_about_toggle" data-track-project={item.key}>
                    About this tutorial
                  </summary>
                  {item.description.map((d) => (
                    <p key={d} className={styles.description}>
                      {d}
                    </p>
                  ))}
                </details>
                <div className={styles.actions}>
                  <Link href={item.cta.href} className={styles.cta} {...item.cta.track}>
                    {item.cta.label} {item.cta.href.startsWith("http") ? <ArrowUpRight size={18} aria-hidden /> : <ArrowRight size={18} aria-hidden />}
                  </Link>
                  <p className={styles.note}>{item.note}</p>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
