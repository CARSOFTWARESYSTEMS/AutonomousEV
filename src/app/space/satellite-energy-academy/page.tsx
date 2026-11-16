import Link from "next/link";
import { ArrowRight, BatteryCharging, ChevronRight, FlaskConical, Orbit, Satellite, Sun, ChartNoAxesCombined } from "lucide-react";
import { CAPTURE_THE_SUN, WORLDS } from "@/lib/satellite-energy-academy/content";
import { manrope, inter } from "../fonts";
import SpaceHeader from "../components/SpaceHeader";
import SpaceFooter from "../components/SpaceFooter";
import ShowcaseVisual from "../components/showcase/ShowcaseVisual";
import theme from "../spaceTheme.module.css";
import LessonEngine from "./components/LessonEngine";
import SolarDiagram from "./components/SolarDiagram";
import styles from "./academy.module.css";
export { metadata } from "./seo";

const icons = [Sun, BatteryCharging, Orbit, ChartNoAxesCombined, Satellite, FlaskConical];

export default function SatelliteEnergyAcademy() {
  return <div className={`${theme.theme} ${manrope.variable} ${inter.variable} ${styles.page}`}>
    <a href="#main-content" className={styles.skipLink}>Skip to content</a>
    <SpaceHeader basePath="/space" />
    <main id="main-content" className={styles.container}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/space">Space</Link><ChevronRight size={12} aria-hidden /><Link href="/space#simulations">Tutorials &amp; Simulations</Link><ChevronRight size={12} aria-hidden /><span aria-current="page">Satellite Energy Academy</span></nav>
      <section className={styles.hero} aria-labelledby="academy-title">
        <div>
          <span className={styles.eyebrow}>Satellite Energy Academy</span>
          <h1 id="academy-title">Make Physics &amp; Mathematics Come Alive.</h1>
          <p className={styles.tagline}>Play with Physics. Discover Mathematics. Power a Satellite.</p>
          <p>Explore the universe of energy, electricity, batteries, sunlight and satellite motion. Discover the science, experiment with the mathematics, and solve exciting space missions—all at your own pace.</p>
          <div className={styles.actions}><a href="#capture-the-sun" className={styles.primaryButton}>Start Exploring <ArrowRight size={16} aria-hidden /></a><a href="#learning-worlds" className={styles.button}>Explore Learning Worlds</a></div>
          <small>Beginner friendly · Interactive experiments · Learn by playing</small>
        </div>
        <ShowcaseVisual topic="eps" name="satellite energy" label="An illustrative satellite with solar wings. Drag or use Turn to inspect the spacecraft. The calculation lab below explains how panel orientation changes power." caption="Illustrative spacecraft, not measured data. In the fallback diagram, cyan marks the panel normal; the angle is measured toward the Sun. Explore the calculated model below." poster={<SolarDiagram input={{ ...CAPTURE_THE_SUN.experiment.initial, angleDeg: 30 }} />} animated={false} />
      </section>
      <LessonEngine lesson={CAPTURE_THE_SUN} />
      <section id="learning-worlds" className={styles.section} aria-labelledby="worlds-title">
        <span className={styles.eyebrow}>A universe of ideas</span><h2 id="worlds-title">Six worlds. Begin with one discovery.</h2>
        <p>Start from the beginning, or follow a question that catches your imagination. Capture the Sun is playable now. Other missions and the remaining topics are planned.</p>
        <div className={styles.worldGrid}>{WORLDS.map((world, i) => {
          const Icon = icons[i];
          return <article key={world.id} className={styles.world}>
            <div className={styles.worldHeader}><Icon size={26} aria-hidden /><span className={styles.pill}>{world.playable ? "First mission playable" : "Planned"}</span></div>
            <span className={styles.eyebrow}>World {String(i + 1).padStart(2, "0")}</span><h3>{world.title}</h3><p>{world.description}</p>
            <details className={styles.details}><summary>Explore the learning path</summary><p>{world.topics}</p></details>
            <div className={styles.worldMission}><small>{world.playable ? "Your first mission" : "Planned mission"}</small><p>{world.mission}</p>{world.playable ? <a href="#capture-the-sun" className={styles.primaryButton}>Play Capture the Sun <ArrowRight size={16} aria-hidden /></a> : <small>In development · not yet playable</small>}</div>
          </article>;
        })}</div>
      </section>
      <section className={styles.section} aria-labelledby="path-title"><span className={styles.eyebrow}>Choose your own pace</span><h2 id="path-title">A small question is a great beginning.</h2><div className={styles.pathways}>
        <div className={styles.pathway}><Sun size={24} aria-hidden /><h3>I’m starting from scratch</h3><p>Wonder, discover, then play. Start by turning a panel toward the Sun. Reveal the explanation and mathematics whenever you feel ready.</p><a href="#capture-the-sun">Begin your first mission <ArrowRight size={16} aria-hidden /></a></div>
        <div className={styles.pathway}><FlaskConical size={24} aria-hidden /><h3>I learn by trying things</h3><p>Jump into the lab and select Free Experiment. Make a prediction, change one control, and compare. No scores, timers or required reading.</p><a href="#capture-the-sun">Go to the experiment <ArrowRight size={16} aria-hidden /></a></div>
      </div><p className={styles.caption}>Educational preview · Independent scientific review pending. Planned worlds do not count toward your available-mission progress.</p></section>
    </main>
    <SpaceFooter basePath="/space" />
  </div>;
}
