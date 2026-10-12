"use client";
// Schematic of the reference propulsion system, drawn as inline SVG in the
// manner of a piping and instrumentation diagram. It is the picture of the
// system everywhere the page needs one. What is highlighted, selected or in
// alarm is decided by whoever renders it.
//
// It is drawn in one of two arrangements, chosen by the room it is given: a
// landscape one, and a portrait one for a phone. In both, lettering is sized in
// screen pixels, not drawing units, so a label is as readable in a 300 px
// column as it is across a desktop.
//
// Not to scale, and not a drawing of any engine.
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { ChannelId } from "../simulation/channels";
import type { SubsystemId } from "../types";
import css from "../advancedTwin.module.css";

export const SCHEMATIC_ALT =
  "Schematic of the generic propulsion reference architecture. An oxidiser tank on the left and a fuel tank on the right each feed their own turbopump: a pump and a turbine on one shaft. A single preburner between them supplies hot gas to both turbines, and the turbine exhaust goes on to the injector. Oxidiser goes from its pump through the main oxidiser valve to the injector. Fuel goes from its pump through the main fuel valve, around the cooling jacket of the nozzle and chamber, and into the injector. The chamber sits below the injector and opens into a bell nozzle. Fifteen pressure sensors are marked along both paths. Not to scale.";

/** The one place the drawing and the model differ, said wherever the drawing is shown. */
export const SHAFT_NOTE = "The drawing shows two turbopumps, as the 3D model does. The reduced-order model behind the numbers lumps both shafts into one shaft-speed state.";

const C = {
  line: "#6f7b8d",
  strong: "#eef0f3",
  body: "#131822",
  bodyStrong: "#1c2533",
  label: "#b3bac6",
  ox: "#6fb7ff",
  fuel: "#f2b544",
  hot: "#f07a4a",
  coolant: "#5ed3e6",
  data: "#a9cdf7",
  alert: "#f5b041",
} as const;

type Anchor = "start" | "middle" | "end";
type Fluid = "ox" | "fuel" | "hot" | "coolant";

type Part =
  | { t: "pipe"; fluid: Fluid; d: string; thin?: boolean; faint?: boolean }
  | { t: "data"; d: string }
  | { t: "shaft"; d: string }
  | { t: "rect"; x: number; y: number; w: number; h: number; r?: number; strong?: boolean }
  | { t: "poly"; d: string; strong?: boolean }
  | { t: "pump"; x: number; y: number; r: number; fluid: Fluid; toward: 1 | -1 }
  | { t: "valve"; x: number; y: number; vertical?: boolean }
  | { t: "label"; x: number; y: number; text: string; anchor?: Anchor };

export interface SensorNode {
  id: ChannelId;
  tag: string;
  x: number;
  y: number;
  sub: SubsystemId;
  /** Which side of the marker its tag is written on when it is shown. */
  side: "above" | "below" | "left" | "right";
}

interface Layout {
  id: "wide" | "compact";
  width: number;
  height: number;
  /** Lettering size in drawing units: the smallest the arrangement is drawn with, and the largest it has room for. */
  font: readonly [number, number];
  /** The controller box, where a selected sensor's signal is drawn to. */
  controller: readonly [x: number, y: number];
  /** Drawn in this order, one group per subsystem. */
  groups: readonly { sub: SubsystemId; also?: readonly SubsystemId[]; parts: readonly Part[] }[];
  sensors: readonly SensorNode[];
}

// ── Landscape ───────────────────────────────────────────────────────────────

const WIDE: Layout = {
  id: "wide",
  width: 840,
  height: 524,
  font: [13, 17.5],
  controller: [420, 46],
  groups: [
    {
      sub: "controls",
      parts: [
        { t: "data", d: "M420,46 L420,92 M300,28 L4,28 L4,340 L216,340 M540,28 L836,28 L836,410 L704,410" },
        { t: "rect", x: 300, y: 10, w: 240, h: 36, r: 5 },
        { t: "label", x: 420, y: 34, text: "ENGINE CONTROLLER", anchor: "middle" },
      ],
    },
    {
      sub: "storage",
      parts: [
        { t: "rect", x: 60, y: 64, w: 180, h: 56, r: 26 },
        { t: "rect", x: 600, y: 64, w: 180, h: 56, r: 26 },
        { t: "label", x: 150, y: 98, text: "OXIDISER TANK", anchor: "middle" },
        { t: "label", x: 690, y: 98, text: "FUEL TANK", anchor: "middle" },
      ],
    },
    {
      sub: "feed",
      parts: [
        { t: "pipe", fluid: "ox", d: "M150,120 L150,236" },
        { t: "pipe", fluid: "fuel", d: "M690,120 L690,236" },
        { t: "valve", x: 150, y: 150, vertical: true },
        { t: "valve", x: 690, y: 150, vertical: true },
        { t: "rect", x: 141, y: 172, w: 18, h: 12 },
        { t: "rect", x: 681, y: 172, w: 18, h: 12 },
      ],
    },
    {
      sub: "hot_gas",
      parts: [
        { t: "pipe", fluid: "ox", thin: true, d: "M150,296 L196,296 L196,116 L350,116" },
        { t: "pipe", fluid: "fuel", thin: true, d: "M690,296 L644,296 L644,116 L490,116" },
        { t: "pipe", fluid: "hot", d: "M420,140 L420,180 M270,180 L570,180 M270,180 L270,242 M570,180 L570,242" },
        { t: "pipe", fluid: "hot", d: "M270,282 L270,306 L400,306 L400,328 M570,282 L570,306 L440,306 L440,328" },
        { t: "rect", x: 350, y: 92, w: 140, h: 48, r: 10, strong: true },
        { t: "label", x: 420, y: 122, text: "PREBURNER", anchor: "middle" },
      ],
    },
    {
      sub: "turbomachinery",
      parts: [
        { t: "shaft", d: "M176,262 L250,262 M590,262 L664,262" },
        { t: "pump", x: 150, y: 262, r: 26, fluid: "ox", toward: 1 },
        { t: "pump", x: 690, y: 262, r: 26, fluid: "fuel", toward: -1 },
        { t: "poly", d: "M256,242 L284,242 L292,282 L248,282 Z", strong: true },
        { t: "poly", d: "M556,242 L584,242 L592,282 L548,282 Z", strong: true },
        { t: "label", x: 116, y: 268, text: "OX PUMP", anchor: "end" },
        { t: "label", x: 722, y: 268, text: "FUEL PUMP" },
        { t: "label", x: 302, y: 268, text: "TURBINE" },
        { t: "label", x: 538, y: 268, text: "TURBINE", anchor: "end" },
      ],
    },
    {
      // The main propellant lines carry the main valves, which belong to the controls.
      sub: "feed",
      also: ["controls", "turbomachinery"],
      parts: [
        { t: "pipe", fluid: "ox", d: "M150,288 L150,340 L360,340" },
        { t: "pipe", fluid: "fuel", d: "M690,288 L690,480 L488,480" },
        { t: "valve", x: 230, y: 340 },
        { t: "valve", x: 690, y: 410, vertical: true },
        { t: "label", x: 230, y: 374, text: "MAIN OX VALVE", anchor: "middle" },
        { t: "label", x: 672, y: 416, text: "MAIN FUEL VALVE", anchor: "end" },
      ],
    },
    {
      sub: "cooling",
      parts: [
        { t: "pipe", fluid: "coolant", faint: true, d: "M352,480 L392,428 L362,398 L362,356" },
        { t: "pipe", fluid: "coolant", d: "M488,480 L448,428 L478,398 L478,372 L590,372 L590,340 L480,340" },
        { t: "label", x: 512, y: 452, text: "COOLING JACKET" },
      ],
    },
    {
      sub: "injector",
      parts: [
        { t: "rect", x: 360, y: 328, w: 120, h: 24, r: 3, strong: true },
        { t: "label", x: 420, y: 346, text: "INJECTOR", anchor: "middle" },
      ],
    },
    {
      sub: "chamber",
      parts: [
        { t: "poly", d: "M370,352 L470,352 L470,400 L440,430 L400,430 L370,400 Z" },
        { t: "label", x: 420, y: 380, text: "CHAMBER", anchor: "middle" },
      ],
    },
    {
      sub: "nozzle",
      parts: [
        { t: "poly", d: "M400,430 L440,430 L494,510 L346,510 Z" },
        { t: "label", x: 420, y: 496, text: "NOZZLE", anchor: "middle" },
      ],
    },
  ],
  sensors: [
    { id: "pTankOx", tag: "PT-OX-01", x: 96, y: 64, sub: "storage", side: "above" },
    { id: "pTankFu", tag: "PT-FU-01", x: 744, y: 64, sub: "storage", side: "above" },
    { id: "pInOx", tag: "PT-OX-02", x: 150, y: 210, sub: "feed", side: "left" },
    { id: "pInFu", tag: "PT-FU-02", x: 690, y: 210, sub: "feed", side: "right" },
    { id: "pOutOx", tag: "PT-OX-03", x: 150, y: 318, sub: "turbomachinery", side: "left" },
    { id: "pOutFu", tag: "PT-FU-03", x: 690, y: 330, sub: "turbomachinery", side: "right" },
    { id: "pInjOx", tag: "PT-OX-04", x: 300, y: 340, sub: "injector", side: "below" },
    { id: "pInjFu", tag: "PT-FU-06", x: 512, y: 340, sub: "injector", side: "above" },
    { id: "pCoolOut", tag: "PT-FU-05", x: 590, y: 372, sub: "cooling", side: "right" },
    { id: "pCoolIn", tag: "PT-FU-04", x: 600, y: 480, sub: "cooling", side: "below" },
    { id: "pcA", tag: "PT-CH-01A", x: 370, y: 398, sub: "chamber", side: "left" },
    { id: "pcB", tag: "PT-CH-01B", x: 470, y: 398, sub: "chamber", side: "right" },
    { id: "pPb", tag: "PT-HG-01", x: 490, y: 104, sub: "hot_gas", side: "right" },
    { id: "pTi", tag: "PT-HG-02", x: 420, y: 180, sub: "hot_gas", side: "below" },
    { id: "pTo", tag: "PT-HG-03", x: 570, y: 296, sub: "hot_gas", side: "right" },
  ],
};

// ── Portrait ────────────────────────────────────────────────────────────────
// The same system for a narrow column. To keep every marker a comfortable
// distance from the next, the preburner's own feed lines and the command lines
// to the main valves are left out, and the labels are shorter.

const COMPACT: Layout = {
  id: "compact",
  width: 360,
  height: 590,
  font: [11, 14],
  controller: [180, 36],
  groups: [
    {
      sub: "controls",
      parts: [
        { t: "data", d: "M180,36 L180,112" },
        { t: "rect", x: 110, y: 8, w: 140, h: 28, r: 5 },
        { t: "label", x: 180, y: 27, text: "CONTROLLER", anchor: "middle" },
      ],
    },
    {
      sub: "storage",
      parts: [
        { t: "rect", x: 16, y: 52, w: 120, h: 48, r: 22 },
        { t: "rect", x: 224, y: 52, w: 120, h: 48, r: 22 },
        { t: "label", x: 76, y: 81, text: "OX TANK", anchor: "middle" },
        { t: "label", x: 284, y: 81, text: "FUEL TANK", anchor: "middle" },
      ],
    },
    {
      sub: "feed",
      parts: [
        { t: "pipe", fluid: "ox", d: "M60,100 L60,200" },
        { t: "pipe", fluid: "fuel", d: "M300,100 L300,200" },
        { t: "valve", x: 60, y: 124, vertical: true },
        { t: "valve", x: 300, y: 124, vertical: true },
      ],
    },
    {
      sub: "hot_gas",
      parts: [
        { t: "pipe", fluid: "hot", d: "M180,150 L180,178 M118,178 L242,178 M118,178 L118,206 M242,178 L242,206" },
        { t: "pipe", fluid: "hot", d: "M118,238 L118,286 L165,286 L165,318 M242,238 L242,286 L195,286 L195,318" },
        { t: "rect", x: 130, y: 112, w: 100, h: 38, r: 9, strong: true },
        { t: "label", x: 180, y: 136, text: "PREBURNER", anchor: "middle" },
      ],
    },
    {
      sub: "turbomachinery",
      parts: [
        { t: "shaft", d: "M82,222 L103,222 M257,222 L278,222" },
        { t: "pump", x: 60, y: 222, r: 22, fluid: "ox", toward: 1 },
        { t: "pump", x: 300, y: 222, r: 22, fluid: "fuel", toward: -1 },
        { t: "poly", d: "M106,206 L130,206 L136,238 L100,238 Z", strong: true },
        { t: "poly", d: "M230,206 L254,206 L260,238 L224,238 Z", strong: true },
        { t: "label", x: 72, y: 193, text: "PUMP" },
        { t: "label", x: 288, y: 193, text: "PUMP", anchor: "end" },
        { t: "label", x: 180, y: 227, text: "TURBINES", anchor: "middle" },
      ],
    },
    {
      sub: "feed",
      also: ["controls", "turbomachinery"],
      parts: [
        { t: "pipe", fluid: "ox", d: "M60,244 L60,330 L130,330" },
        { t: "pipe", fluid: "fuel", d: "M300,244 L300,562 L260,562" },
        { t: "valve", x: 60, y: 304, vertical: true },
        { t: "valve", x: 300, y: 304, vertical: true },
        { t: "label", x: 74, y: 309, text: "VALVE" },
        { t: "label", x: 286, y: 309, text: "VALVE", anchor: "end" },
      ],
    },
    {
      sub: "cooling",
      parts: [
        { t: "pipe", fluid: "coolant", faint: true, d: "M100,562 L154,434 L132,406 L132,356" },
        { t: "pipe", fluid: "coolant", d: "M260,562 L206,434 L228,406 L228,378 L286,378 L286,330 L230,330" },
        { t: "label", x: 124, y: 478, text: "COOLING", anchor: "end" },
        { t: "label", x: 124, y: 496, text: "JACKET", anchor: "end" },
      ],
    },
    {
      sub: "injector",
      parts: [
        { t: "rect", x: 130, y: 318, w: 100, h: 24, r: 3, strong: true },
        { t: "label", x: 180, y: 335, text: "INJECTOR", anchor: "middle" },
      ],
    },
    {
      sub: "chamber",
      parts: [
        { t: "poly", d: "M140,342 L220,342 L220,404 L198,432 L162,432 L140,404 Z" },
        { t: "label", x: 180, y: 372, text: "CHAMBER", anchor: "middle" },
      ],
    },
    {
      sub: "nozzle",
      parts: [
        { t: "poly", d: "M162,432 L198,432 L252,560 L108,560 Z" },
        { t: "label", x: 180, y: 542, text: "NOZZLE", anchor: "middle" },
      ],
    },
  ],
  sensors: [
    { id: "pTankOx", tag: "PT-OX-01", x: 40, y: 52, sub: "storage", side: "above" },
    { id: "pTankFu", tag: "PT-FU-01", x: 320, y: 52, sub: "storage", side: "above" },
    { id: "pInOx", tag: "PT-OX-02", x: 60, y: 160, sub: "feed", side: "right" },
    { id: "pInFu", tag: "PT-FU-02", x: 300, y: 160, sub: "feed", side: "left" },
    { id: "pOutOx", tag: "PT-OX-03", x: 60, y: 270, sub: "turbomachinery", side: "right" },
    { id: "pOutFu", tag: "PT-FU-03", x: 300, y: 270, sub: "turbomachinery", side: "left" },
    { id: "pInjOx", tag: "PT-OX-04", x: 100, y: 330, sub: "injector", side: "below" },
    { id: "pInjFu", tag: "PT-FU-06", x: 250, y: 330, sub: "injector", side: "above" },
    { id: "pCoolOut", tag: "PT-FU-05", x: 286, y: 378, sub: "cooling", side: "below" },
    { id: "pCoolIn", tag: "PT-FU-04", x: 300, y: 500, sub: "cooling", side: "left" },
    { id: "pcA", tag: "PT-CH-01A", x: 140, y: 392, sub: "chamber", side: "left" },
    { id: "pcB", tag: "PT-CH-01B", x: 220, y: 394, sub: "chamber", side: "below" },
    { id: "pPb", tag: "PT-HG-01", x: 230, y: 124, sub: "hot_gas", side: "right" },
    { id: "pTi", tag: "PT-HG-02", x: 180, y: 178, sub: "hot_gas", side: "below" },
    { id: "pTo", tag: "PT-HG-03", x: 242, y: 262, sub: "hot_gas", side: "left" },
  ],
};

export const SCHEMATIC_LAYOUTS = { wide: WIDE, compact: COMPACT } as const;
/** The tags of the fifteen pressure sensors, which are the same in both arrangements. */
export const SENSOR_NODES: readonly SensorNode[] = WIDE.sensors;

/**
 * Narrower than this, in CSS pixels, the portrait arrangement is drawn. It is the width at which the landscape
 * one's largest lettering is still 11 px on screen: 11 / 17.5 of its drawn width.
 */
export const COMPACT_BELOW = 528;
/** The portrait arrangement is never drawn wider than this: the stylesheet caps it at the same figure. */
export const COMPACT_MAX = 440;
/** Lettering height on screen, in CSS pixels. */
const TEXT_PX = 11;
/** Half the side of a comfortable touch target, in CSS pixels. */
const TOUCH_PX = 22;

/** How far a marker's touch target may reach before it meets its neighbour's, in drawing units. */
function reach(layout: Layout, node: SensorNode): number {
  let nearest = Infinity;
  for (const other of layout.sensors) if (other !== node) nearest = Math.min(nearest, Math.hypot(other.x - node.x, other.y - node.y));
  return nearest / 2;
}

interface SchematicProps {
  className?: string;
  /** A subsystem to bring forward: the rest recedes. */
  focus?: SubsystemId | null;
  /** A subsystem carrying a fault: outlined in the caution colour, with a marker. */
  fault?: SubsystemId | null;
  selected?: ChannelId | null;
  /** Sensors whose reading has left its expectation. */
  alerts?: readonly ChannelId[];
  showSensors?: boolean;
  onSelectSensor?: (id: ChannelId) => void;
  onSelectSubsystem?: (id: SubsystemId) => void;
  /** Class that animates the flow lines; omitted where nothing should move. */
  flowClassName?: string;
  describedBy?: string;
}

const FLUID = { ox: C.ox, fuel: C.fuel, hot: C.hot, coolant: C.coolant } as const;

export default function PropulsionSchematic(props: SchematicProps) {
  const frame = useRef<HTMLDivElement>(null);
  // Before it is measured, both arrangements are in the document and the stylesheet shows the one that fits, so the
  // right picture is there before any script runs and nothing moves when it does. Afterwards only one is drawn.
  const [box, setBox] = useState<{ width: number | null } | null>(null);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () => setBox({ width: element.clientWidth || null });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const chosen = box === null ? null : box.width !== null && box.width < COMPACT_BELOW ? COMPACT : WIDE;
  return (
    <div ref={frame} className={`${css.schematicFrame} ${props.className ?? ""}`}>
      {(chosen ? [chosen] : [WIDE, COMPACT]).map((layout) => (
        <div key={layout.id} className={css.schematicBox} data-arrangement={layout.id} data-chosen={chosen ? "" : undefined}>
          <Drawing {...props} layout={layout} scale={chosen && box?.width ? Math.min(box.width, layout === COMPACT ? COMPACT_MAX : Infinity) / layout.width : null} />
        </div>
      ))}
    </div>
  );
}

function Drawing({ layout, scale: measured, focus = null, fault = null, selected = null, alerts = [], showSensors = true, onSelectSensor, onSelectSubsystem, flowClassName, describedBy }: SchematicProps & { layout: Layout; scale: number | null }) {
  // Unmeasured, lettering is drawn at the size that suits the narrowest box this arrangement is used in.
  const scale = measured ?? TEXT_PX / layout.font[1];
  const font = Math.min(layout.font[1], Math.max(layout.font[0], TEXT_PX / scale));
  const interactive = Boolean(onSelectSensor);

  const dim = (...subs: SubsystemId[]) => (focus === null || subs.includes(focus) ? 1 : 0.24);
  const pick = (sub: SubsystemId) => (onSelectSubsystem ? { onClick: () => onSelectSubsystem(sub), style: { cursor: "pointer" } } : {});
  const outline = (sub: SubsystemId) => (fault === sub ? C.alert : C.line);
  const label = { fill: C.label, fontSize: font, fontWeight: 600, letterSpacing: font * 0.06 } as const;

  const draw = (part: Part, sub: SubsystemId, key: number) => {
    switch (part.t) {
      case "pipe": {
        const colour = part.fluid === "coolant" && fault === "cooling" && !part.faint ? C.alert : FLUID[part.fluid];
        if (part.thin) return <path key={key} d={part.d} fill="none" stroke={colour} strokeWidth={1.8} opacity={0.8} />;
        return (
          <g key={key}>
            <path d={part.d} fill="none" stroke={colour} strokeWidth={part.fluid === "coolant" ? 5 : 3.6} strokeLinejoin="round" opacity={part.faint ? 0.3 : 0.95} />
            {!part.faint && <path d={part.d} fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.5} strokeLinejoin="round" strokeDasharray="7 8" className={flowClassName} />}
          </g>
        );
      }
      case "data":
        return <path key={key} d={part.d} fill="none" stroke={C.data} strokeWidth={1.1} strokeDasharray="2 5" opacity={0.75} />;
      case "shaft":
        return (
          <g key={key}>
            <path d={part.d} stroke={C.line} strokeWidth={5} />
            <path d={part.d} stroke={C.strong} strokeWidth={1} opacity={0.5} />
          </g>
        );
      case "rect":
        return <rect key={key} x={part.x} y={part.y} width={part.w} height={part.h} rx={part.r ?? 0} fill={part.strong ? C.bodyStrong : C.body} stroke={outline(sub)} strokeWidth={1.7} />;
      case "poly":
        return <path key={key} d={part.d} fill={part.strong ? C.bodyStrong : C.body} stroke={outline(sub)} strokeWidth={1.8} strokeLinejoin="round" />;
      case "pump": {
        const a = part.r * 0.42;
        const tip = part.x + part.toward * part.r * 0.62;
        const back = part.x - part.toward * a;
        return (
          <g key={key}>
            <circle cx={part.x} cy={part.y} r={part.r} fill={C.bodyStrong} stroke={outline(sub)} strokeWidth={1.8} />
            <path d={`M${back},${part.y - a * 1.1} L${tip},${part.y} L${back},${part.y + a * 1.1} Z`} fill="none" stroke={FLUID[part.fluid]} strokeWidth={1.6} strokeLinejoin="round" />
          </g>
        );
      }
      case "valve": {
        const { x, y } = part;
        const d = part.vertical ? `M${x - 9},${y - 10} L${x + 9},${y - 10} L${x - 9},${y + 10} L${x + 9},${y + 10} Z` : `M${x - 10},${y - 9} L${x - 10},${y + 9} L${x + 10},${y - 9} L${x + 10},${y + 9} Z`;
        return <path key={key} d={d} fill={C.body} stroke={outline("controls")} strokeWidth={1.6} strokeLinejoin="round" />;
      }
      case "label":
        return (
          <text key={key} x={part.x} y={part.y} textAnchor={part.anchor ?? "start"} {...label}>
            {part.text}
          </text>
        );
    }
  };

  const chosen = selected ? layout.sensors.find((n) => n.id === selected) : undefined;
  const marker = Math.max(6.5, 5 / scale);

  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} width="100%" height="100%" role={interactive ? "group" : "img"} aria-label={interactive ? "Pressure sensors on the propulsion schematic. Select one to see its measurement." : SCHEMATIC_ALT} aria-describedby={describedBy} fontFamily="inherit" style={{ display: "block" }}>
      {layout.groups.map((group, g) => (
        <g key={g} opacity={dim(group.sub, ...(group.also ?? []))} {...(group.also ? {} : pick(group.sub))}>
          {group.parts.map((part, i) => draw(part, group.sub, i))}
        </g>
      ))}

      {/* The selected sensor's signal, from the transducer to the controller and the twin. */}
      {showSensors && chosen && <path d={`M${chosen.x},${chosen.y} L${layout.controller[0]},${layout.controller[1]}`} fill="none" stroke={C.strong} strokeWidth={1.4} strokeDasharray="3 4" opacity={0.85} data-signal-path={chosen.id} />}

      {showSensors && (
        <g opacity={dim("instrumentation", "storage", "feed", "turbomachinery", "hot_gas", "cooling", "injector", "chamber")}>
          {layout.sensors.map((node) => {
            const isSelected = selected === node.id;
            const alert = alerts.includes(node.id);
            const receded = focus !== null && focus !== "instrumentation" && focus !== node.sub;
            const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onSelectSensor?.(node.id);
            };
            const gap = marker + font * 0.7;
            const at = node.side === "above" ? { x: node.x, y: node.y - gap, anchor: "middle" as const } : node.side === "below" ? { x: node.x, y: node.y + gap + font * 0.7, anchor: "middle" as const } : node.side === "left" ? { x: node.x - gap, y: node.y + font * 0.35, anchor: "end" as const } : { x: node.x + gap, y: node.y + font * 0.35, anchor: "start" as const };
            return (
              <g
                key={node.id}
                opacity={receded ? 0.3 : 1}
                data-sensor={node.id}
                {...(interactive
                  ? { role: "button", tabIndex: 0, "aria-pressed": isSelected, "aria-label": `${node.tag}${alert ? ", outside expectation" : ""}`, onClick: () => onSelectSensor?.(node.id), onKeyDown, style: { cursor: "pointer" } }
                  : { "aria-hidden": true })}
              >
                {/* An invisible target for a fingertip: as large as 44 px, or as far as the neighbouring marker allows. */}
                {interactive && <circle cx={node.x} cy={node.y} r={Math.max(marker, Math.min(TOUCH_PX / scale, reach(layout, node)))} fill="transparent" />}
                {isSelected && <circle cx={node.x} cy={node.y} r={marker + 5} fill="none" stroke={C.strong} strokeWidth={1.6} />}
                {alert ? (
                  // In alarm the marker changes shape as well as colour.
                  <path d={`M${node.x},${node.y - marker - 2} L${node.x + marker + 2},${node.y} L${node.x},${node.y + marker + 2} L${node.x - marker - 2},${node.y} Z`} fill={C.alert} stroke={C.body} strokeWidth={1.4} />
                ) : (
                  <circle cx={node.x} cy={node.y} r={marker} fill={isSelected ? C.strong : C.data} stroke={C.body} strokeWidth={1.6} />
                )}
                {/* Fifteen tags would not be readable at once: the tag is written for the sensor that is selected or in alarm. */}
                {(isSelected || alert) && (
                  <text x={at.x} y={at.y} textAnchor={at.anchor} fill={C.strong} fontSize={font} fontWeight={700} letterSpacing={font * 0.04} stroke={C.body} strokeWidth={font * 0.3} paintOrder="stroke">
                    {node.tag}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
);
}
