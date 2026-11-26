"use client";
// What is in an electrified road, and the part each element plays when a car
// charges on it — with the present values of the road model's inputs. In the
// guided tour the list steps through itself; any item can be chosen.
import { useCallback, useState } from "react";
import { useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { guideClock } from "../story/guide";
import { fmt } from "../ui/controls";
import lab from "./lab.module.css";

interface Part {
  title: string;
  text: (r: ReturnType<typeof useTwin.getState>["road"]) => string;
}

const PARTS: Part[] = [
  { title: "Wearing course", text: () => "About 40 mm of asphalt. Non-magnetic and non-conductive, so the 85 kHz field passes through it to the receiver." },
  { title: "Transmitter pad module", text: (r) => `A precast module 30 mm below the surface: resin cover, a ${r.segmentTurns}-turn Litz winding ⌀ ${fmt(r.segmentDiameter * 1000, 0)} mm, ferrite bars beneath. One every ${fmt(r.segmentDiameter + r.segmentSpacing, 2)} m.` },
  { title: "Feeder cable", text: (r) => `Carries each pad's ${fmt(r.primaryCurrent, 0)} A RMS, ${fmt(r.frequency / 1000, 1)} kHz drive from the roadside controller (orange).` },
  { title: "Duct bank", text: () => "Three power ducts and one communication duct on a sand bed along the shoulder, feeding every controller." },
  { title: "Segment controller", text: () => "Roadside cabinets with the high-frequency inverters and pad switches. A pad is energised only when requested — then soft-started and soft-stopped." },
  { title: "Position sensing", text: (r) => `The controller acts on an estimate of where the receiver is: ${fmt(r.controllerLatency * 1000, 0)} ms late, σ ${fmt(r.positionNoise * 1000, 0)} mm, ${r.handover.replace(/-/g, " ")} handover.` },
  { title: "Safety interlock", text: () => "Independent of the request: a pad may energise only while the vehicle body covers it, the vehicle is authorised and the supply is healthy." },
  { title: "Receiver on the vehicle", text: (r) => `${fmt(r.airGap * 1000, 0)} mm above the road windings, ${fmt(r.lateral * 1000, 0)} mm off centre. ${fmt(r.coverage * 100, 0)} % of this route is electrified.` },
];

export function RoadAnatomy() {
  const road = useTwin((s) => s.road);
  const guided = useTwin((s) => s.guide.active && s.guide.stageId === "road-cutaway" && s.camera.mode === "guided");
  const [chosen, setChosen] = useState<number | null>(null);
  const read = useCallback(() => Math.floor(guideClock.elapsed / 2.6) % PARTS.length, []);
  const auto = useSampled(read, 4);
  const active = chosen ?? (guided ? auto : -1);
  return (
    <div className={lab.hud} aria-label="What is in the road">
      <p className={lab.legendEyebrow}>Inside the electrified road</p>
      <ol className={lab.anatomy}>
        {PARTS.map((p, i) => (
          <li key={p.title} data-active={i === active || undefined}>
            <button type="button" aria-expanded={i === active} onClick={() => setChosen(i === chosen ? null : i)}>
              <span className={lab.anatomyNo}>{i + 1}</span>
              <span className={lab.anatomyTitle}>{p.title}</span>
            </button>
            {i === active && <p>{p.text(road)}</p>}
          </li>
        ))}
      </ol>
      <p className={lab.legendFoot}>Layer depths are representative, not a pavement design. Only the pads, their controllers and their coupling are simulated.</p>
    </div>
  );
}
