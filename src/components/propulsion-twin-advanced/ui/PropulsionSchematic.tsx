// Schematic of the reference propulsion system, drawn as inline SVG in the
// manner of a piping and instrumentation diagram. It is the picture of the
// system everywhere the page needs one. No hooks: what is highlighted,
// selected or in alarm is decided by whoever renders it.
//
// Not to scale, and not a drawing of any engine.
import type { KeyboardEvent } from "react";
import type { ChannelId } from "../simulation/channels";
import type { SubsystemId } from "../types";

export const SCHEMATIC_ALT =
  "Schematic of the generic propulsion reference architecture. An oxidiser tank on the left and a fuel tank on the right each feed a pump. A turbine between the pumps, driven by a preburner above it, turns both on one shaft. Oxidiser goes from its pump through the main oxidiser valve to the injector. Fuel goes from its pump through the main fuel valve, around the cooling jacket of the nozzle and chamber, and into the injector. The chamber sits below the injector and opens into a bell nozzle. Fifteen pressure sensors are marked along both paths. Not to scale.";

const C = {
  line: "#6f7b8d",
  strong: "#eef0f3",
  body: "#131822",
  bodyStrong: "#1c2533",
  label: "#98a0ad",
  ox: "#6fb7ff",
  fuel: "#f2b544",
  hot: "#f07a4a",
  coolant: "#5ed3e6",
  data: "#a9cdf7",
  alert: "#f5b041",
} as const;

type Anchor = "start" | "middle" | "end";

/** Where each pressure sensor sits, its tag, and where its tag is written. */
export const SENSOR_NODES: readonly { id: ChannelId; tag: string; x: number; y: number; dx: number; dy: number; anchor: Anchor; sub: SubsystemId }[] = [
  { id: "pTankOx", tag: "PT-OX-01", x: 100, y: 38, dx: 13, dy: 4, anchor: "start", sub: "storage" },
  { id: "pTankFu", tag: "PT-FU-01", x: 740, y: 38, dx: -13, dy: 4, anchor: "end", sub: "storage" },
  { id: "pInOx", tag: "PT-OX-02", x: 130, y: 162, dx: -13, dy: 4, anchor: "end", sub: "feed" },
  { id: "pInFu", tag: "PT-FU-02", x: 710, y: 162, dx: 13, dy: 4, anchor: "start", sub: "feed" },
  { id: "pOutOx", tag: "PT-OX-03", x: 130, y: 240, dx: -13, dy: 4, anchor: "end", sub: "turbomachinery" },
  { id: "pOutFu", tag: "PT-FU-03", x: 710, y: 240, dx: 13, dy: 4, anchor: "start", sub: "turbomachinery" },
  { id: "pInjOx", tag: "PT-OX-04", x: 322, y: 270, dx: 0, dy: -13, anchor: "middle", sub: "injector" },
  { id: "pInjFu", tag: "PT-FU-06", x: 512, y: 270, dx: 13, dy: 4, anchor: "start", sub: "injector" },
  { id: "pCoolOut", tag: "PT-FU-05", x: 512, y: 312, dx: 13, dy: 4, anchor: "start", sub: "cooling" },
  { id: "pCoolIn", tag: "PT-FU-04", x: 606, y: 440, dx: 0, dy: 22, anchor: "middle", sub: "cooling" },
  { id: "pcA", tag: "PT-CH-01A", x: 378, y: 312, dx: -13, dy: 4, anchor: "end", sub: "chamber" },
  { id: "pcB", tag: "PT-CH-01B", x: 420, y: 320, dx: 0, dy: 21, anchor: "middle", sub: "chamber" },
  { id: "pPb", tag: "PT-HG-01", x: 450, y: 100, dx: 13, dy: 4, anchor: "start", sub: "hot_gas" },
  { id: "pTi", tag: "PT-HG-02", x: 420, y: 160, dx: 13, dy: 4, anchor: "start", sub: "hot_gas" },
  { id: "pTo", tag: "PT-HG-03", x: 420, y: 242, dx: 13, dy: 4, anchor: "start", sub: "hot_gas" },
];

export const SENSOR_NODE_BY_ID = Object.fromEntries(SENSOR_NODES.map((n) => [n.id, n])) as Partial<Record<ChannelId, (typeof SENSOR_NODES)[number]>>;

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

/** A valve symbol: two triangles tip to tip. */
function Valve({ x, y, vertical, stroke }: { x: number; y: number; vertical?: boolean; stroke: string }) {
  const d = vertical ? `M${x - 9},${y - 10} L${x + 9},${y - 10} L${x - 9},${y + 10} L${x + 9},${y + 10} Z` : `M${x - 10},${y - 9} L${x - 10},${y + 9} L${x + 10},${y - 9} L${x + 10},${y + 9} Z`;
  return <path d={d} fill={C.body} stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" />;
}

export default function PropulsionSchematic({ className, focus = null, fault = null, selected = null, alerts = [], showSensors = true, onSelectSensor, onSelectSubsystem, flowClassName, describedBy }: SchematicProps) {
  const dim = (...subs: SubsystemId[]) => (focus === null || subs.includes(focus) ? 1 : 0.24);
  const pick = (sub: SubsystemId) => (onSelectSubsystem ? { onClick: () => onSelectSubsystem(sub), style: { cursor: "pointer" } } : {});
  const outline = (sub: SubsystemId) => (fault === sub ? C.alert : C.line);
  const flow = { strokeDasharray: "7 8", className: flowClassName };
  const label = { fill: C.label, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.9 } as const;

  return (
    <svg viewBox="0 0 840 500" className={className} role="img" aria-label={SCHEMATIC_ALT} aria-describedby={describedBy} fontFamily="inherit">
      {/* ── Controls ── */}
      <g opacity={dim("controls")} {...pick("controls")}>
        <rect x={342} y={16} width={156} height={34} rx={5} fill={C.body} stroke={outline("controls")} strokeWidth={1.4} />
        <text x={420} y={37} textAnchor="middle" {...label}>
          ENGINE CONTROLLER
        </text>
        <path d="M420,50 L420,84 M342,33 L250,33 L250,256 M498,33 L590,33 L590,300 L700,300" fill="none" stroke={C.data} strokeWidth={1} strokeDasharray="2 5" opacity={0.7} />
      </g>

      {/* ── Propellant storage ── */}
      <g opacity={dim("storage")} {...pick("storage")}>
        <rect x={60} y={24} width={140} height={64} rx={24} fill={C.body} stroke={outline("storage")} strokeWidth={1.6} />
        <rect x={640} y={24} width={140} height={64} rx={24} fill={C.body} stroke={outline("storage")} strokeWidth={1.6} />
        <path d="M64,54 L196,54" stroke={C.ox} strokeWidth={1} opacity={0.5} />
        <path d="M644,54 L776,54" stroke={C.fuel} strokeWidth={1} opacity={0.5} />
        <text x={130} y={76} textAnchor="middle" {...label}>
          OXIDISER TANK
        </text>
        <text x={710} y={76} textAnchor="middle" {...label}>
          FUEL TANK
        </text>
      </g>

      {/* ── Feed system ── */}
      <g opacity={dim("feed")} {...pick("feed")}>
        <path d="M130,88 L130,176" fill="none" stroke={C.ox} strokeWidth={3.4} />
        <path d="M710,88 L710,176" fill="none" stroke={C.fuel} strokeWidth={3.4} />
        <path d="M130,88 L130,176" fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.5} {...flow} />
        <path d="M710,88 L710,176" fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.5} {...flow} />
        <Valve x={130} y={110} vertical stroke={outline("feed")} />
        <Valve x={710} y={110} vertical stroke={outline("feed")} />
        <rect x={121} y={130} width={18} height={12} fill={C.body} stroke={outline("feed")} strokeWidth={1.2} />
        <rect x={701} y={130} width={18} height={12} fill={C.body} stroke={outline("feed")} strokeWidth={1.2} />
        <path d="M123,136 L137,136 M703,136 L717,136" stroke={C.line} strokeWidth={1} strokeDasharray="2 2" />
        <text x={112} y={114} textAnchor="end" {...label}>
          ISOLATION VALVE
        </text>
        <text x={112} y={140} textAnchor="end" {...label}>
          FILTER
        </text>
      </g>

      {/* ── Hot-gas generation ── */}
      <g opacity={dim("hot_gas")} {...pick("hot_gas")}>
        <path d="M130,252 L190,252 L190,116 L390,116" fill="none" stroke={C.ox} strokeWidth={1.6} opacity={0.75} />
        <path d="M710,252 L650,252 L650,116 L450,116" fill="none" stroke={C.fuel} strokeWidth={1.6} opacity={0.75} />
        <rect x={390} y={88} width={60} height={52} rx={10} fill={C.bodyStrong} stroke={outline("hot_gas")} strokeWidth={1.6} />
        <text x={380} y={104} textAnchor="end" {...label}>
          PREBURNER
        </text>
        <path d="M420,140 L420,180 M420,220 L420,262" fill="none" stroke={C.hot} strokeWidth={4} />
        <path d="M420,140 L420,180 M420,220 L420,262" fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.5} {...flow} />
      </g>

      {/* ── Turbomachinery ── */}
      <g opacity={dim("turbomachinery")} {...pick("turbomachinery")}>
        <path d="M154,200 L686,200" stroke={C.line} strokeWidth={4} />
        <path d="M154,200 L686,200" stroke={C.strong} strokeWidth={1} opacity={0.5} />
        {[280, 560].map((x) => (
          <rect key={x} x={x - 7} y={190} width={14} height={20} rx={3} fill={C.body} stroke={C.line} strokeWidth={1.2} />
        ))}
        <circle cx={130} cy={200} r={24} fill={C.bodyStrong} stroke={outline("turbomachinery")} strokeWidth={1.8} />
        <circle cx={710} cy={200} r={24} fill={C.bodyStrong} stroke={outline("turbomachinery")} strokeWidth={1.8} />
        <path d="M119,188 L147,200 L119,212 Z" fill="none" stroke={C.ox} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M721,188 L693,200 L721,212 Z" fill="none" stroke={C.fuel} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M396,180 L444,180 L454,220 L386,220 Z" fill={C.bodyStrong} stroke={outline("turbomachinery")} strokeWidth={1.8} strokeLinejoin="round" />
        <text x={98} y={204} textAnchor="end" {...label}>
          OX PUMP
        </text>
        <text x={742} y={204} {...label}>
          FUEL PUMP
        </text>
        <text x={378} y={184} textAnchor="end" {...label}>
          TURBINE
        </text>
        <text x={280} y={184} textAnchor="middle" {...label}>
          BEARING
        </text>
        <text x={560} y={184} textAnchor="middle" {...label}>
          SHAFT
        </text>
      </g>

      {/* ── Propellant lines to the injector, with the main valves (controls) ── */}
      <g opacity={dim("feed", "controls", "turbomachinery")}>
        <path d="M130,224 L130,270 L376,270" fill="none" stroke={C.ox} strokeWidth={3.4} />
        <path d="M130,224 L130,270 L376,270" fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.5} {...flow} />
        <path d="M710,224 L710,440 L492,440" fill="none" stroke={C.fuel} strokeWidth={3.4} />
        <path d="M710,224 L710,440 L492,440" fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.5} {...flow} />
        <Valve x={250} y={270} stroke={outline("controls")} />
        <Valve x={710} y={300} vertical stroke={outline("controls")} />
        <text x={250} y={298} textAnchor="middle" {...label}>
          MAIN OX VALVE
        </text>
        <text x={729} y={298} {...label}>
          MAIN FUEL
        </text>
        <text x={729} y={311} {...label}>
          VALVE
        </text>
      </g>

      {/* ── Regenerative cooling ── */}
      <g opacity={dim("cooling")} {...pick("cooling")}>
        <path d="M492,440 L444,364 L472,330 L472,270" fill="none" stroke={outline("cooling") === C.alert ? C.alert : C.coolant} strokeWidth={5} strokeLinejoin="round" opacity={0.9} />
        <path d="M492,440 L444,364 L472,330 L472,270" fill="none" stroke={C.strong} strokeWidth={1.2} opacity={0.6} strokeLinejoin="round" {...flow} />
        <path d="M348,440 L396,364 L368,330 L368,286" fill="none" stroke={C.coolant} strokeWidth={5} strokeLinejoin="round" opacity={0.3} />
        <path d="M472,270 L512,270 M472,312 L512,312" stroke={C.coolant} strokeWidth={1.4} />
        <text x={600} y={424} textAnchor="middle" {...label}>
          COOLING INLET
        </text>
      </g>

      {/* ── Injector, chamber and nozzle ── */}
      <g opacity={dim("injector")} {...pick("injector")}>
        <rect x={376} y={260} width={88} height={18} rx={3} fill={C.bodyStrong} stroke={outline("injector")} strokeWidth={1.8} />
        <text x={420} y={273} textAnchor="middle" {...label} fontSize={9}>
          INJECTOR
        </text>
        {[392, 406, 420, 434, 448].map((x) => (
          <path key={x} d={`M${x},278 L${x},285`} stroke={C.strong} strokeWidth={1.2} opacity={0.7} />
        ))}
      </g>
      <g opacity={dim("chamber")} {...pick("chamber")}>
        <path d="M378,278 L462,278 L462,330 L436,364 L404,364 L378,330 Z" fill={C.body} stroke={outline("chamber")} strokeWidth={1.8} strokeLinejoin="round" />
        <text x={420} y={304} textAnchor="middle" {...label}>
          CHAMBER
        </text>
      </g>
      <g opacity={dim("nozzle")} {...pick("nozzle")}>
        <path d="M404,364 L436,364 L484,452 L356,452 Z" fill={C.body} stroke={outline("nozzle")} strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M392,364 L448,364" stroke={C.strong} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
        <text x={420} y={384} textAnchor="middle" {...label}>
          THROAT
        </text>
        <text x={420} y={436} textAnchor="middle" {...label}>
          NOZZLE
        </text>
        <path d="M376,460 L368,484 M398,460 L394,486 M420,460 L420,488 M442,460 L446,486 M464,460 L472,484" stroke={C.hot} strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />
      </g>

      {/* ── Instrumentation ── */}
      {showSensors && (
        <g opacity={dim("instrumentation", "storage", "feed", "turbomachinery", "hot_gas", "cooling", "injector", "chamber")}>
          {SENSOR_NODES.map((node) => {
            const isSelected = selected === node.id;
            const alert = alerts.includes(node.id);
            const receded = focus !== null && focus !== "instrumentation" && focus !== node.sub;
            const interactive = Boolean(onSelectSensor);
            const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onSelectSensor?.(node.id);
            };
            return (
              <g
                key={node.id}
                opacity={receded ? 0.3 : 1}
                {...(interactive
                  ? { role: "button", tabIndex: 0, "aria-pressed": isSelected, "aria-label": `${node.tag}${alert ? ", outside expectation" : ""}`, onClick: () => onSelectSensor?.(node.id), onKeyDown, style: { cursor: "pointer" } }
                  : { "aria-hidden": true })}
              >
                {/* A generous, invisible target for touch. */}
                <circle cx={node.x} cy={node.y} r={17} fill="transparent" />
                {isSelected && <circle cx={node.x} cy={node.y} r={12} fill="none" stroke={C.strong} strokeWidth={1.4} />}
                {alert ? (
                  // In alarm the marker changes shape as well as colour.
                  <path d={`M${node.x},${node.y - 8} L${node.x + 8},${node.y} L${node.x},${node.y + 8} L${node.x - 8},${node.y} Z`} fill={C.alert} stroke={C.body} strokeWidth={1.4} />
                ) : (
                  <circle cx={node.x} cy={node.y} r={6} fill={isSelected ? C.strong : C.data} stroke={C.body} strokeWidth={1.6} />
                )}
                <text x={node.x + node.dx} y={node.y + node.dy} textAnchor={node.anchor} fill={isSelected || alert ? C.strong : C.label} fontSize={9.5} fontWeight={700} letterSpacing={0.5}>
                  {node.tag}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
