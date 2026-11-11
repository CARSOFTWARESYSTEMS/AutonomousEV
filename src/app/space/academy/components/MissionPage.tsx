import Link from "next/link";
import { manrope, inter } from "../../fonts";
import spaceTheme from "../../spaceTheme.module.css";
import space from "../../space.module.css";
import { JsonLd } from "@/lib/structured-data/JsonLd";
import lab from "@/components/space-academy/lab/lab.module.css";
import { trackBySlug } from "../data/curriculum";
import { missionBySlug } from "../data/missions";
import { DISCLAIMERS, SAFETY_PRINCIPLES } from "../data/programme";
import { missionGraph } from "../seo";

/**
 * The frame around a mission: no site header, footer or breadcrumb, because
 * the Mission Lab is a focused, full-screen player with its own Exit. Each
 * route passes its own mission component as children, so a page's bundle
 * carries only its own mission.
 */
export default function MissionPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  const mission = missionBySlug(slug);
  if (!mission) throw new Error(`Unknown mission: ${slug}`);
  return (
    <div className={`${spaceTheme.theme} ${manrope.variable} ${inter.variable}`}>
      <JsonLd data={missionGraph(mission)} />
      <a href="#main-content" className={space.skipLink}>
        Skip to the mission
      </a>
      {children}
    </div>
  );
}

/**
 * "About this mission", shown in the lab's info dialog. Rendered on the
 * server, so the mission's description, concepts and every notice are in
 * the page's HTML for search engines and for reading without JavaScript.
 */
export function MissionInfo({ slug }: { slug: string }) {
  const mission = missionBySlug(slug);
  if (!mission) throw new Error(`Unknown mission: ${slug}`);
  const track = trackBySlug(mission.track);
  const rocketry = mission.track === "model-rocketry";
  return (
    <div className={lab.info}>
      <p>{mission.summary}</p>
      <section aria-labelledby={`${slug}-you-will`}>
        <h3 id={`${slug}-you-will`}>You will</h3>
        <ul>
          {mission.youWill.map((y) => (
            <li key={y}>{y}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="mission-concepts">
        <h3 id="mission-concepts">Concepts in this mission</h3>
        <ul>
          {mission.concepts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>
      {track && (
        <p>
          Part of the <Link href={`/space/academy/${track.slug}`}>{track.title} track</Link>, with its course description and a lesson plan for each age level.
        </p>
      )}
      <section aria-labelledby="mission-model">
        <h3 id="mission-model">About the model</h3>
        <p>
          An educational simulation, not a validated engineering tool. The physics is real but simplified and the numbers are illustrative values chosen for learning; each step says what it leaves out. Do not use it to design real flight hardware.
        </p>
      </section>
      <section id="notices" aria-labelledby="notices-title">
        <h3 id="notices-title">Independence, safety and privacy</h3>
        <ul>
          <li>{DISCLAIMERS.simulated}</li>
          <li>
            {DISCLAIMERS.privacy} {DISCLAIMERS.signIn}
          </li>
          <li>{DISCLAIMERS.independence}</li>
          <li>{DISCLAIMERS.eligibility}</li>
          <li>{DISCLAIMERS.ages}</li>
          {rocketry && SAFETY_PRINCIPLES.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>
      <p>
        <Link href="/space/academy">Space Academy</Link> · <Link href="/space">Space portal</Link>
      </p>
    </div>
  );
}
