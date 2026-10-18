"use client";
// The BMS Digital Twin: the signal chain from cells to the vehicle controller,
// the simulated BMS fields, and a "Why?" for abnormal values that points at
// the cell group or sensor behind them — in the 3D view and in the bar chart.
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { formatNumber, formatSourced } from "@/lib/ev-battery-toolkit/provenance";
import type { CommInterface, Provenance } from "@/lib/ev-battery-toolkit/types";
import { useSimulation, useToolkit, type ViewMode } from "../state/store";
import { COLOR, voltageColor } from "../scene/palette";
import { ContextBanner, ProvenanceBadge } from "../ui/Badges";
import css from "../toolkit.module.css";

const CHAIN = ["Cells", "Voltage Sense", "Temperature Sense", "Current Sense", "BMS MCU", "Balancing", "Protection", "Communication", "Vehicle Controller"];

interface Why {
  id: string;
  text: string;
  group: number | null;
  view: ViewMode;
}

function Row({ label, value, provenance, explanation, active, onWhy }: { label: string; value: string; provenance: Provenance; explanation?: Why | null; active?: boolean; onWhy?: (w: Why) => void }) {
  return (
    <tr data-abnormal={explanation ? "" : undefined}>
      <th scope="row">{label}</th>
      <td>{value}</td>
      <td>
        <ProvenanceBadge provenance={provenance} />
      </td>
      <td>
        {explanation && onWhy ? (
          <button type="button" className={css.whyButton} aria-pressed={active} onClick={() => onWhy(explanation)}>
            WHY?
          </button>
        ) : null}
      </td>
    </tr>
  );
}

export default function BmsTwin() {
  const { result } = useSimulation();
  const s = result.snapshot;
  const setHighlightGroup = useToolkit((st) => st.setHighlightGroup);
  const setView = useToolkit((st) => st.setView);
  const highlightGroup = useToolkit((st) => st.highlightGroup);
  const [iface, setIface] = useState<CommInterface>("CAN");
  const [why, setWhy] = useState<Why | null>(null);
  const offline = s.bmsState.value === "OFFLINE";

  const lowest = s.groupVoltages.reduce((b, v, g) => (v < s.groupVoltages[b] ? g : b), 0);
  const highest = s.groupVoltages.reduce((b, v, g) => (v > s.groupVoltages[b] ? g : b), 0);
  const hottest = s.groupTemps.reduce((b, t, g) => (t > s.groupTemps[b] ? g : b), 0);

  const explain = (w: Why) => {
    setWhy(w);
    setHighlightGroup(w.group);
    setView(w.view);
    if (w.view === "bms") trackToolkit("bms_view_opened");
    if (w.view === "thermal") trackToolkit("thermal_view_opened");
    if (w.view === "voltage") trackToolkit("cell_view_opened");
  };

  const delta = s.cellDeltaMv.value;
  const whyFor: Record<string, Why | null> = {
    delta:
      delta !== null && delta >= 30
        ? { id: "delta", group: s.weakGroup ?? lowest, view: "voltage", text: `High cell delta: group ${lowest + 1} sits at ${formatNumber(s.groupVoltages[lowest], "V", 3)} while group ${highest + 1} is at ${formatNumber(s.groupVoltages[highest], "V", 3)}. The low group reaches its limit first, so the BMS cuts discharge early.` }
        : null,
    maxTemp:
      s.tempSpread.value !== null && s.tempSpread.value >= 5
        ? { id: "maxTemp", group: s.hotGroup ?? hottest, view: "thermal", text: `Temperature spread: the hottest region is around group ${hottest + 1}. Check for a high-resistance joint, a weak cell or poor thermal-interface contact there.` }
        : null,
    sensor: s.failedSensors.length ? { id: "sensor", group: null, view: "bms", text: "A temperature channel reads an implausible value (an open or shorted sensor). The BMS cannot trust it, so it blocks charging." } : null,
    paths:
      s.chargeEnabled.value === false || s.dischargeEnabled.value === false
        ? { id: "paths", group: s.weakGroup, view: "bms", text: `The BMS has switched off ${[s.chargeEnabled.value === false && "charging", s.dischargeEnabled.value === false && "discharging"].filter(Boolean).join(" and ")} to protect the pack. Find the condition behind it before resetting anything.` }
        : null,
    comms: Object.values(s.comms).some((l) => l !== "ONLINE") ? { id: "comms", group: null, view: "bms", text: `Communication: ${Object.entries(s.comms).map(([k, v]) => `${k} ${v}`).join(", ")}. Check the harness, connectors and the BMS node.` } : null,
  };

  const vmin = Math.min(...s.groupVoltages);
  const vmax = Math.max(...s.groupVoltages);
  const span = Math.max(0.02, vmax - vmin);
  const avg = s.groupVoltages.reduce((a, b) => a + b, 0) / Math.max(1, s.groupVoltages.length);

  return (
    <div className={css.bms}>
      <ContextBanner context="simulation" />
      <ol className={css.chain} aria-label="BMS signal chain">
        {CHAIN.map((node, i) => (
          <li key={node}>
            <span className={css.chainNode} data-down={offline && i >= 4 ? "" : undefined}>
              {node}
            </span>
            {i < CHAIN.length - 1 ? <ArrowRight size={14} aria-hidden="true" className={css.chainArrow} /> : null}
          </li>
        ))}
      </ol>

      <div className={css.bmsLayout}>
        <div>
          <table className={css.bmsTable}>
            <caption>Simulated BMS data</caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Value</th>
                <th scope="col">Origin</th>
                <th scope="col">
                  <span className={css.srOnly}>Explanation</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <Row label="Pack Voltage" value={formatSourced(s.packVoltage, 1)} provenance={s.packVoltage.provenance} />
              <Row label="Pack Current" value={formatSourced(s.packCurrent, 1)} provenance={s.packCurrent.provenance} />
              <Row label="SOC" value={formatSourced(s.soc)} provenance={s.soc.provenance} />
              <Row label="SOH" value={formatSourced(s.soh)} provenance={s.soh.provenance} />
              <Row label="Maximum Cell Voltage" value={formatSourced(s.maxCellV, 3)} provenance={s.maxCellV.provenance} />
              <Row label="Minimum Cell Voltage" value={formatSourced(s.minCellV, 3)} provenance={s.minCellV.provenance} />
              <Row label="Cell Delta" value={formatSourced(s.cellDeltaMv)} provenance={s.cellDeltaMv.provenance} explanation={whyFor.delta} active={why?.id === "delta"} onWhy={explain} />
              <Row label="Average Cell Voltage" value={formatSourced(s.avgCellV, 3)} provenance={s.avgCellV.provenance} />
              <Row label="Maximum Temperature" value={formatSourced(s.maxTemp, 1)} provenance={s.maxTemp.provenance} explanation={whyFor.maxTemp} active={why?.id === "maxTemp"} onWhy={explain} />
              <Row label="Minimum Temperature" value={formatSourced(s.minTemp, 1)} provenance={s.minTemp.provenance} explanation={whyFor.sensor} active={why?.id === "sensor"} onWhy={explain} />
              <Row label="Temperature Spread" value={formatSourced(s.tempSpread, 1)} provenance={s.tempSpread.provenance} />
              <Row label="Charge State" value={formatSourced(s.chargeEnabled)} provenance={s.chargeEnabled.provenance} explanation={whyFor.paths} active={why?.id === "paths"} onWhy={explain} />
              <Row label="Discharge State" value={formatSourced(s.dischargeEnabled)} provenance={s.dischargeEnabled.provenance} />
              <Row label="BMS State" value={formatSourced(s.bmsState)} provenance={s.bmsState.provenance} />
              <Row label="Fault Status" value={formatSourced(s.faultCodes)} provenance={s.faultCodes.provenance} />
              <Row label="Communication State" value={Object.entries(s.comms).map(([k, v]) => `${k} ${v}`).join(" · ")} provenance="SIMULATED" explanation={whyFor.comms} active={why?.id === "comms"} onWhy={explain} />
            </tbody>
          </table>
          <p className={css.fine}>Fault codes are the toolkit&apos;s own illustrative codes (SIM-…), not any manufacturer&apos;s code set.</p>
        </div>

        <div className={css.bmsSide}>
          <div className={css.ifaceTabs} role="tablist" aria-label="Simulated interface">
            {(["CAN", "UART", "BLE"] as const).map((i) => (
              <button key={i} type="button" role="tab" aria-selected={iface === i} className={css.ifaceTab} onClick={() => setIface(i)}>
                {i}
              </button>
            ))}
          </div>
          <div className={css.ifacePanel} role="tabpanel" aria-label={`${iface} link`}>
            <p>
              Link: <strong data-link={s.comms[iface]}>{s.comms[iface]}</strong> <ProvenanceBadge provenance="SIMULATED" />
            </p>
            <p className={css.fine}>
              {iface === "CAN"
                ? "Vehicle bus: the BMS shares pack status with the vehicle controller and dashboard."
                : iface === "UART"
                  ? "Service port on many BMS boards, read with a USB-serial adapter and the BMS vendor's tool."
                  : "Wireless link to a phone app on some packs."}{" "}
              Message layouts vary by manufacturer and are not simulated.
            </p>
          </div>

          <figure className={css.barChart}>
            <figcaption>Cell-group voltages · SIMULATED</figcaption>
            <svg viewBox={`0 0 ${s.groupVoltages.length * 12 + 8} 110`} role="img" aria-label={`Cell-group voltages from ${formatNumber(vmin, "V", 3)} to ${formatNumber(vmax, "V", 3)}${highlightGroup !== null ? `; group ${highlightGroup + 1} highlighted` : ""}`}>
              {s.groupVoltages.map((v, g) => {
                const h = 20 + ((v - vmin) / span) * 80;
                return <rect key={g} x={4 + g * 12} y={104 - h} width={9} height={h} rx={1.5} fill={highlightGroup === g ? COLOR.highlight : voltageColor((v - avg) * 1000)} opacity={highlightGroup === null || highlightGroup === g ? 1 : 0.4} />;
              })}
            </svg>
          </figure>

          <div className={css.whyPanel} aria-live="polite">
            {why ? (
              <>
                <p className={css.panelLabel}>Why?</p>
                <p>{why.text}</p>
                {why.group !== null ? <p className={css.fine}>Group {why.group + 1} is highlighted in the 3D explorer and the chart.</p> : null}
              </>
            ) : (
              <p className={css.muted}>Abnormal fields show a WHY? button. Inject a fault in the next section to see one.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
