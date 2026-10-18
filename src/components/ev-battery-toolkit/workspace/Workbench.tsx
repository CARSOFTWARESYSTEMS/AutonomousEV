"use client";
// The Virtual Diagnostic Workbench. Three tools are interactive in V1: the
// multimeter (guided test points, voltage measured in parallel), the thermal
// camera and the battery diagnostic interface. They read the simulation, so
// every reading is SIMULATED.
import { useState } from "react";
import { Activity, Cpu, Thermometer } from "lucide-react";
import { WORKBENCH_TOOLS } from "@/data/ev-battery-toolkit/content";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { formatNumber, round } from "@/lib/ev-battery-toolkit/provenance";
import type { CommInterface } from "@/lib/ev-battery-toolkit/types";
import { useSimulation, useToolkit } from "../state/store";
import { ProvenanceBadge } from "../ui/Badges";
import { setViewTracked, startWorkspace } from "./Workspace";
import { Field } from "../ui/Field";
import css from "../workspace.module.css";

interface Reading {
  label: string;
  value: string;
  note?: string;
}

export default function Workbench() {
  const { pack, result } = useSimulation();
  const s = result.snapshot;
  const [tool, setTool] = useState<"multimeter" | "thermal-camera" | "diag-interface">("multimeter");
  const [point, setPoint] = useState("pack");
  const [iface, setIface] = useState<CommInterface>("CAN");
  const [reading, setReading] = useState<Reading | null>(null);
  const owner = useToolkit((st) => st.audience === "owner");

  const points: { id: string; label: string }[] = [
    { id: "pack", label: "Pack + to Pack − (output terminals)" },
    ...pack.groupsPerModule.map((_, m) => ({ id: `module-${m}`, label: `Module ${m + 1} + to −` })),
    ...s.groupVoltages.map((_, g) => ({ id: `group-${g}`, label: `Cell group ${g + 1}` })),
  ];

  const measure = () => {
    startWorkspace("workbench");
    if (tool === "multimeter") {
      let value: number | null = null;
      let note: string | undefined;
      if (point === "pack") {
        value = s.packVoltage.value;
        note = s.packVoltage.note;
      } else if (point.startsWith("module-")) {
        const m = Number(point.split("-")[1]);
        const first = pack.groupsPerModule.slice(0, m).reduce((a, b) => a + b, 0);
        value = round(s.groupVoltages.slice(first, first + pack.groupsPerModule[m]).reduce((a, b) => a + b, 0), 2);
      } else {
        const g = Number(point.split("-")[1]);
        value = s.groupVoltages[g];
        useToolkit.getState().setHighlightGroup(g);
        useToolkit.getState().select("cells");
      }
      setReading({ label: points.find((p) => p.id === point)?.label ?? "Reading", value: formatNumber(value, "V", point.startsWith("group") ? 3 : 1), note });
    } else if (tool === "thermal-camera") {
      setViewTracked("thermal");
      const hottest = s.groupTemps.reduce((best, t, g) => (t > s.groupTemps[best] ? g : best), 0);
      const max = s.groupTemps[hottest];
      const bms = s.maxTemp.value;
      const hidden = bms !== null && max - bms > 3;
      setReading({
        label: `Hottest surface: group ${hottest + 1}`,
        value: formatNumber(max, "°C", 1),
        note: hidden ? `The BMS's hottest channel reads ${formatNumber(bms, "°C", 1)}: the hot spot sits between temperature sensors.` : "Matches the BMS temperature channels.",
      });
    } else {
      const link = s.comms[iface];
      if (link === "OFFLINE" || s.bmsState.value === "OFFLINE") {
        setReading({ label: `${iface} read`, value: "No response", note: "Not available. Check the BMS supply, wake-up and the communication harness." });
      } else {
        setReading({
          label: `${iface} read${link === "INTERMITTENT" ? " (intermittent link)" : ""}`,
          value: `${s.bmsState.value ?? "—"} · SOC ${formatNumber(s.soc.value, "%")} · ${formatNumber(s.packVoltage.value, "V", 1)}`,
          note: `Delta ${formatNumber(s.cellDeltaMv.value, "mV")} · max ${formatNumber(s.maxTemp.value, "°C", 1)} · faults: ${s.faultCodes.value?.length ? s.faultCodes.value.join(", ") : "none"}`,
        });
      }
    }
    trackToolkit("measurement_completed", { tool });
  };

  if (owner) {
    return (
      <div className={css.workbench}>
        <p className={css.ownerNote}>Owner Mode: the diagnostic workbench is for trained technicians. Do not measure or open a battery yourself; book a professional inspection.</p>
      </div>
    );
  }

  return (
    <div className={css.workbench}>
      <div className={css.benchTools} role="tablist" aria-label="Workbench tools">
        {(
          [
            ["multimeter", "Digital Multimeter", Activity],
            ["thermal-camera", "Thermal Camera", Thermometer],
            ["diag-interface", "Battery Diagnostic Interface", Cpu],
          ] as const
        ).map(([id, name, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tool === id}
            className={css.benchTab}
            onClick={() => {
              setTool(id);
              setReading(null);
            }}
          >
            <Icon size={16} aria-hidden="true" /> {name}
          </button>
        ))}
      </div>
      <div className={css.benchPanel} role="tabpanel">
        {tool === "multimeter" ? (
          <>
            <Field className={css.field} label="Test point">
              {(id) => (
                <select id={id} value={point} onChange={(e) => setPoint(e.target.value)}>
                  {points.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <p className={css.fine}>Voltage is measured in parallel across the two points. In a real workshop use a meter and leads rated for the pack voltage.</p>
          </>
        ) : tool === "thermal-camera" ? (
          <p className={css.panelText}>Captures the pack surface and switches the 3D view to Thermal. A thermal camera can see a hot spot that falls between the BMS&apos;s few temperature sensors.</p>
        ) : (
          <Field className={css.field} label="Interface">
            {(id) => (
              <select id={id} value={iface} onChange={(e) => setIface(e.target.value as CommInterface)}>
                {(["CAN", "UART", "BLE"] as const).map((i) => (
                  <option key={i} value={i}>
                    {i} — {s.comms[i]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        <button type="button" className={css.primary} onClick={measure}>
          {tool === "multimeter" ? "Measure" : tool === "thermal-camera" ? "Capture thermal image" : "Read BMS"}
        </button>
        {reading ? (
          <div className={css.reading} role="status">
            <p className={css.readingLabel}>
              {reading.label} <ProvenanceBadge provenance="SIMULATED" />
            </p>
            <p className={css.readingValue}>{reading.value}</p>
            {reading.note ? <p className={css.fine}>{reading.note}</p> : null}
          </div>
        ) : null}
      </div>
      <ul className={css.toolGrid} aria-label="Other workbench tools">
        {WORKBENCH_TOOLS.filter((t) => !t.interactive).map((t) => (
          <li key={t.id}>
            <span className={css.toolName}>{t.name}</span>
            <span className={css.toolUse}>{t.use}</span>
            <span className={css.toolState}>Concept · not simulated in V1</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
