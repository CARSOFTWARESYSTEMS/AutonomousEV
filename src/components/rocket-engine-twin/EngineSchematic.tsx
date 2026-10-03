// Schematic of the reference engine, drawn as inline SVG. It is the picture of
// the engine on the page and in the social image, so it uses plain SVG
// attributes only: no hooks, no stylesheet (the one class it takes animates
// the flow lines on the page).
import { SCHEMATIC_ALT } from "./data/engineReference";
import type { StageView } from "./state/twinStore";
import type { ExplodedLevel, FlowId, SensorId, SystemId } from "./types";

export const DEFAULT_VIEW: StageView = { highlight: null, alert: null, flow: null, cutaway: null, exploded: "assembled", sensors: false, sensor: null, firing: false };

const C = {
  line: "#6f7b8d",
  strong: "#eef3fb",
  body: "#131822",
  bodyStrong: "#222c3b",
  interior: "#07090d",
  label: "#8b95a5",
  oxidiser: "#6fb7ff",
  fuel: "#f2b544",
  hot: "#f07a4a",
  coolant: "#5ed3e6",
  data: "#a9cdf7",
  alert: "#f5b041",
} as const;

type Part = "gimbal" | "feed" | "preburner" | "oxidiserPump" | "fuelPump" | "injector" | "chamber" | "nozzle" | "manifold" | "controller";
type Offset = readonly [number, number];

const AT_REST: Record<Part, Offset> = { gimbal: [0, 0], feed: [0, 0], preburner: [0, 0], oxidiserPump: [0, 0], fuelPump: [0, 0], injector: [0, 0], chamber: [0, 0], nozzle: [0, 0], manifold: [0, 0], controller: [0, 0] };

/** How far each part moves in the exploded views, in drawing units. */
const OFFSETS: Record<ExplodedLevel, Record<Part, Offset>> = {
  assembled: AT_REST,
  assemblies: { ...AT_REST, gimbal: [0, -18], feed: [0, -18], preburner: [0, -18], oxidiserPump: [-26, 0], fuelPump: [26, 0], nozzle: [0, 30], manifold: [0, 30], controller: [-12, 0] },
  components: { gimbal: [0, -40], feed: [0, -30], preburner: [0, -28], oxidiserPump: [-40, -4], fuelPump: [40, -4], injector: [0, -10], chamber: [0, 8], nozzle: [0, 44], manifold: [0, 64], controller: [-20, 14] },
};

const SENSOR_AT: Record<SensorId, Offset> = {
  chamber_pressure: [288, 244],
  turbine_inlet_temperature: [139, 126],
  shaft_speed: [121, 184],
  pump_vibration: [396, 196],
  coolant_outlet_temperature: [192, 206],
  valve_position: [168, 199],
};

const CONTROLLER_PORT: Offset = [128, 353];

const FLOW_PATHS: Record<Exclude<FlowId, "data">, readonly { d: string; color: string }[]> = {
  propellant: [
    { d: "M100,64 L100,138", color: C.oxidiser },
    { d: "M158,212 L178,212 Q192,212 195,198", color: C.oxidiser },
    { d: "M380,64 L380,138", color: C.fuel },
    { d: "M359,234 L359,330", color: C.fuel },
  ],
  cooling: [
    { d: "M359,234 L359,340 C359,430 366,472 352,502", color: C.coolant },
    { d: "M350,506 L130,506", color: C.coolant },
    { d: "M109,562 C146,490 220,410 222,346 C222,324 196.5,316 196.5,292 L196.5,202", color: C.coolant },
    { d: "M371,562 C334,490 260,410 258,346 C258,324 283.5,316 283.5,292 L283.5,202", color: C.coolant },
  ],
  hot_gas: [
    { d: "M214,104 C176,104 140,108 132,138", color: C.hot },
    { d: "M266,104 C304,104 340,108 348,138", color: C.hot },
    { d: "M158,166 L198,180", color: C.hot },
    { d: "M322,166 L282,180", color: C.hot },
    { d: "M240,204 L240,566", color: C.hot },
  ],
};

const round = (n: number) => Math.round(n * 10) / 10;
const translate = ([x, y]: Offset) => (x || y ? `translate(${x} ${y})` : undefined);

interface EngineSchematicProps {
  view?: StageView;
  className?: string;
  /** Class that animates the flow lines; the page supplies it, the social image does not. */
  flowClassName?: string;
  /** Part names drawn on the schematic. */
  labels?: boolean;
  /** Prefix for gradient ids, unique per schematic on a page. */
  idPrefix?: string;
  width?: number;
  height?: number;
}

export default function EngineSchematic({ view = DEFAULT_VIEW, className, flowClassName, labels = true, idPrefix = "engine", width, height }: EngineSchematicProps) {
  const offset = OFFSETS[view.exploded];
  const focused = view.highlight !== null || view.alert !== null;

  const tone = (system: SystemId | readonly SystemId[]) => {
    const systems: readonly SystemId[] = typeof system === "string" ? [system] : system;
    const alert = view.alert !== null && systems.includes(view.alert);
    const active = view.highlight !== null && systems.includes(view.highlight);
    return {
      stroke: alert ? C.alert : active ? C.strong : C.line,
      fill: alert || active ? C.bodyStrong : C.body,
      opacity: focused && !alert && !active ? 0.5 : view.flow ? 0.7 : 1,
      strokeWidth: alert || active ? 2 : 1.5,
    };
  };

  const pipe = (d: string, system: SystemId | readonly SystemId[]) => {
    const t = tone(system);
    return (
      <g key={d} opacity={t.opacity} fill="none" strokeLinecap="round">
        <path d={d} stroke={t.stroke} strokeWidth={8} />
        <path d={d} stroke={C.body} strokeWidth={5} />
      </g>
    );
  };

  const valve = (x: number, y: number, vertical = false) => {
    const t = tone("valves_actuation");
    const d = vertical ? `M${x - 6},${y - 8} L${x + 6},${y - 8} L${x - 6},${y + 8} L${x + 6},${y + 8} Z` : `M${x - 8},${y - 6} L${x - 8},${y + 6} L${x + 8},${y - 6} L${x + 8},${y + 6} Z`;
    return <path d={d} fill={t.fill} stroke={t.stroke} strokeWidth={t.strokeWidth} strokeLinejoin="round" opacity={t.opacity} />;
  };

  const pump = (cx: number, part: "oxidiserPump" | "fuelPump") => {
    const t = tone("turbomachinery");
    const open = view.cutaway === "turbomachinery";
    const blades = (cy: number, r: number, count: number) =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return <line key={i} x1={round(cx + Math.cos(a) * 4)} y1={round(cy + Math.sin(a) * 4)} x2={round(cx + Math.cos(a) * r)} y2={round(cy + Math.sin(a) * r)} stroke={t.stroke} strokeWidth={1.2} />;
      });
    return (
      <g transform={translate(offset[part])} opacity={t.opacity}>
        <rect x={cx - 37} y={138} width={74} height={96} rx={12} fill={open ? C.interior : t.fill} stroke={t.stroke} strokeWidth={t.strokeWidth} />
        <line x1={cx} y1={148} x2={cx} y2={224} stroke={t.stroke} strokeWidth={open ? 3 : 1.5} />
        <circle cx={cx} cy={162} r={15} fill={open ? "rgba(240,122,74,0.22)" : "none"} stroke={open ? C.hot : t.stroke} strokeWidth={1.5} />
        <circle cx={cx} cy={206} r={18} fill={open ? "rgba(111,183,255,0.16)" : "none"} stroke={open ? (part === "fuelPump" ? C.fuel : C.oxidiser) : t.stroke} strokeWidth={1.5} />
        {open && blades(162, 15, 10)}
        {open && blades(206, 18, 7)}
      </g>
    );
  };

  const wall = (part: "chamber" | "nozzle", d: string) => {
    const t = tone(part === "chamber" ? ["combustion", "regenerative_cooling"] : ["nozzle", "regenerative_cooling"]);
    const cooled = view.highlight === "regenerative_cooling" || view.alert === "regenerative_cooling";
    return <path d={d} fill={cooled ? "rgba(94,211,230,0.28)" : t.fill} stroke={t.stroke} strokeWidth={t.strokeWidth} strokeLinejoin="round" />;
  };

  const chamberLit = view.firing || view.flow === "hot_gas" || view.cutaway === "combustion";
  const nozzleLit = view.firing || view.flow === "hot_gas" || view.cutaway === "nozzle";
  const chamberTone = tone(["combustion", "regenerative_cooling"]);
  const nozzleTone = tone(["nozzle", "regenerative_cooling"]);
  const ductOpacity = view.exploded === "assembled" ? 1 : 0.22;

  const dataLines = view.sensor ? [view.sensor] : view.flow === "data" ? (Object.keys(SENSOR_AT) as SensorId[]) : [];
  const flowPaths = view.flow && view.flow !== "data" ? FLOW_PATHS[view.flow] : [];

  const label = (x: number, y: number, text: string, anchor: "start" | "middle" | "end" = "middle") => (
    <text key={text + x} x={x} y={y} textAnchor={anchor} fill={C.label} fontSize={10.5} fontWeight={600} letterSpacing={1.2} fontFamily="inherit">
      {text}
    </text>
  );

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 14 480 610" width={width} height={height} role="img" aria-label={SCHEMATIC_ALT} className={className}>
      <defs>
        <linearGradient id={`${idPrefix}-chamber`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2b8" stopOpacity="0.9" />
          <stop offset="1" stopColor={C.hot} stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-nozzle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.hot} stopOpacity="0.82" />
          <stop offset="1" stopColor={C.hot} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Ducts between the parts. They fade in the exploded views, where the parts no longer meet. */}
      <g opacity={ductOpacity}>
        {pipe("M214,104 C176,104 140,108 132,138", "turbomachinery")}
        {pipe("M266,104 C304,104 340,108 348,138", "turbomachinery")}
        {pipe("M158,166 L198,180", "turbomachinery")}
        {pipe("M322,166 L282,180", "turbomachinery")}
        {pipe("M158,212 L178,212 Q192,212 195,198", "propellant_feed")}
        {pipe("M359,234 L359,340 C359,430 366,472 352,502", "regenerative_cooling")}
        {valve(168, 212)}
        {valve(359, 282, true)}
      </g>

      {/* Gimbal mount */}
      <g transform={translate(offset.gimbal)} opacity={tone("valves_actuation").opacity}>
        <rect x={204} y={62} width={72} height={10} rx={3} fill={tone("valves_actuation").fill} stroke={tone("valves_actuation").stroke} strokeWidth={tone("valves_actuation").strokeWidth} />
        <circle cx={240} cy={78} r={5} fill={tone("valves_actuation").fill} stroke={tone("valves_actuation").stroke} strokeWidth={tone("valves_actuation").strokeWidth} />
      </g>

      {/* Inlet ducts */}
      <g transform={translate(offset.feed)}>
        {pipe("M100,64 L100,138", "propellant_feed")}
        {pipe("M380,64 L380,138", "propellant_feed")}
      </g>

      {/* Preburner */}
      <g transform={translate(offset.preburner)} opacity={tone("turbomachinery").opacity}>
        <rect x={214} y={84} width={52} height={44} rx={14} fill={tone("turbomachinery").fill} stroke={tone("turbomachinery").stroke} strokeWidth={tone("turbomachinery").strokeWidth} />
      </g>

      {pump(121, "oxidiserPump")}
      {pump(359, "fuelPump")}

      {/* Injector head */}
      <g transform={translate(offset.injector)} opacity={tone("combustion").opacity}>
        <path d="M196,196 L196,176 Q240,150 284,176 L284,196 Z" fill={tone("combustion").fill} stroke={tone("combustion").stroke} strokeWidth={tone("combustion").strokeWidth} strokeLinejoin="round" />
      </g>

      {/* Combustion chamber: gas side, then the cooled wall on either side */}
      <g transform={translate(offset.chamber)} opacity={chamberTone.opacity}>
        <path d="M201,196 L279,196 L279,290 C279,313 254,322 254,346 L226,346 C226,322 201,313 201,290 Z" fill={chamberLit ? `url(#${idPrefix}-chamber)` : C.interior} />
        {wall("chamber", "M192,196 L192,292 C192,318 218,326 218,346 L226,346 C226,322 201,313 201,290 L201,196 Z")}
        {wall("chamber", "M288,196 L288,292 C288,318 262,326 262,346 L254,346 C254,322 279,313 279,290 L279,196 Z")}
        {view.cutaway === "combustion" && [210, 220, 230, 240, 250, 260, 270].map((x, i) => <line key={x} x1={x} y1={198} x2={x} y2={210} stroke={i % 2 ? C.fuel : C.oxidiser} strokeWidth={2} strokeLinecap="round" />)}
      </g>

      {/* Nozzle */}
      <g transform={translate(offset.nozzle)} opacity={nozzleTone.opacity}>
        <path d="M226,346 L254,346 C257,410 328,492 364,566 L116,566 C152,492 223,410 226,346 Z" fill={nozzleLit ? `url(#${idPrefix}-nozzle)` : C.interior} />
        {wall("nozzle", "M218,346 C216,410 140,490 102,566 L116,566 C152,492 223,410 226,346 Z")}
        {wall("nozzle", "M262,346 C264,410 340,490 378,566 L364,566 C328,492 257,410 254,346 Z")}
        {(view.highlight === "nozzle" || view.cutaway === "nozzle") && <line x1={222} y1={346} x2={258} y2={346} stroke={C.strong} strokeWidth={1.5} strokeDasharray="3 3" />}
        {view.cutaway === "nozzle" &&
          ["M240,352 L240,560", "M236,352 C232,420 190,500 170,560", "M244,352 C248,420 290,500 310,560"].map((d) => <path key={d} d={d} fill="none" stroke={C.strong} strokeOpacity={0.5} strokeWidth={1.2} strokeDasharray="5 6" />)}
      </g>

      {/* Coolant manifold */}
      <g transform={translate(offset.manifold)} opacity={tone("regenerative_cooling").opacity}>
        <rect x={124} y={500} width={232} height={13} rx={6.5} fill={tone("regenerative_cooling").fill} stroke={tone("regenerative_cooling").stroke} strokeWidth={tone("regenerative_cooling").strokeWidth} />
      </g>

      {/* Engine controller */}
      <g transform={translate(offset.controller)} opacity={tone("engine_control").opacity}>
        <rect x={56} y={330} width={72} height={46} rx={6} fill={tone("engine_control").fill} stroke={tone("engine_control").stroke} strokeWidth={tone("engine_control").strokeWidth} />
        <line x1={68} y1={345} x2={116} y2={345} stroke={tone("engine_control").stroke} strokeWidth={1.2} />
        <line x1={68} y1={353} x2={104} y2={353} stroke={tone("engine_control").stroke} strokeWidth={1.2} />
        <line x1={68} y1={361} x2={110} y2={361} stroke={tone("engine_control").stroke} strokeWidth={1.2} />
      </g>

      {/* Flows */}
      {flowPaths.map((flow) => (
        <path key={flow.d} d={flow.d} fill="none" stroke={flow.color} strokeWidth={3} strokeLinecap="round" strokeDasharray="7 8" className={flowClassName} />
      ))}
      {dataLines.map((id) => (
        <line key={id} x1={SENSOR_AT[id][0]} y1={SENSOR_AT[id][1]} x2={CONTROLLER_PORT[0]} y2={CONTROLLER_PORT[1]} stroke={C.data} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="4 6" className={flowClassName} />
      ))}
      {view.flow === "data" &&
        [
          [168, 218],
          [352, 284],
        ].map(([x, y]) => <line key={x} x1={CONTROLLER_PORT[0]} y1={CONTROLLER_PORT[1] + 10} x2={x} y2={y} stroke={C.data} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="1 6" />)}

      {/* Sensors */}
      {view.sensors &&
        (Object.keys(SENSOR_AT) as SensorId[]).map((id) => {
          const [x, y] = SENSOR_AT[id];
          const active = view.sensor === id;
          const t = tone("instrumentation");
          return (
            <g key={id} opacity={view.sensor && !active ? 0.45 : 1}>
              {active && <circle cx={x} cy={y} r={10} fill="none" stroke={C.data} strokeWidth={1.4} />}
              <circle cx={x} cy={y} r={4.5} fill={active ? C.data : C.body} stroke={active ? C.data : t.stroke === C.line ? C.data : t.stroke} strokeWidth={1.6} />
            </g>
          );
        })}

      {labels && view.exploded === "assembled" && (
        <g aria-hidden="true">
          {label(100, 52, "OXIDISER")}
          {label(380, 52, "FUEL")}
          {label(240, 146, "PREBURNER")}
          {label(121, 252, "TURBOPUMP")}
          {label(359, 252, "TURBOPUMP")}
          {label(240, 187, "INJECTOR")}
          {label(184, 300, "CHAMBER", "end")}
          {label(274, 350, "THROAT", "start")}
          {label(150, 474, "NOZZLE", "end")}
          {label(116, 510, "MANIFOLD", "end")}
          {label(92, 394, "CONTROLLER")}
          {label(284, 71, "GIMBAL", "start")}
        </g>
      )}
    </svg>
  );
}
