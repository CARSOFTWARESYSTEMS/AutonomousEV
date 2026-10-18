"use client";
// 2D schematics: the series string of cell groups with the BMS, and a side view
// of the generic scooter. They stand in for the 3D view on phones and wherever
// WebGL cannot run, and every group is reachable from the keyboard.
import { ARCHITECTURES } from "@/data/ev-battery-toolkit/architectures";
import { formatNumber } from "@/lib/ev-battery-toolkit/provenance";
import { sensorGroups, type SimulationResult } from "@/lib/ev-battery-toolkit/simulation";
import type { ArchitectureId, BatteryPack } from "@/lib/ev-battery-toolkit/types";
import { COLOR, thermalColor, voltageColor } from "../scene/palette";
import type { ViewMode } from "../state/store";
import css from "../workspace.module.css";

export function PackSchematic({
  pack,
  sim,
  view,
  highlightGroup,
  onGroup,
  title,
}: {
  pack: BatteryPack;
  sim: SimulationResult;
  view: ViewMode;
  highlightGroup: number | null;
  onGroup?: (g: number) => void;
  title: string;
}) {
  const s = sim.snapshot;
  const n = pack.series;
  const cell = 30;
  const gap = 6;
  const moduleGap = 14;
  const left = 70;
  const moduleOf = (g: number) => {
    let acc = 0;
    for (let m = 0; m < pack.groupsPerModule.length; m++) {
      acc += pack.groupsPerModule[m];
      if (g < acc) return m;
    }
    return pack.groupsPerModule.length - 1;
  };
  const xOf = (g: number) => left + g * (cell + gap) + moduleOf(g) * moduleGap;
  const width = xOf(n - 1) + cell + 80;
  const avg = s.groupVoltages.reduce((a, b) => a + b, 0) / Math.max(1, n);
  const sensors = sensorGroups(n);
  const fill = (g: number) => {
    if (highlightGroup === g) return COLOR.highlight;
    if (view === "thermal") return thermalColor(s.groupTemps[g]);
    if (view === "voltage") return voltageColor((s.groupVoltages[g] - avg) * 1000);
    return pack.config.chemistry === "LFP" ? COLOR.cellLFP : COLOR.cellNMC;
  };

  return (
    <figure className={css.schematic}>
      <svg viewBox={`0 0 ${width} 230`} role="group" aria-label={title}>
        <text x={12} y={70} className={css.svgLabel}>
          + / −
        </text>
        {pack.groupsPerModule.map((count, m) => {
          const first = pack.groupsPerModule.slice(0, m).reduce((a, b) => a + b, 0);
          const x = xOf(first) - 6;
          const w = xOf(first + count - 1) + cell + 6 - x;
          return (
            <g key={m}>
              <rect x={x} y={22} width={w} height={96} rx={6} className={css.svgModule} />
              <text x={x + 6} y={16} className={css.svgLabel}>
                Module {m + 1}
              </text>
            </g>
          );
        })}
        {s.groupVoltages.map((v, g) => (
          <g
            key={g}
            role={onGroup ? "button" : undefined}
            tabIndex={onGroup ? 0 : undefined}
            aria-label={`Group ${g + 1}: ${formatNumber(v, "V", 3)}, ${formatNumber(s.groupTemps[g], "°C", 1)}`}
            aria-pressed={onGroup ? highlightGroup === g : undefined}
            className={onGroup ? css.svgGroup : undefined}
            onClick={onGroup ? () => onGroup(g) : undefined}
            onKeyDown={
              onGroup
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onGroup(g);
                    }
                  }
                : undefined
            }
          >
            <rect x={xOf(g)} y={30} width={cell} height={80} rx={4} fill={fill(g)} stroke={highlightGroup === g ? "#fff" : "#0b1020"} strokeWidth={highlightGroup === g ? 2 : 1} />
            <text x={xOf(g) + cell / 2} y={74} textAnchor="middle" className={css.svgGroupText}>
              {g + 1}
            </text>
            {g < n - 1 ? <line x1={xOf(g) + cell} y1={40} x2={xOf(g + 1)} y2={40} className={css.svgBus} /> : null}
            <line x1={xOf(g) + cell / 2} y1={110} x2={xOf(g) + cell / 2} y2={150} className={view === "bms" ? css.svgSenseBright : css.svgSense} />
          </g>
        ))}
        {sensors.map((g, ch) => (
          <circle key={ch} cx={xOf(g) + cell / 2} cy={122} r={5} fill={s.failedSensors.includes(ch) ? COLOR.fault : COLOR.sensor}>
            <title>{`Temperature channel ${ch + 1}${s.failedSensors.includes(ch) ? " (implausible)" : ""}`}</title>
          </circle>
        ))}
        <rect x={left} y={150} width={xOf(n - 1) + cell - left} height={34} rx={6} className={view === "bms" ? css.svgBmsBright : css.svgBms} />
        <text x={left + 10} y={172} className={css.svgLabel}>
          BMS — voltage sense · temperature · current · balancing · protection · {Object.entries(s.comms).map(([k, v]) => `${k} ${v}`).join(" · ")}
        </text>
        <rect x={12} y={150} width={44} height={34} rx={5} className={css.svgFuse} />
        <text x={34} y={171} textAnchor="middle" className={css.svgLabel}>
          Fuse
        </text>
        <text x={left} y={212} className={css.svgNote}>
          {pack.series}S{pack.parallel}P · {pack.modules} module{pack.modules > 1 ? "s" : ""} · SIMULATED values
        </text>
      </svg>
    </figure>
  );
}

const LOCATION_BOX: Record<ArchitectureId, { x: number; y: number; w: number; h: number }> = {
  "fixed-floor": { x: 200, y: 168, w: 150, h: 30 },
  swappable: { x: 92, y: 96, w: 66, h: 84 },
  "serviceable-pack": { x: 188, y: 162, w: 130, h: 42 },
};

export function ScooterSchematic({ architecture, located, title }: { architecture: ArchitectureId | null; located: boolean; title: string }) {
  const box = architecture ? LOCATION_BOX[architecture] : null;
  return (
    <figure className={css.schematic}>
      <svg viewBox="0 0 480 260" role="img" aria-label={title}>
        <line x1={10} y1={240} x2={470} y2={240} className={css.svgGround} />
        <circle cx={90} cy={205} r={34} className={css.svgWheel} />
        <circle cx={400} cy={205} r={34} className={css.svgWheel} />
        <path d="M40 172 Q60 110 120 104 L200 104 L208 160 L350 160 L372 66 L392 66 L410 172 Z" className={located ? css.svgBodyXray : css.svgBody} />
        <rect x={60} y={86} width={130} height={16} rx={8} className={located ? css.svgBodyXray : css.svgSeat} />
        <line x1={384} y1={70} x2={404} y2={186} className={css.svgFork} />
        <line x1={360} y1={52} x2={404} y2={52} className={css.svgFork} />
        {box ? (
          <g>
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={5} className={located ? css.svgBatteryOn : css.svgBattery} />
            {located ? (
              <text x={box.x + box.w / 2} y={box.y - 8} textAnchor="middle" className={css.svgLabel}>
                {ARCHITECTURES[architecture!].name}
              </text>
            ) : null}
          </g>
        ) : null}
        <text x={12} y={22} className={css.svgNote}>
          Generic scooter schematic — not OEM geometry
        </text>
      </svg>
    </figure>
  );
}
