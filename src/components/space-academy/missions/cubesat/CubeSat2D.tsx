// The 2D fallback: a front cutaway of the same 1U CubeSat, drawn from the
// same layout as the 3D model (front and back panels left off so the stack
// is visible). Also what the server renders before the 3D view loads.
import { PARTS, type PartId, type SolarId } from "./model";
import { LAYOUT } from "./layout";
import type { Scene2DState } from "../../viewer/controller";

const S = 10; // px per cm
const Y = (cm: number) => -cm * S;

interface Props extends Scene2DState {
  installed: PartId[];
  ghost: PartId | null;
  selected: PartId | null;
  solar: SolarId;
  onSelect?: (id: PartId) => void;
}

const BOARD = { w: 86, h: 3 };

const SHORT: Record<PartId, string> = {
  frame: "Frame",
  payload: "Camera",
  battery: "Battery",
  eps: "Power board",
  obc: "Computer",
  radio: "Radio",
  adcs: "ADCS",
  panels: "Solar panels",
  antenna: "Antenna",
};

function partY(id: PartId, exploded: boolean) {
  return (exploded ? LAYOUT[id].exploded : LAYOUT[id].pos)[1];
}

export default function CubeSat2D({ installed, ghost, selected, solar, exploded, labels, compact, onSelect }: Props) {
  const visible = new Set<PartId>(["frame", ...installed]);
  const out = exploded ? 45 : 0;
  const style = (id: PartId) => ({
    opacity: visible.has(id) ? 1 : ghost === id ? 0.35 : 0,
    cursor: onSelect && visible.has(id) ? "pointer" : undefined,
  });
  const stroke = (id: PartId) => (selected === id ? "#fcd34d" : ghost === id ? "#93c5fd" : "none");
  const click = (id: PartId) => (onSelect && visible.has(id) ? () => onSelect(id) : undefined);

  const board = (id: PartId, children?: React.ReactNode) => {
    const y = Y(partY(id, exploded));
    return (
      <g key={id} style={style(id)} onClick={click(id)}>
        <rect x={-BOARD.w / 2} y={y - BOARD.h / 2} width={BOARD.w} height={BOARD.h} rx={1} fill="#17603f" stroke={stroke(id)} strokeWidth={2} />
        <g transform={`translate(0 ${y})`}>{children}</g>
      </g>
    );
  };

  const labelRows: { id: PartId; y: number }[] = (["adcs", "radio", "obc", "eps", "battery", "payload"] as PartId[])
    .filter((id) => visible.has(id) || ghost === id)
    .map((id) => ({ id, y: Y(partY(id, exploded)) }));
  const showLabel = (id: PartId) => labels && (!compact || selected === id || ghost === id);

  return (
    <svg viewBox="-260 -215 520 400" role="img" aria-label={`Front cutaway of the 1U CubeSat${exploded ? ", exploded" : ""}. Installed: ${[...visible].map((id) => PARTS[id].name).join(", ")}.`}>
      {/* Wings in the plane of the front panel, seen face-on. */}
      {solar === "wings" && visible.has("panels") && (
        <g style={style("panels")} onClick={click("panels")}>
          {[-1, 1].map((side) => (
            <g key={side}>
              <rect x={side > 0 ? 50 + out * 1.6 : -140 - out * 1.6} y={-45} width={90} height={90} rx={2} fill="#1f2533" fillOpacity={0.7} stroke={stroke("panels")} strokeWidth={2} />
              <rect x={side > 0 ? 54 + out * 1.6 : -136 - out * 1.6} y={-41} width={39} height={82} fill="#1e3a8a" fillOpacity={0.6} />
              <rect x={side > 0 ? 97 + out * 1.6 : -93 - out * 1.6} y={-41} width={39} height={82} fill="#1e3a8a" fillOpacity={0.6} />
            </g>
          ))}
        </g>
      )}
      {/* Frame */}
      <g style={style("frame")} onClick={click("frame")}>
        <rect x={-50} y={-50} width={8} height={100} fill="#b6bcc6" stroke={stroke("frame")} strokeWidth={2} />
        <rect x={42} y={-50} width={8} height={100} fill="#b6bcc6" stroke={stroke("frame")} strokeWidth={2} />
        <rect x={-50} y={-50} width={100} height={5} fill="#b6bcc6" />
        <rect x={-50} y={45} width={100} height={5} fill="#b6bcc6" />
      </g>
      {/* Side panels (±X), seen edge-on */}
      <g style={style("panels")} onClick={click("panels")}>
        <rect x={-54 - out} y={-45} width={3} height={90} fill="#1e3a8a" stroke={stroke("panels")} strokeWidth={2} />
        <rect x={51 + out} y={-45} width={3} height={90} fill="#1e3a8a" stroke={stroke("panels")} strokeWidth={2} />
      </g>
      {board("payload", (
        <>
          <rect x={-18} y={1.5} width={36} height={16} fill="#16181d" />
          <rect x={-11} y={17.5} width={22} height={10} fill="#0f172a" />
          <rect x={-7.5} y={26.5} width={15} height={2} fill="#2563eb" />
        </>
      ))}
      {board("battery", <rect x={-35} y={-18} width={70} height={17} rx={8} fill="#3b4252" />)}
      {board("eps", (
        <>
          <rect x={-28} y={-6.5} width={16} height={5} fill="#1b1d22" />
          <rect x={12} y={-5} width={12} height={3.5} fill="#1b1d22" />
        </>
      ))}
      {board("obc", <rect x={-11} y={-4.5} width={22} height={3} fill="#101114" />)}
      {board("radio", <rect x={-31} y={-6.5} width={50} height={5} fill="#a3a9b3" />)}
      {board("adcs", (
        <>
          <rect x={-30} y={-8} width={60} height={7} rx={3.5} fill="#b87740" />
        </>
      ))}
      {/* Antenna on top */}
      <g style={style("antenna")} onClick={click("antenna")}>
        <rect x={-43} y={Y(partY("antenna", exploded)) - 2} width={86} height={4} fill="#2b2f3a" stroke={stroke("antenna")} strokeWidth={2} />
        <line x1={-43} x2={-193} y1={Y(partY("antenna", exploded)) - 2} y2={Y(partY("antenna", exploded)) - 2} stroke="#e5e7eb" strokeWidth={1.5} />
        <line x1={43} x2={193} y1={Y(partY("antenna", exploded)) - 2} y2={Y(partY("antenna", exploded)) - 2} stroke="#e5e7eb" strokeWidth={1.5} />
      </g>
      {/* Labels on the right, with leaders, kept at least 17 units apart. */}
      {labelRows.filter((r) => showLabel(r.id)).map((r, i, rows) => {
        const ly = Math.max(r.y, i > 0 ? rows[i - 1].y + 17 : -Infinity);
        const lx = exploded ? 112 : 66;
        return (
          <g key={r.id} aria-hidden="true">
            <line x1={44} x2={lx - 4} y1={r.y} y2={ly} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
            <text x={lx} y={ly} dy="0.35em" fontSize={14} fill={selected === r.id ? "#fcd34d" : ghost === r.id ? "#93c5fd" : "#e6e8f5"} fontWeight={700} paintOrder="stroke" stroke="#070917" strokeWidth={3}>
              {SHORT[r.id]}
            </text>
          </g>
        );
      })}
      {showLabel("panels") && visible.has("panels") && (
        <text x={0} y={172} textAnchor="middle" fontSize={14} fill={selected === "panels" ? "#fcd34d" : "#c3c6d8"} fontWeight={600} aria-hidden="true">
          Solar panels{solar === "wings" ? " and wings" : ""} · front and back panels hidden in this cutaway
        </text>
      )}
      {showLabel("antenna") && visible.has("antenna") && (
        <text x={0} y={Y(partY("antenna", exploded)) - 12} textAnchor="middle" fontSize={14} fill={selected === "antenna" ? "#fcd34d" : "#e6e8f5"} fontWeight={700} aria-hidden="true">
          Antenna (shown open)
        </text>
      )}
    </svg>
  );
}
