"use client";
import { useState, type ComponentType } from "react";
import { Orbit, Zap, Link2, Wind, Thermometer, Clock, Network, Siren, PencilRuler, FlaskConical, ArrowRight, type LucideIcon } from "lucide-react";
import { FullScreenShell } from "./mobile";
import {
  LazyOrbitSimulator,
  LazyPowerSimulator,
  LazyDockingSimulator,
  LazyECLSSSimulator,
  LazyThermalSimulator,
  LazyCrewDaySimulator,
  LazyStationDigitalTwin,
  LazyFailureSimulator,
  LazyStationDesigner,
  LazyExperimentDesigner,
} from "./Lazy";
import styles from "../station.module.css";

export const SIMULATORS: { id: string; title: string; purpose: string; icon: LucideIcon; Component: ComponentType }[] = [
  { id: "orbit", title: "Orbit", purpose: "Period, velocity, eclipse, drag and ground track for a circular orbit.", icon: Orbit, Component: LazyOrbitSimulator },
  { id: "power", title: "Power", purpose: "Solar generation, battery charge and load shedding over one orbit.", icon: Zap, Component: LazyPowerSimulator },
  { id: "docking", title: "Docking", purpose: "Fly a rendezvous from 3 km to hatch opening inside the approach corridor.", icon: Link2, Component: LazyDockingSimulator },
  { id: "life-support", title: "Life Support", purpose: "Oxygen, water, CO₂ and resupply mass for a crew and mission.", icon: Wind, Component: LazyECLSSSimulator },
  { id: "thermal", title: "Thermal", purpose: "Heat loads and the radiator area needed to reject them in vacuum.", icon: Thermometer, Component: LazyThermalSimulator },
  { id: "crew-day", title: "Crew Day", purpose: "A generic 24-hour schedule for four mission profiles.", icon: Clock, Component: LazyCrewDaySimulator },
  { id: "digital-twin", title: "Digital Twin", purpose: "Inject failures and watch them cascade through station systems.", icon: Network, Component: LazyStationDigitalTwin },
  { id: "failure-lab", title: "Failure Lab", purpose: "How a station detects, isolates and recovers from emergencies.", icon: Siren, Component: LazyFailureSimulator },
  { id: "designer", title: "Station Designer", purpose: "Choose a mission and sketch a conceptual station architecture.", icon: PencilRuler, Component: LazyStationDesigner },
  { id: "experiment", title: "Experiment Designer", purpose: "Plan a microgravity experiment from concept to data analysis.", icon: FlaskConical, Component: LazyExperimentDesigner },
];

/** Phone launcher: pick a simulator, run it full screen, come back to the lab. */
export default function SimulationLab() {
  const [open, setOpen] = useState<string | null>(null);
  const sim = SIMULATORS.find((s) => s.id === open);
  return (
    <>
      <ul className={styles.launcher} aria-label="Simulators">
        {SIMULATORS.map(({ id, title, purpose, icon: Icon }) => (
          <li key={id}>
            <button type="button" onClick={() => setOpen(id)} aria-label={`Open ${title} simulator`}>
              <Icon size={22} aria-hidden="true" />
              <b>{title}</b>
              <span>{purpose}</span>
              <em>
                Open <ArrowRight size={14} aria-hidden="true" />
              </em>
            </button>
          </li>
        ))}
      </ul>
      <FullScreenShell open={!!sim} onClose={() => setOpen(null)} title={sim ? `${sim.title} simulator` : ""} purpose={sim?.purpose} backLabel="Simulation Lab">
        {sim && <sim.Component />}
      </FullScreenShell>
    </>
  );
}
