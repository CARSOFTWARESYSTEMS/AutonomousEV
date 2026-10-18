"use client";
// The 3D Battery Explorer: configurator, viewport, view modes, controls and
// the component panel. Every control is a button, so the model never depends
// on a mouse, and the text under the viewport says what the 3D view shows.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Box, ChevronLeft, ChevronRight, Expand, Eye, Minimize2, RotateCcw, RotateCw, ScanLine, ZoomIn, ZoomOut } from "lucide-react";
import { ARCHITECTURES, CELL_FORMATS, CHEMISTRIES, ENERGY_BANDS, PACK_LAYOUTS, VOLTAGE_CLASSES } from "@/data/ev-battery-toolkit/architectures";
import { COMPONENTS, COMPONENT_BY_ID, REPAIR_DEPTH } from "@/data/ev-battery-toolkit/components";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { layoutPack, packLabel } from "@/lib/ev-battery-toolkit/pack";
import { formatNumber } from "@/lib/ev-battery-toolkit/provenance";
import type { ComponentId } from "@/lib/ev-battery-toolkit/types";
import SceneBoundary from "../scene/SceneBoundary";
import { THERMAL_LEGEND, VOLTAGE_LEGEND } from "../scene/palette";
import { useDevice, useReducedMotion } from "../state/device";
import { useSimulation, useToolkit, type ViewMode } from "../state/store";
import { ContextBanner, ProvenanceBadge } from "../ui/Badges";
import { PackSchematic } from "../ui/Schematics";
import { Field } from "../ui/Field";
import css from "../workspace.module.css";

const PackCanvas = dynamic(() => import("../scene/PackCanvas"), {
  ssr: false,
  loading: () => (
    <p className={css.loading} role="status">
      Loading the 3D workspace…
    </p>
  ),
});

export const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "thermal", label: "Thermal" },
  { id: "voltage", label: "Cell Voltage" },
  { id: "current", label: "Current Flow" },
  { id: "bms", label: "BMS" },
];

/** Starts the workspace once, from whichever control the visitor used first. */
export function startWorkspace(source: string) {
  if (useToolkit.getState().markStarted()) trackToolkit("battery_3d_started", { source });
}

export function setViewTracked(view: ViewMode) {
  useToolkit.getState().setView(view);
  if (view === "thermal") trackToolkit("thermal_view_opened");
  if (view === "voltage") trackToolkit("cell_view_opened");
  if (view === "bms") trackToolkit("bms_view_opened");
}

function Chips<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; name: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className={css.chipSet}>
      <legend>{label}</legend>
      <div className={css.chips}>
        {options.map((o) => (
          <button key={o.id} type="button" className={css.chip} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const FORMAT_LAB: Record<string, string[]> = {
  cylindrical: ["Cylindrical cells", "Holders", "Parallel groups", "Series connections", "Interconnects", "Temperature sensing"],
  prismatic: ["Stacked cells", "Terminals", "Busbars", "Compression plates", "Insulation", "Temperature sensing"],
  pouch: ["Pouch stack", "Tabs", "Compression frame", "Thermal interface", "Swelling visualisation (inject Swelling)", "Temperature sensing"],
};

export default function Workspace() {
  const device = useDevice();
  const reducedMotion = useReducedMotion();
  const descId = useId();
  const { pack, fault, result } = useSimulation();
  const layout = useMemo(() => layoutPack(pack), [pack]);
  const s = useToolkit();
  const [lost, setLost] = useState(false);
  const [near, setNear] = useState(false);
  const [showScooter, setShowScooter] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const architecture = ARCHITECTURES[pack.config.architecture];
  const owner = s.audience === "owner";

  // The 3D chunk is requested only when the workspace approaches the screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || near) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // Stable, so the memoised 3D canvas is not re-rendered by unrelated store changes.
  const select = useCallback((id: ComponentId | null, group?: number) => {
    startWorkspace("model");
    const st = useToolkit.getState();
    st.select(id);
    st.setHighlightGroup(group ?? null);
    if (id) trackToolkit("component_selected", { component: id });
  }, []);
  const onLost = useCallback(() => setLost(true), []);

  const step = (dir: 1 | -1) => {
    const i = s.selected ? COMPONENTS.findIndex((c) => c.id === s.selected) : -1;
    const next = COMPONENTS[(i + dir + COMPONENTS.length) % COMPONENTS.length];
    select(next.id);
  };

  const control = (fn: () => void) => () => {
    startWorkspace("controls");
    fn();
  };

  const sel = s.selected ? COMPONENT_BY_ID[s.selected] : null;
  const snap = result.snapshot;
  const hottest = snap.groupTemps.reduce((best, t, g) => (t > snap.groupTemps[best] ? g : best), 0);
  const lowest = snap.groupVoltages.reduce((best, v, g) => (v < snap.groupVoltages[best] ? g : best), 0);
  const viewText: Record<ViewMode, string> = {
    normal: "Normal view: the pack as built.",
    thermal: `Thermal view: hottest group ${hottest + 1} at ${formatNumber(snap.groupTemps[hottest], "°C", 1)} (simulated true temperature); the BMS's hottest channel reads ${formatNumber(snap.maxTemp.value, "°C", 1)}.`,
    voltage: `Cell voltage view: groups coloured by deviation from the average; lowest is group ${lowest + 1} at ${formatNumber(snap.groupVoltages[lowest], "V", 3)}, delta ${formatNumber(snap.cellDeltaMv.value, "mV")}.`,
    current: `Current flow view: ${snap.packCurrent.value !== null && snap.packCurrent.value < 0 ? "charging" : "discharge"} path from the connector through fuse, current sensor and every series group; pack current ${formatNumber(snap.packCurrent.value, "A", 1)}.`,
    bms: "BMS view: voltage-sense harness to every group, temperature channels and the BMS board highlighted.",
  };
  const unknownFault = s.faultMode === "unknown" && s.faultId && !s.revealed;
  const canRender3D = device === "desktop" && !lost;

  return (
    <div className={css.workspace} ref={rootRef} onPointerDown={() => startWorkspace("pointer")}>
      <ContextBanner context="simulation" detail={fault ? (unknownFault ? "Unknown fault injected — diagnose from evidence." : `Injected fault: ${fault.name}`) : "Normal pack — no fault injected."} />

      <div className={css.layout}>
        {/* ── Configurator ── */}
        <aside className={css.config} aria-label="Battery configurator">
          <h3 className={css.panelTitle}>Battery configurator</h3>
          <Chips label="Chemistry" options={CHEMISTRIES} value={s.config.chemistry} onChange={(v) => s.setConfig({ chemistry: v })} />
          <Chips label="Cell format" options={CELL_FORMATS} value={s.config.format} onChange={(v) => s.setConfig({ format: v })} />
          <Chips label="Voltage" options={VOLTAGE_CLASSES} value={s.config.voltage} onChange={(v) => s.setConfig({ voltage: v })} />
          {s.config.voltage === "custom" ? (
            <Field className={css.field} label="Custom nominal voltage (V)">
              {(id) => (
                <input id={id} type="number" min={24} max={120} step={1} value={s.config.customVoltage} onChange={(e) => s.setConfig({ customVoltage: Number(e.target.value) })} />
              )}
            </Field>
          ) : null}
          <Chips label="Energy" options={ENERGY_BANDS} value={s.config.energy} onChange={(v) => s.setConfig({ energy: v })} />
          <Chips
            label="Architecture"
            options={PACK_LAYOUTS}
            value={s.config.layout}
            onChange={(v) => {
              s.setLayout(v);
              if (v === "fixed") trackToolkit("fixed_battery_selected");
              if (v === "swappable" || v === "removable" || v === "dual-pack") trackToolkit("swappable_battery_selected");
            }}
          />
          <div className={css.resolved}>
            <p className={css.resolvedLabel}>
              Resolved pack <ProvenanceBadge provenance="ESTIMATED" />
            </p>
            <p className={css.resolvedValue}>{packLabel(pack)}</p>
            <p className={css.resolvedNote}>
              {architecture.name} · {pack.modules} module{pack.modules > 1 ? "s" : ""} · {pack.totalCells} cells
              {layout.scaled ? " · cells drawn smaller to fit" : ""}
            </p>
          </div>
        </aside>

        {/* ── Viewport ── */}
        <div className={css.viewportCol}>
          <div className={css.toolbar} role="toolbar" aria-label="View mode">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={css.tool} aria-pressed={s.view === v.id} onClick={control(() => setViewTracked(v.id))}>
                {v.label}
              </button>
            ))}
          </div>
          <div className={css.viewport} id="workspace-viewport">
            {canRender3D && near ? (
              <SceneBoundary fallback={<PackSchematic pack={pack} sim={result} view={s.view} highlightGroup={s.highlightGroup} onGroup={(g) => select("cells", g)} title="2D schematic of the simulated pack" />} onError={onLost}>
                <PackCanvas label={`3D model of a ${packLabel(pack)} ${architecture.name}`} describedBy={descId} showScooter={showScooter} reducedMotion={reducedMotion} onSelect={select} onLost={onLost} />
              </SceneBoundary>
            ) : device === "pending" || (canRender3D && !near) ? (
              <p className={css.loading} role="status">
                Preparing the workspace…
              </p>
            ) : (
              <>
                <PackSchematic pack={pack} sim={result} view={s.view} highlightGroup={s.highlightGroup} onGroup={(g) => select("cells", g)} title="2D schematic of the simulated pack" />
                <p className={css.fallbackNote}>
                  {device === "mobile"
                    ? "2D schematic. Open this toolkit on a laptop or desktop for the complete interactive 3D diagnostic experience."
                    : "Interactive 3D is not available in this browser, so a 2D schematic is shown. Every view, fault and value works the same way."}
                </p>
              </>
            )}
            {canRender3D && near ? <p className={css.modelTag}>{showScooter ? "Generic procedural scooter — not OEM geometry" : "Educational pack representation — not an OEM pack"}</p> : null}
          </div>
          <div className={css.controls} role="toolbar" aria-label="3D controls">
            <button type="button" className={css.tool} onClick={control(() => s.sendCamera("rotate-left"))} aria-label="Rotate left" disabled={!canRender3D}>
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button type="button" className={css.tool} onClick={control(() => s.sendCamera("rotate-right"))} aria-label="Rotate right" disabled={!canRender3D}>
              <RotateCw size={16} aria-hidden="true" />
            </button>
            <button type="button" className={css.tool} onClick={control(() => s.sendCamera("zoom-in"))} aria-label="Zoom in" disabled={!canRender3D}>
              <ZoomIn size={16} aria-hidden="true" />
            </button>
            <button type="button" className={css.tool} onClick={control(() => s.sendCamera("zoom-out"))} aria-label="Zoom out" disabled={!canRender3D}>
              <ZoomOut size={16} aria-hidden="true" />
            </button>
            <span className={css.sep} aria-hidden="true" />
            <button
              type="button"
              className={css.tool}
              aria-pressed={s.xray}
              onClick={control(() => {
                s.setXray(!s.xray);
                if (!s.xray) trackToolkit("battery_xray_opened");
              })}
            >
              <ScanLine size={16} aria-hidden="true" /> X-Ray
            </button>
            <button
              type="button"
              className={css.tool}
              aria-pressed={s.exploded}
              onClick={control(() => {
                s.setExploded(!s.exploded);
                if (!s.exploded) trackToolkit("pack_exploded");
              })}
            >
              {s.exploded ? <Minimize2 size={16} aria-hidden="true" /> : <Expand size={16} aria-hidden="true" />} {s.exploded ? "Assemble" : "Explode"}
            </button>
            <button type="button" className={css.tool} aria-pressed={showScooter} onClick={control(() => setShowScooter(!showScooter))}>
              <Box size={16} aria-hidden="true" /> In scooter
            </button>
            <button
              type="button"
              className={css.tool}
              onClick={control(() => {
                s.sendCamera("reset");
                s.setExploded(false);
                s.setXray(false);
                s.setView("normal");
                s.select(null);
                s.setHighlightGroup(null);
              })}
            >
              <Eye size={16} aria-hidden="true" /> Reset View
            </button>
            <span className={css.sep} aria-hidden="true" />
            <button type="button" className={css.tool} onClick={() => step(-1)}>
              <ChevronLeft size={16} aria-hidden="true" /> Previous component
            </button>
            <button type="button" className={css.tool} onClick={() => step(1)}>
              Next component <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div className={css.loadRow} role="group" aria-label="Simulated load state">
            <span>Load state</span>
            {(["rest", "load", "charge"] as const).map((l) => (
              <button key={l} type="button" className={css.chip} aria-pressed={s.load === l} onClick={control(() => s.setLoad(l))}>
                {l === "rest" ? "At rest" : l === "load" ? "Under load" : "Charging"}
              </button>
            ))}
          </div>
          <p id={descId} className={css.describe} aria-live="polite">
            {packLabel(pack)} — {architecture.name}. {viewText[s.view]}
            {s.xray ? " X-ray on." : ""}
            {s.exploded ? " Exploded view: cover, gasket, modules, BMS and connectors pulled apart." : ""}
          </p>
          {s.view === "thermal" || s.view === "voltage" ? (
            <ul className={css.legend} aria-label={s.view === "thermal" ? "Temperature colour scale" : "Voltage deviation colour scale"}>
              {(s.view === "thermal" ? THERMAL_LEGEND : VOLTAGE_LEGEND).map((l) => (
                <li key={l.label}>
                  <span style={{ background: l.color }} aria-hidden="true" />
                  {l.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* ── Component panel ── */}
        <aside className={css.inspector} aria-label="Selected component" aria-live="polite">
          {sel ? (
            <>
              <p className={css.panelEyebrow}>Selected component</p>
              <h3 className={css.panelTitle}>{sel.name}</h3>
              <p className={css.panelText}>{sel.function}</p>
              {sel.id === "cells" && s.highlightGroup !== null ? (
                <dl className={css.miniDl}>
                  <div>
                    <dt>Group</dt>
                    <dd>{s.highlightGroup + 1}</dd>
                  </div>
                  <div>
                    <dt>Voltage</dt>
                    <dd>
                      {formatNumber(snap.groupVoltages[s.highlightGroup], "V", 3)} <ProvenanceBadge provenance="SIMULATED" />
                    </dd>
                  </div>
                  <div>
                    <dt>Temperature</dt>
                    <dd>
                      {formatNumber(snap.groupTemps[s.highlightGroup], "°C", 1)} <ProvenanceBadge provenance="SIMULATED" />
                    </dd>
                  </div>
                </dl>
              ) : null}
              <h4 className={css.panelSub}>Common faults</h4>
              <ul className={css.bullets}>
                {sel.commonFaults.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {owner ? (
                <p className={css.ownerNote}>Owner Mode: do not open the battery. If you suspect a problem with this part, book a professional inspection.</p>
              ) : (
                <>
                  <h4 className={css.panelSub}>Associated measurements</h4>
                  <ul className={css.bullets}>
                    {sel.measurements.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                  <p className={css.panelMeta}>
                    Repair depth: <strong>{REPAIR_DEPTH[sel.repairDepth].name}</strong>
                  </p>
                </>
              )}
              <p className={css.panelMeta}>Verification status: generic engineering representation, not verified for a specific vehicle.</p>
            </>
          ) : (
            <>
              <p className={css.panelEyebrow}>Components</p>
              <p className={css.panelText}>Select a part in the model, a group in the schematic, or a component below.</p>
              <ul className={css.componentList}>
                {COMPONENTS.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => select(c.id)}>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {sel ? (
            <button type="button" className={css.linkButton} onClick={() => select(null)}>
              Show all components
            </button>
          ) : null}
        </aside>
      </div>

      <div className={css.formatLab}>
        <p className={css.panelEyebrow}>Cell Format Lab · {CELL_FORMATS.find((f) => f.id === pack.config.format)?.name}</p>
        <p className={css.panelText}>{CELL_FORMATS.find((f) => f.id === pack.config.format)?.note}</p>
        <ul className={css.tagList}>
          {FORMAT_LAB[pack.config.format].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className={css.fine}>Educational engineering representations. They do not show any manufacturer&apos;s exact pack construction.</p>
      </div>
    </div>
  );
}
